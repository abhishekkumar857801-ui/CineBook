
const express = require("express");
const Movie = require("../models/Movie");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const Booking = require("../models/booking");
const router = express.Router();

// All routes in this file require administrator access.
router.use(protect, adminOnly);

// Dashboard statistics
router.get("/stats", async (req, res) => {
  try {
    const movieCount = await Movie.countDocuments();

    res.json({
      movies: movieCount,
      bookings: 0,
      users: 0,
      message: "Movie statistics loaded successfully.",
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
// List all movies for the admin
router.get("/movies", async (req, res) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 });
    res.json(movies);
  } catch (error) {
    console.error("Admin movies error:", error.message);
    res.status(500).json({
      message: "Unable to load movies.",
    });
  }
});

// Add a movie
router.post("/movies", async (req, res) => {
  try {
    const {
      title,
      description,
      poster,
      genre,
      duration,
      language,
      rating,
      price,
    } = req.body;

    if (
      !title?.trim() ||
      !description?.trim() ||
      !poster?.trim() ||
      !genre?.trim() ||
      !language?.trim() ||
      !Number.isFinite(Number(duration)) ||
      Number(duration) <= 0 ||
      !Number.isFinite(Number(price)) ||
      Number(price) <= 0
    ) {
      return res.status(400).json({
        message: "Please provide valid movie details.",
      });
    }

    const movie = await Movie.create({
      title: title.trim(),
      description: description.trim(),
      poster: poster.trim(),
      genre: genre.trim(),
      duration: Number(duration),
      language: language.trim(),
      rating:
        rating === undefined || rating === ""
          ? 0
          : Number(rating),
      price: Number(price),
    });

    res.status(201).json({
      message: "Movie added successfully.",
      movie,
    });
  } catch (error) {
    console.error("Add movie error:", error.message);
    res.status(500).json({
      message: "Unable to add movie.",
    });
  }
});

// Update a movie
router.put("/movies/:id", async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!movie) {
      return res.status(404).json({
        message: "Movie not found.",
      });
    }

    res.json({
      message: "Movie updated successfully.",
      movie,
    });
  } catch (error) {
    console.error("Update movie error:", error.message);
    res.status(400).json({
      message: "Unable to update movie. Check the supplied details.",
    });
  }
});

// Delete a movie
router.delete("/movies/:id", async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);

    if (!movie) {
      return res.status(404).json({
        message: "Movie not found.",
      });
    }

    res.json({
      message: "Movie deleted successfully.",
    });
  } catch (error) {
    console.error("Delete movie error:", error.message);
    res.status(400).json({
      message: "Unable to delete movie.",
    });
  }
});

module.exports = router;
