
const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    poster: {
      type: String,
      default: "",
    },
    genre: {
      type: String,
      default: "Drama",
    },
    duration: {
      type: Number,
      default: 120,
    },
    language: {
      type: String,
      default: "English",
    },
    rating: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      default: 200,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Movie", movieSchema);
