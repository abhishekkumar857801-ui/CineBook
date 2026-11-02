import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Ticket, Film, CalendarDays, Armchair, ArrowRight } from "lucide-react";
import { api } from "../services/api";
import "./MyBookings.css";

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadBookings() {
      try {
        const data = await api.getMyBookings();
        if (active) setBookings(Array.isArray(data) ? data : data.bookings || []);
      } catch (err) {
        if (active) setError(err.message || "Unable to load bookings.");
      } finally {
        if (active) setLoading(false);
      }
    }
    loadBookings();
    return () => { active = false; };
  }, []);

  if (loading) return <main className="my-bookings-page"><div className="booking-loading">Loading your bookings...</div></main>;

  return (
    <main className="my-bookings-page page-animation">
      <div className="bookings-heading"><span className="section-kicker">YOUR CINEBOOK ACCOUNT</span><h1>My Bookings</h1><p>All your movie plans, together in one place.</p></div>
      {error ? <p className="bookings-error">{error}</p> : bookings.length === 0 ? (
        <div className="empty-bookings"><span className="empty-booking-icon"><Ticket size={30} /></span><h2>No bookings yet</h2><p>Your movie reservations will appear here once you book a ticket.</p><Link to="/">Explore Movies <ArrowRight size={16} /></Link></div>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => (
            <article className="booking-card" key={booking._id || booking.id}>
              <div className="booking-card-top"><span className="booking-icon"><Film size={20} /></span><span className={`booking-status ${String(booking.status || "Confirmed").toLowerCase()}`}>{booking.status || "Confirmed"}</span></div>
              <h2>{booking.movie?.title || booking.movieTitle || "Movie booking"}</h2>
              <p className="booking-id">Booking ID: {booking._id || booking.id}</p>
              <div className="booking-info-row"><span><Armchair size={15} /> Seats</span><strong>{Array.isArray(booking.seats) ? booking.seats.join(", ") : "Not available"}</strong></div>
              <div className="booking-info-row"><span><CalendarDays size={15} /> Amount paid</span><strong>₹{booking.totalAmount ?? booking.total ?? 0}</strong></div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
export default MyBookings;
