
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const movieRoutes = require("./routes/movieRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const tmdbRoutes = require("./routes/tmdbRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the CineBook API!",
  });
});

// Movie routes
app.use("/api/movies", movieRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/tmdb", tmdbRoutes);
app.use("/api/bookings", bookingRoutes);

const PORT = process.env.PORT || 5002;

async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`CineBook server running on port ${PORT}`);
  });
}

startServer();
