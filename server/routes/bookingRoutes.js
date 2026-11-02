
const express = require("express");
const Booking = require("../models/booking");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// All booking routes require login
router.use(protect);

// Get bookings belonging to the logged-in customer
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

// Create a new booking
router.post("/", async (req, res) => {
  try {
    const {
      movie,
      cinema,
      cinemaHall,
      showDate,
      showTime,
      selectedSeats,
      seats,
      ticketPrice,
    } = req.body;

    const movieTitle = movie?.title || movie?.name;

    const chosenSeats = selectedSeats || seats;
    const selectedCinema = cinema || cinemaHall;

    if (
      !movieTitle ||
      !selectedCinema ||
      !showDate ||
      !showTime ||
      !Array.isArray(chosenSeats) ||
      chosenSeats.length === 0
    ) {
      return res.status(400).json({
        message: "Complete movie and booking details are required.",
      });
    }

    const price = Number(ticketPrice ?? 200);

    if (!Number.isFinite(price) || price < 0) {
      return res.status(400).json({
        message: "Invalid ticket price.",
      });
    }

    const uniqueSeats = [...new Set(chosenSeats.map(String))];

    const booking = await Booking.create({
      user: req.user._id,

      movie: {
        tmdbId: movie?.id ? String(movie.id) : "",
        title: movieTitle,
        poster: movie?.poster || movie?.poster_path || "",
        genre: typeof movie?.genre === "string"
          ? movie.genre
          : "",
      },

      cinema: selectedCinema,
      showDate,
      showTime,
      seats: uniqueSeats,
      ticketPrice: price,
      totalAmount: price * uniqueSeats.length,

      status: "Pending",
      paymentStatus: "Pending",
    });

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
