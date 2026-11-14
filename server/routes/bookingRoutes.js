const express = require("express");
const Booking = require("../models/booking");
const SeatHold = require("../models/seatHold");
const { protect, optionalAuth } = require("../middleware/authMiddleware");

const router = express.Router();

// Prices are decided by the server so customers cannot change them.
const TICKET_PRICE = 200;

// How long selected seats stay reserved while the customer checks out.
const HOLD_MINUTES = 10;

const SEAT_PATTERN = /^[A-Z][0-9]{1,2}$/;
const MAX_SEATS_PER_BOOKING = 10;

// Read and validate the show (movie + cinema + date + time) from a request.
function getShow(source) {
  const show = {
    movieId: String(source.movieId ?? "").trim(),
    cinema: String(source.cinema ?? "").trim(),
    showDate: String(source.showDate ?? "").trim(),
    showTime: String(source.showTime ?? "").trim(),
  };

  return Object.values(show).every(Boolean) ? show : null;
}

function cleanSeats(seats) {
  if (!Array.isArray(seats)) return null;

  const unique = [...new Set(seats.map((seat) => String(seat).toUpperCase()))];

  if (
    unique.length === 0 ||
    unique.length > MAX_SEATS_PER_BOOKING ||
    !unique.every((seat) => SEAT_PATTERN.test(seat))
  ) {
    return null;
  }

  return unique;
}

// GET /api/bookings/seats?movieId=&cinema=&showDate=&showTime=
// Public: which seats are booked, held by someone else, or held by me.
router.get("/seats", optionalAuth, async (req, res) => {
  try {
    const show = getShow(req.query);

    if (!show) {
      return res.status(400).json({ message: "Show details are required." });
    }

    const now = new Date();
    const holds = await SeatHold.find(show).lean();

    const booked = [];
    const held = [];
    const mine = [];
    let myHoldExpiresAt = null;

    for (const hold of holds) {
      if (hold.booking) {
        booked.push(hold.seat);
      } else if (hold.expiresAt > now) {
        if (req.user && String(hold.user) === String(req.user._id)) {
          mine.push(hold.seat);
          myHoldExpiresAt = hold.expiresAt;
        } else {
          held.push(hold.seat);
        }
      }
    }

    res.json({ booked, held, mine, myHoldExpiresAt });
  } catch (error) {
    console.error("Seat availability error:", error.message);
    res.status(500).json({ message: "Unable to load seat availability." });
  }
});

// Everything below requires login.
router.use(protect);

// POST /api/bookings/hold
// Reserve seats for HOLD_MINUTES. Replaces any earlier hold this customer
// had for the same show. Seats already held by this customer keep their
// original expiry time, so refreshing the page cannot extend a hold forever.
router.post("/hold", async (req, res) => {
  try {
    const show = getShow(req.body);
    const seats = cleanSeats(req.body.seats);

    if (!show || !seats) {
      return res.status(400).json({
        message: `Choose between 1 and ${MAX_SEATS_PER_BOOKING} valid seats.`,
      });
    }

    const userId = req.user._id;
    const now = new Date();

    // Let go of seats this customer no longer wants.
    await SeatHold.deleteMany({
      ...show,
      user: userId,
      booking: null,
      seat: { $nin: seats },
    });

    // Clear holds that have expired but not yet been removed by MongoDB.
    await SeatHold.deleteMany({
      ...show,
      seat: { $in: seats },
      booking: null,
      expiresAt: { $lte: now },
    });

    const existing = await SeatHold.find({
      ...show,
      user: userId,
      booking: null,
      seat: { $in: seats },
    }).lean();

    const alreadyMine = new Set(existing.map((hold) => hold.seat));
    const expiresAt = existing.length
      ? new Date(Math.min(...existing.map((hold) => hold.expiresAt.getTime())))
      : new Date(now.getTime() + HOLD_MINUTES * 60 * 1000);

    const newHolds = seats
      .filter((seat) => !alreadyMine.has(seat))
      .map((seat) => ({ ...show, seat, user: userId, expiresAt }));

    const inserted = [];
    const unavailable = [];

    // Insert one seat at a time; the unique index rejects taken seats.
    for (const hold of newHolds) {
      try {
        const doc = await SeatHold.create(hold);
        inserted.push(doc._id);
      } catch (error) {
        if (error.code === 11000) {
          unavailable.push(hold.seat);
        } else {
          throw error;
        }
      }
    }

    if (unavailable.length) {
      // All or nothing: release the seats we just took.
      await SeatHold.deleteMany({ _id: { $in: inserted } });

      return res.status(409).json({
        message: `Sorry, ${unavailable.join(", ")} ${
          unavailable.length === 1 ? "was" : "were"
        } just taken. Please choose other seats.`,
        unavailable,
      });
    }

    res.json({
      message: "Seats held.",
      seats,
      expiresAt,
      holdMinutes: HOLD_MINUTES,
    });
  } catch (error) {
    console.error("Hold seats error:", error.message);
    res.status(500).json({ message: "Unable to hold seats." });
  }
});

