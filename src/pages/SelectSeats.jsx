import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./SelectSeats.css";

const TICKET_PRICE = 200;
const BOOKING_STORAGE_KEY = "cinebook_pending_booking";

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

// Demo data only. Replace with MongoDB seat availability later.
const bookedSeats = [
  "G3", "G4", "F5", "E6", "E7", "E8",
  "D3", "D4", "D5", "D7", "C7", "C8",
  "B2", "B3", "B11", "B12", "A5", "A6",
];

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

  const movie = location.state?.movie || {
    title: "Spider-Man: Brand New Day",
    release_date: "2025",
    overview: "Enjoy your movie experience with CineBook.",
  };

  const dateOptions = getDateOptions();

  const [cinema, setCinema] = useState(cinemaOptions[0]);
  const [showDate, setShowDate] = useState(
    location.state?.showDate || dateOptions[0].value
  );
  const [showTime, setShowTime] = useState(
    location.state?.showTime || showTimes[0]
  );
  const [selectedSeats, setSelectedSeats] = useState(
    location.state?.selectedSeats || []
  );

  const posterUrl = movie.poster_path
    ? movie.poster_path.startsWith("http")
      ? movie.poster_path
      : `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : movie.poster || "";

  const title = movie.title || movie.name || "Selected Movie";

  const totalAmount = selectedSeats.length * TICKET_PRICE;

  const toggleSeat = (seatId) => {
    if (bookedSeats.includes(seatId)) return;

    setSelectedSeats((previous) =>
      previous.includes(seatId)
        ? previous.filter((seat) => seat !== seatId)
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

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat.");
      return;
    }

    if (!showDate || !showTime || !cinema) {
      alert("Please select cinema, date and showtime.");
      return;
    }

    // Check login before allowing checkout/payment.
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
        },
      });

      return;
    }

    navigate("/checkout", {
      state: bookingData,
    });
  };

  return (
    <div className="cinema-booking-page">

      {/* Navigation */}
      <nav className="cinema-navbar">
        <div className="cinema-brand">
          <span className="brand-icon">C</span>
          <span>CineBook</span>
        </div>

        <div className="navbar-right">
          <span className="navbar-label">Movie Booking</span>
          <span className="navbar-profile">CB</span>
        </div>
      </nav>

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
            onClick={() => setShowDate(date.value)}
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
              onChange={(e) => setCinema(e.target.value)}
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
                  onClick={() => setShowTime(time)}
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
                Select your seats to continue.
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
              disabled={selectedSeats.length === 0}
              onClick={handleContinue}
            >
              Continue →
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
                    const isSelected =
                      selectedSeats.includes(seatId);

                    return (
                      <button
                        type="button"
                        key={seatId}
                        disabled={isBooked}
                        onClick={() => toggleSeat(seatId)}
                        className={`cinema-seat ${
                          isBooked
                            ? "booked"
                            : isSelected
                            ? "selected"
                            : "available"
                        }`}
                        title={`${seatId} - ${
                          isBooked
                            ? "Booked"
                            : isSelected
                            ? "Selected"
                            : "Available"
                        }`}
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
              <span className="legend-box booked"></span>
              Booked
            </div>
          </div>

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
