
const express = require("express");

const router = express.Router();

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

async function fetchFromTMDB(endpoint) {
  const token = process.env.TMDB_READ_ACCESS_TOKEN;

  if (!token) {
    throw new Error("TMDB API token is missing from server/.env");
  }

  const response = await fetch(`${TMDB_BASE_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      accept: "application/json",
    },
  });

  if (!response.ok) {
    const error = new Error("Failed to fetch movies from TMDB");
    error.status = response.status;
    throw error;
  }

  return response.json();
}

// GET /api/tmdb/popular
router.get("/popular", async (req, res) => {
  try {
    const data = await fetchFromTMDB("/movie/popular");

    res.json(data.results);
  } catch (error) {
    console.error("TMDB popular movies error:", error.message);

    res.status(error.status || 500).json({
      message: "Unable to load popular movies from TMDB.",
    });
  }
});

// GET /api/tmdb/search?query=Inception
router.get("/search", async (req, res) => {
  try {
    const query = String(req.query.query || "").trim();

    if (!query) {
      return res.status(400).json({
        message: "Please provide a movie search query.",
      });
    }

    const data = await fetchFromTMDB(
      `/search/movie?query=${encodeURIComponent(query)}`
    );

    res.json(data.results);
  } catch (error) {
    console.error("TMDB search error:", error.message);

    res.status(error.status || 500).json({
      message: "Unable to search movies on TMDB.",
    });
  }
});

module.exports = router;