// DELETE /api/bookings/hold
// Release every seat this customer is holding for a show.
router.delete("/hold", async (req, res) => {
  try {
    const show = getShow(req.body);

    if (!show) {
      return res.status(400).json({ message: "Show details are required." });
    }

    await SeatHold.deleteMany({ ...show, user: req.user._id, booking: null });

    res.json({ message: "Seats released." });
  } catch (error) {
    console.error("Release seats error:", error.message);
    res.status(500).json({ message: "Unable to release seats." });
  }
});

// GET /api/bookings/my-bookings
router.get("/my-bookings", async (req, res) => {
  try {
    const bookings = await Booking.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error("Fetch my bookings error:", error.message);

    res.status(500).json({
      message: "Unable to load your bookings.",
    });
  }
});

// POST /api/bookings
// Turn the customer's current seat hold into a booking.
router.post("/", async (req, res) => {
  try {
    const { movie } = req.body;
    const movieTitle = movie?.title || movie?.name;
    const show = getShow({ ...req.body, movieId: movie?.id });
    const seats = cleanSeats(req.body.seats || req.body.selectedSeats);

    if (!movieTitle || !show || !seats) {
      return res.status(400).json({
        message: "Complete movie and booking details are required.",
      });
    }

    const holds = await SeatHold.find({
      ...show,
      user: req.user._id,
      booking: null,
      seat: { $in: seats },
      expiresAt: { $gt: new Date() },
    });

    if (holds.length !== seats.length) {
      return res.status(409).json({
        message:
          "Your seat hold has expired or these seats are no longer yours. Please choose your seats again.",
        code: "HOLD_EXPIRED",
      });
    }

    const booking = await Booking.create({
      user: req.user._id,

      movie: {
        tmdbId: show.movieId,
        title: movieTitle,
        poster: movie?.poster || "",
        genre: typeof movie?.genre === "string" ? movie.genre : "",
      },

      cinema: show.cinema,
      showDate: show.showDate,
      showTime: show.showTime,
      seats,
      ticketPrice: TICKET_PRICE,
      totalAmount: TICKET_PRICE * seats.length,

      status: "Pending",
      paymentStatus: "Pending",
    });

    // Make the seats permanently taken (and stop them from expiring).
    await SeatHold.updateMany(
      { _id: { $in: holds.map((hold) => hold._id) } },
      { $set: { booking: booking._id }, $unset: { expiresAt: 1 } }
    );

    res.status(201).json({
      message: "Booking saved successfully. Payment is pending.",
      booking,
    });
  } catch (error) {
    console.error("Create booking error:", error.message);

    res.status(500).json({
      message: "Unable to create booking.",
    });
  }
});

module.exports = router;
