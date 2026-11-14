
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const tmdbRoutes = require("./routes/tmdbRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

const app = express();

// Only let our own website call the API from a browser.
// Any localhost port is allowed for development; for a deployed site, set
// CLIENT_URL in .env (comma-separated for several, e.g. "https://cinebook.in").
const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      const isLocal = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(
        origin || ""
      );
      // No origin = not a browser (curl, scripts, server-to-server).
      callback(null, !origin || isLocal || allowedOrigins.includes(origin));
    },
  })
);
app.use(express.json());

// Express 5 leaves req.body undefined when no JSON body is sent.
app.use((req, res, next) => {
  req.body ??= {};
  next();
});

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the CineBook API!",
  });
});

// API routes
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
