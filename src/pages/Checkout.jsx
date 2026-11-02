
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Film,
  MapPin,
  CalendarDays,
  Clock,
  Armchair,
  Ticket,
  ArrowLeft,
  CreditCard,
} from "lucide-react";

import { api } from "../services/api";
import "./Checkout.css";

const BOOKING_STORAGE_KEY = "cinebook_pending_booking";

function Checkout() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const movie = state?.movie;
  const selectedSeats = state?.selectedSeats || state?.seats || [];

  const ticketPrice = state?.ticketPrice ?? 200;
  const total =
    state?.totalAmount ?? selectedSeats.length * ticketPrice;

  const cinemaHall =
    state?.cinema || state?.cinemaHall || "Not selected";

  const showDate = state?.showDate || "Not selected";
  const showTime = state?.showTime || "Not selected";

  const movieTitle =
    movie?.title || movie?.name || "Selected Movie";

  const poster = movie?.poster ||
    (movie?.poster_path
      ? movie.poster_path.startsWith("http")
        ? movie.poster_path
        : `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : "");

  async function handleContinueToPayment() {
    if (!movie || selectedSeats.length === 0) {
      alert("Booking details are missing.");
      navigate("/select-seats", {
        replace: true,
        state: { movie },
      });
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      const booking = {
        ...state,
        cinema: cinemaHall,
        selectedSeats,
        seats: selectedSeats,
        ticketPrice,
        totalAmount: total,
      };

      sessionStorage.setItem(
        BOOKING_STORAGE_KEY,
        JSON.stringify(booking)
      );

      navigate("/login", {
        state: {
          from: "/checkout",
          booking,
          message: "Please log in before proceeding.",
        },
      });

      return;
    }

    try {
      setSaving(true);
      setSaveError("");

      await api.createBooking({
        movie: {
          id: movie.id || movie._id,
          title: movieTitle,
          poster,
          genre: movie.genre || "",
        },
        cinema: cinemaHall,
        showDate,
        showTime,
        selectedSeats,
        ticketPrice,
      });

      sessionStorage.removeItem(BOOKING_STORAGE_KEY);

      alert(
        "Your booking has been saved! Payment is still pending."
      );

      navigate("/my-bookings");
    } catch (error) {
      setSaveError(
        error.message || "Unable to save your booking."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleBackToSeats() {
    navigate("/select-seats", {
      state: {
        movie,
        cinema: cinemaHall,
        showDate,
        showTime,
        selectedSeats,
      },
    });
  }

  if (!movie || selectedSeats.length === 0) {
    return (
      <main className="checkout-page page-animation">
        <section className="checkout-card checkout-empty">
          <Ticket size={38} />
          <h1>Booking details missing</h1>
          <p>Please select a movie and seats before proceeding.</p>
          <button
            className="primary-button"
            onClick={() => navigate("/")}
          >
            Browse Movies
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="checkout-page page-animation">
      <div className="checkout-heading">
        <span className="section-kicker">ALMOST THERE</span>
        <h1>Review your booking</h1>
        <p>Make sure everything looks right before continuing.</p>
      </div>

      <section className="checkout-card">
        <div className="checkout-movie">
          {poster ? (
            <img src={poster} alt={movieTitle} />
          ) : (
            <div className="checkout-poster-fallback">
              <Film size={30} />
            </div>
          )}

          <div className="checkout-movie-info">
            <span className="details-kicker">YOUR MOVIE</span>
            <h2>{movieTitle}</h2>
            {movie.genre && <p>{movie.genre}</p>}
          </div>
        </div>

        <div className="checkout-details-grid">
          <div className="checkout-detail">
            <MapPin />
            <span>Cinema</span>
            <strong>{cinemaHall}</strong>
          </div>

          <div className="checkout-detail">
            <CalendarDays />
            <span>Show date</span>
            <strong>{showDate}</strong>
          </div>

          <div className="checkout-detail">
            <Clock />
            <span>Show time</span>
            <strong>{showTime}</strong>
          </div>

          <div className="checkout-detail">
            <Armchair />
            <span>Selected seats</span>
            <strong>{selectedSeats.join(", ")}</strong>
          </div>
        </div>

        <div className="checkout-price-list">
          <div>
            <span>Tickets ({selectedSeats.length})</span>
            <strong>₹{ticketPrice} × {selectedSeats.length}</strong>
          </div>

          <div>
            <span>Convenience fee</span>
            <strong>₹0</strong>
          </div>

          <div className="checkout-total">
            <span>Total amount</span>
            <strong>₹{total}</strong>
          </div>
        </div>

        {saveError && (
          <p role="alert" style={{ color: "#ff8fa3" }}>
            {saveError}
          </p>
        )}

        <button
          className="confirm-booking-button"
          onClick={handleContinueToPayment}
          disabled={saving}
        >
          <CreditCard size={18} />
          {saving ? "Saving Booking..." : "Continue to Payment"}
        </button>

        <button
          className="back-button"
          onClick={handleBackToSeats}
          disabled={saving}
        >
          <ArrowLeft size={16} />
          Back to Seats
        </button>

        <p className="checkout-secure-note">
          Your booking is saved with pending payment status.
        </p>
      </section>
    </main>
  );
}

export default Checkout;
