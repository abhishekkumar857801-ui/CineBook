import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { TICKET_PRICE, getShow } from "../services/show";
import "./SelectSeats.css";

const BOOKING_STORAGE_KEY = "cinebook_pending_booking";

// How often to refresh seat availability while the page is open.
const AVAILABILITY_REFRESH_MS = 15000;

const cinemaOptions = [
  "INOX: Megaplex Mall of Asia Bangalore",
  "PVR: Orion Mall Bangalore",
  "Cinepolis: Nexus Mall Bangalore",
];

const showTimes = [
  "11:45 AM",
  "1:20 PM",
  "4:45 PM",
  "6:30 PM",
  "9:30 PM",
];

const rows = ["G", "F", "E", "D", "C", "B", "A"];
const seatsPerRow = 16;

function getLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDateOptions() {
  const dates = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);

    dates.push({
      value: getLocalDate(date),
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      date: date.getDate(),
    });
  }

  return dates;
}

function SelectSeats() {
  const location = useLocation();
  const navigate = useNavigate();

  const movie = location.state?.movie;
  const dateOptions = getDateOptions();

  const [cinema, setCinema] = useState(
    cinemaOptions.includes(location.state?.cinema)
      ? location.state.cinema
      : cinemaOptions[0]
  );
  const [showDate, setShowDate] = useState(
    location.state?.showDate || dateOptions[0].value
  );
  const [showTime, setShowTime] = useState(
    location.state?.showTime || showTimes[0]
  );
  const [selectedSeats, setSelectedSeats] = useState(
    location.state?.selectedSeats || []
  );

  // Seats other people have booked or are currently holding.
  const [bookedSeats, setBookedSeats] = useState([]);
  const [heldSeats, setHeldSeats] = useState([]);
  const [availabilityLoaded, setAvailabilityLoaded] = useState(false);

  const [holding, setHolding] = useState(false);
  const [message, setMessage] = useState("");

  const movieId = getShow({ movie }).movieId;

  const loadAvailability = useCallback(async () => {
    if (!movieId) return;

    try {
      const data = await api.getSeatAvailability({
        movieId,
        cinema,
        showDate,
        showTime,
      });

      setBookedSeats(data.booked || []);
      setHeldSeats(data.held || []);
      setAvailabilityLoaded(true);

      // Drop any of my selected seats that someone else has taken meanwhile.
      const taken = new Set([...(data.booked || []), ...(data.held || [])]);
      setSelectedSeats((previous) => {
        const stillFree = previous.filter((seat) => !taken.has(seat));
        if (stillFree.length !== previous.length) {
          setMessage(
            "Some of your selected seats were just taken by someone else."
          );
        }
        return stillFree;
      });
    } catch (error) {
      console.error("Seat availability error:", error);
    }
  }, [movieId, cinema, showDate, showTime]);

  useEffect(() => {
    setAvailabilityLoaded(false);
    loadAvailability();

    const timer = setInterval(loadAvailability, AVAILABILITY_REFRESH_MS);
    return () => clearInterval(timer);
  }, [loadAvailability]);

  if (!movie) {
    return (
      <main className="movie-details-page page-animation">
        <div className="details-empty">
          <h2>No movie selected</h2>
          <p>Please choose a movie from the homepage first.</p>
          <button className="primary-button" onClick={() => navigate("/")}>
            Browse Movies
          </button>
        </div>
      </main>
    );
  }

  const posterUrl = movie.poster_path
    ? movie.poster_path.startsWith("http")
      ? movie.poster_path
      : `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : movie.poster || "";

  const title = movie.title || movie.name || "Selected Movie";

  const totalAmount = selectedSeats.length * TICKET_PRICE;

  function isUnavailable(seatId) {
    return bookedSeats.includes(seatId) || heldSeats.includes(seatId);
  }

  // Seats belong to one show, so changing the show clears the selection.
  function changeShow(setter, value) {
    setter(value);
    setSelectedSeats([]);
    setMessage("");
  }

  const toggleSeat = (seatId) => {
    if (isUnavailable(seatId)) return;

    setMessage("");
    setSelectedSeats((previous) =>
      previous.includes(seatId)
        ? previous.filter((seat) => seat !== seatId)
        : previous.length >= 10
          ? previous
          : [...previous, seatId]
    );
  };

  const bookingData = {
    movie,
    cinema,
    showDate,
    showTime,
    selectedSeats,
    seats: selectedSeats,
    totalAmount,
    ticketPrice: TICKET_PRICE,
  };

  const handleContinue = async () => {
    if (selectedSeats.length === 0) {
      setMessage("Please select at least one seat.");
      return;
    }

    // Seats can only be held for a logged-in customer.
    const token = localStorage.getItem("token");

    if (!token) {
      // Preserve the complete booking before redirecting to login.
      sessionStorage.setItem(
        BOOKING_STORAGE_KEY,
        JSON.stringify(bookingData)
      );

      navigate("/login", {
        state: {
          from: "/checkout",
          booking: bookingData,
          message: "Please log in to reserve your seats.",
        },
      });

      return;
    }

    try {
      setHolding(true);
      setMessage("");

      const hold = await api.holdSeats(
        getShow(bookingData),
        selectedSeats
      );

      navigate("/checkout", {
        state: { ...bookingData, holdExpiresAt: hold.expiresAt },
      });
    } catch (error) {
      setMessage(error.message || "Unable to reserve these seats.");
      loadAvailability();
    } finally {
      setHolding(false);
    }
  };

  return (
    <div className="cinema-booking-page">

      {/* Date Selection */}
      <div className="date-navigation">
        <div className="calendar-icon">▦</div>

        {dateOptions.map((date) => (
          <button
            type="button"
            key={date.value}
            className={`date-option ${
              showDate === date.value ? "active" : ""
            }`}
            onClick={() => changeShow(setShowDate, date.value)}
          >
            <span>{date.day}</span>
            <strong>{date.date}</strong>
          </button>
        ))}
      </div>

      {/* Main Booking Layout */}
      <main className="cinema-booking-layout">

        {/* Left Movie Details */}
        <section className="movie-information">

          <div className="movie-details">

            <div className="movie-poster">
              {posterUrl ? (
                <img src={posterUrl} alt={title} />
              ) : (
                <div className="poster-placeholder">
                  <span>🎬</span>
                  <p>CineBook</p>
                </div>
              )}
            </div>

            <div className="movie-description">
              <h1>{title}</h1>

              <p className="movie-meta">
                {movie.release_date?.slice(0, 4) || "Now Showing"}
                {" · "}
                {movie.runtime
                  ? `${movie.runtime} min`
                  : "Movie"}
              </p>

              <p className="movie-overview">
                {movie.overview ||
                  "Book your tickets and enjoy your favourite movie at CineBook."}
              </p>

              <div className="movie-rating">
                <div>
                  <span>TMDB Rating</span>
                  <strong>
                    {movie.vote_average
                      ? `${movie.vote_average.toFixed(1)}/10`
                      : "N/A"}
                  </strong>
                </div>

                <div>
                  <span>Ticket Price</span>
                  <strong>₹{TICKET_PRICE}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Cinema Selection */}
          <div className="booking-section">
            <label htmlFor="cinema">Select Cinema</label>

            <select
              id="cinema"
              value={cinema}
              onChange={(e) => changeShow(setCinema, e.target.value)}
            >
              {cinemaOptions.map((item) => (
                <option value={item} key={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* Show Time */}
          <div className="booking-section">
            <label>Select Showtime</label>

            <div className="showtime-list">
              {showTimes.map((time) => (
                <button
                  type="button"
                  key={time}
                  className={`showtime-option ${
                    showTime === time ? "active" : ""
                  }`}
                  onClick={() => changeShow(setShowTime, time)}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Tickets */}
          <div className="booking-section selected-ticket-section">
            <label>Selected Tickets</label>

            {selectedSeats.length === 0 ? (
              <p className="empty-selection">
                Select your seats to continue (up to 10).
              </p>
            ) : (
              <div className="selected-ticket-list">
                {selectedSeats.map((seat) => (
                  <div className="selected-ticket" key={seat}>
                    <span>
                      <strong>{seat}</strong> seat
                    </span>

                    <span>₹{TICKET_PRICE}</span>

                    <button
                      type="button"
                      onClick={() => toggleSeat(seat)}
                      aria-label={`Remove seat ${seat}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {message && (
            <p className="seat-message" role="alert">
              {message}
            </p>
          )}

          {/* Total and Continue */}
          <div className="checkout-summary">
            <div>
              <span>Total Amount</span>
              <h2>₹{totalAmount}</h2>
              <small>{selectedSeats.length} ticket(s)</small>
            </div>

            <button
              type="button"
              className="continue-booking"
              disabled={selectedSeats.length === 0 || holding}
              onClick={handleContinue}
            >
              {holding ? "Reserving..." : "Continue →"}
            </button>
          </div>

        </section>

        {/* Right Seat Layout */}
        <section className="seat-selection-section">

          <div className="seat-heading">
            <h2>Select Your Seats</h2>
            <p>Choose your preferred seats</p>
          </div>

          <div className="screen-area">
            <div className="cinema-screen"></div>
            <span>SCREEN</span>
          </div>

          <div className="seat-layout">

            {rows.map((row) => (
              <div className="seat-row" key={row}>

                <span className="row-label">{row}</span>

                {Array.from(
                  { length: seatsPerRow },
                  (_, index) => {
                    const seatId = `${row}${index + 1}`;
                    const isBooked = bookedSeats.includes(seatId);
                    const isHeld = heldSeats.includes(seatId);
                    const isSelected = selectedSeats.includes(seatId);

                    const state = isBooked
                      ? "booked"
                      : isHeld
                        ? "held"
                        : isSelected
                          ? "selected"
                          : "available";

                    const label = {
                      booked: "Booked",
                      held: "Being booked by someone else",
                      selected: "Selected",
                      available: "Available",
                    }[state];

                    return (
                      <button
                        type="button"
                        key={seatId}
                        disabled={isBooked || isHeld}
                        onClick={() => toggleSeat(seatId)}
                        className={`cinema-seat ${state}`}
                        title={`${seatId} - ${label}`}
                        aria-label={`Seat ${seatId}, ${label}`}
                      >
                        {index + 1}
                      </button>
                    );
                  }
                )}

                <span className="row-label">{row}</span>

              </div>
            ))}

          </div>

          {/* Seat Legend */}
          <div className="seat-legend">
            <div>
              <span className="legend-box available"></span>
              Available
            </div>

            <div>
              <span className="legend-box selected"></span>
              Selected
            </div>

            <div>
              <span className="legend-box held"></span>
              On hold
            </div>

            <div>
              <span className="legend-box booked"></span>
              Booked
            </div>
          </div>

          {!availabilityLoaded && (
            <p className="seat-loading-note">Checking seat availability...</p>
          )}

          <div className="seat-footer">
            <span>{selectedSeats.length} seats selected</span>
            <strong>₹{totalAmount}</strong>
          </div>

        </section>
      </main>
    </div>
  );
}

export default SelectSeats;
