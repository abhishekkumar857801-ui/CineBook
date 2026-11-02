
import { useState } from "react";
import "./SeatLayout.css";

function SeatLayout({ onSelectionChange }) {
  const rows = ["A", "B", "C", "D", "E"];
  const seatsPerRow = 8;
  const ticketPrice = 200;

  const [selectedSeats, setSelectedSeats] = useState([]);

  const bookedSeats = ["A3", "A4", "B6", "C2", "D7"];

  function toggleSeat(seatId) {
    if (bookedSeats.includes(seatId)) return;

    const updatedSeats = selectedSeats.includes(seatId)
      ? selectedSeats.filter((seat) => seat !== seatId)
      : [...selectedSeats, seatId];

    setSelectedSeats(updatedSeats);
    onSelectionChange?.(updatedSeats);
  }

  return (
    <div className="seat-layout">
      <h2>Select Your Seats</h2>

      <div className="screen">SCREEN</div>

      <div className="seat-grid">
        {rows.map((row) => (
          <div className="seat-row" key={row}>
            <span className="row-label">{row}</span>

            {Array.from(
              { length: seatsPerRow },
              (_, index) => `${row}${index + 1}`
            ).map((seatId, index) => {
              const isBooked = bookedSeats.includes(seatId);
              const isSelected = selectedSeats.includes(seatId);

              return (
                <button
                  key={seatId}
                  className={`seat ${
                    isBooked
                      ? "booked"
                      : isSelected
                        ? "selected"
                        : ""
                  }`}
                  disabled={isBooked}
                  onClick={() => toggleSeat(seatId)}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="seat-legend">
        <span>🟩 Available</span>
        <span>🟦 Selected</span>
        <span>🟥 Booked</span>
      </div>

      <p className="selected-seat-text">
        Selected seats: {selectedSeats.length > 0
          ? selectedSeats.join(", ")
          : "None"}
      </p>

      <p className="seat-total">
        Total: ₹{selectedSeats.length * ticketPrice}
      </p>
    </div>
  );
}

export default SeatLayout;
