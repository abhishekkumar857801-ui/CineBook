const express = require("express");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const Booking = require("../models/booking");
const User = require("../models/user");

// Movies come from TMDB, so the admin area only covers bookings and users.

const router = express.Router();

// All routes in this file require administrator access.
router.use(protect, adminOnly);

// Dashboard statistics
router.get("/stats", async (req, res) => {
  try {
    const [bookingCount, userCount, totals] = await Promise.all([
      Booking.countDocuments(),
      User.countDocuments(),
      Booking.aggregate([
        {
          $group: {
            _id: null,
            amount: { $sum: "$totalAmount" },
            seats: { $sum: { $size: "$seats" } },
          },
        },
      ]),
    ]);

    res.json({
      bookings: bookingCount,
      users: userCount,
      totalAmount: totals[0]?.amount || 0,
      seatsBooked: totals[0]?.seats || 0,
    });
  } catch (error) {
    console.error("Admin statistics error:", error.message);
    res.status(500).json({
      message: "Unable to load dashboard statistics.",
    });
  }
});

// Get all bookings for admin
router.get("/bookings", async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error("Admin bookings error:", error.message);

    res.status(500).json({
      message: "Unable to load admin bookings.",
    });
  }
});

module.exports = router;
