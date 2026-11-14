const mongoose = require("mongoose");

// One document per seat per show.
//
// - While a customer is checking out, the seat is "held": `expiresAt` is set
//   and the hold disappears automatically once that time passes.
// - Once the booking is saved, `booking` is set and `expiresAt` is removed,
//   so the seat stays taken permanently.
//
// The unique index on (show + seat) is what prevents two people from ever
// holding or booking the same seat: MongoDB rejects the second insert.
const seatHoldSchema = new mongoose.Schema(
  {
    movieId: { type: String, required: true },
    cinema: { type: String, required: true },
    showDate: { type: String, required: true },
    showTime: { type: String, required: true },
    seat: { type: String, required: true },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },

    expiresAt: { type: Date },
  },
  { timestamps: true }
);

seatHoldSchema.index(
  { movieId: 1, cinema: 1, showDate: 1, showTime: 1, seat: 1 },
  { unique: true }
);

// MongoDB removes expired holds in the background (roughly once a minute).
// Documents without `expiresAt` (confirmed bookings) are never removed.
seatHoldSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("SeatHold", seatHoldSchema);
