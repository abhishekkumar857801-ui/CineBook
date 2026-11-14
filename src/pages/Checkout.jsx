import { useEffect, useState } from "react";
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
  Timer,
} from "lucide-react";

import { api } from "../services/api";
import { TICKET_PRICE, getMovieId, getShow } from "../services/show";
import "./Checkout.css";

const BOOKING_STORAGE_KEY = "cinebook_pending_booking";

function formatRemaining(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function Checkout() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // When the seat hold ends (ISO string from the server).
  const [holdExpiresAt, setHoldExpiresAt] = useState(
    state?.holdExpiresAt || null
  );
  const [holdError, setHoldError] = useState("");
  const [now, setNow] = useState(() => Date.now());

  const movie = state?.movie;
  const selectedSeats = state?.selectedSeats || state?.seats || [];

  const ticketPrice = TICKET_PRICE;
  const total = selectedSeats.length * ticketPrice;

  const cinemaHall = state?.cinema || state?.cinemaHall || "";
  const showDate = state?.showDate || "";
  const showTime = state?.showTime || "";

  const movieTitle =
    movie?.title || movie?.name || "Selected Movie";

  const poster = movie?.poster ||
    (movie?.poster_path
      ? movie.poster_path.startsWith("http")
        ? movie.poster_path
        : `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : "");

  const hasBooking = Boolean(movie && selectedSeats.length);
  const isLoggedIn = Boolean(localStorage.getItem("token"));

  const show = getShow({ movie, cinema: cinemaHall, showDate, showTime });
  const seatKey = selectedSeats.join(",");

  // Make sure the seats are held for this customer. This covers arriving
  // here straight after logging in. Holding again never extends the timer.
  useEffect(() => {
    if (!hasBooking || !isLoggedIn) return;

    let active = true;

    api
      .holdSeats(show, selectedSeats)
      .then((hold) => {
        if (active) {
          setHoldExpiresAt(hold.expiresAt);
          setHoldError("");
        }
      })
      .catch((error) => {
        if (active) setHoldError(error.message || "Unable to hold your seats.");
      });

    return () => {
      active = false;
    };
    // show/selectedSeats are rebuilt every render; seatKey + show fields cover them.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasBooking, isLoggedIn, show.movieId, cinemaHall, showDate, showTime, seatKey]);

  // Tick the countdown every second.
  useEffect(() => {
    if (!holdExpiresAt) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [holdExpiresAt]);

  const remainingMs = holdExpiresAt
    ? new Date(holdExpiresAt).getTime() - now
    : null;
  const holdExpired = remainingMs !== null && remainingMs <= 0;

  async function handleContinueToPayment() {
    if (!hasBooking) {
      navigate("/select-seats", { replace: true, state: { movie } });
      return;
    }

    if (!isLoggedIn) {
      const booking = {
        ...state,
        cinema: cinemaHall,
        selectedSeats,
        seats: selectedSeats,
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
          id: getMovieId(movie),
          title: movieTitle,
          poster,
          genre: typeof movie.genre === "string" ? movie.genre : "",
        },
        cinema: cinemaHall,
        showDate,
        showTime,
        seats: selectedSeats,
      });

      sessionStorage.removeItem(BOOKING_STORAGE_KEY);

      navigate("/my-bookings", {
        state: {
          message: "Your seats are booked! Payment is still pending.",
        },
      });
    } catch (error) {
      setSaveError(
        error.message || "Unable to save your booking."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleBackToSeats() {
    // Give the seats back so other people can pick them.
    if (isLoggedIn && hasBooking) {
      api.releaseSeats(show).catch(() => {});
    }

    navigate("/select-seats", {
      state: {
        movie,
        cinema: cinemaHall,
        showDate,
        showTime,
        selectedSeats: holdExpired || holdError ? [] : selectedSeats,
      },
    });
  }

  if (!hasBooking) {
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

  const holdBlocked = Boolean(holdError) || holdExpired;

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
            {typeof movie.genre === "string" && movie.genre !== "Movie" && (
              <p>{movie.genre}</p>
            )}
          </div>
        </div>

        <div className="checkout-details-grid">
          <div className="checkout-detail">
            <MapPin />
            <span>Cinema</span>
            <strong>{cinemaHall || "Not selected"}</strong>
          </div>

          <div className="checkout-detail">
            <CalendarDays />
            <span>Show date</span>
            <strong>{showDate || "Not selected"}</strong>
          </div>

          <div className="checkout-detail">
            <Clock />
            <span>Show time</span>
            <strong>{showTime || "Not selected"}</strong>
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

        {isLoggedIn && holdError && (
          <p className="hold-timer expired" role="alert">
            {holdError}
          </p>
        )}

        {isLoggedIn && !holdError && remainingMs !== null && (
          <p
            className={`hold-timer ${
              holdExpired ? "expired" : remainingMs < 60000 ? "urgent" : ""
            }`}
            role="status"
          >
            <Timer size={16} />
            {holdExpired ? (
              "Your seat hold has expired. Please choose your seats again."
            ) : (
              <>
                Seats reserved for you for{" "}
                <strong>{formatRemaining(remainingMs)}</strong>
              </>
            )}
          </p>
        )}

        {saveError && (
          <p className="checkout-error" role="alert">
            {saveError}
          </p>
        )}

        <button
          className="confirm-booking-button"
          onClick={handleContinueToPayment}
          disabled={saving || (isLoggedIn && (holdBlocked || !holdExpiresAt))}
        >
          <CreditCard size={18} />
          {saving
            ? "Saving Booking..."
            : isLoggedIn
              ? "Confirm Booking"
              : "Log in to Continue"}
        </button>

        <button
          className="back-button"
          onClick={handleBackToSeats}
          disabled={saving}
        >
          <ArrowLeft size={16} />
          {holdBlocked ? "Choose Seats Again" : "Back to Seats"}
        </button>

        <p className="checkout-secure-note">
          Seats are held for 10 minutes. Your booking is saved with pending
          payment status.
        </p>
      </section>
    </main>
  );
}

export default Checkout;
