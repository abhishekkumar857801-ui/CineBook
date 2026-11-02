
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    movie: {
      tmdbId: String,
      title: {
        type: String,
        required: true,
      },
      poster: String,
      genre: String,
    },

    cinema: {
      type: String,
      required: true,
    },

    showDate: {
      type: String,
      required: true,
    },

    showTime: {
      type: String,
      required: true,
    },

    seats: {
      type: [String],
      required: true,
      validate: {
        validator: (seats) => seats.length > 0,
        message: "At least one seat must be selected.",
      },
    },

    ticketPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Cancelled"],
      default: "Pending",
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Booking", bookingSchema);
