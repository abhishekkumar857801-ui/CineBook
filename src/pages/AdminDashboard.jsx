import { useEffect, useState } from "react";
import { Ticket, Armchair, IndianRupee, Users, Activity } from "lucide-react";
import { api } from "../services/api";
import "./AdminDashboard.css";

const RECENT_BOOKINGS_SHOWN = 20;

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadDashboard() {
      try {
        const [statsData, bookingData] = await Promise.all([api.getAdminStats(), api.getAllBookings()]);
        if (active) {
          setStats(statsData);
          setBookings(Array.isArray(bookingData) ? bookingData : bookingData.bookings || []);
        }
      } catch (err) {
        if (active) setError(err.message || "Unable to load admin dashboard.");
      } finally {
        if (active) setLoading(false);
      }
    }
    loadDashboard();
    return () => { active = false; };
  }, []);

  if (loading) return <main className="admin-page"><div className="admin-loading">Loading dashboard...</div></main>;

  const cards = [
    { icon: <Ticket />, label: "Total Bookings", value: stats?.bookings ?? 0, note: "Reservations received" },
    { icon: <Armchair />, label: "Seats Booked", value: stats?.seatsBooked ?? 0, note: "Across all shows" },
    { icon: <IndianRupee />, label: "Booking Value", value: `₹${(stats?.totalAmount ?? 0).toLocaleString("en-IN")}`, note: "Payments still pending" },
    { icon: <Users />, label: "Registered Users", value: stats?.users ?? 0, note: "Customer and admin accounts" },
  ];

  return (
    <main className="admin-page page-animation">
      <div className="admin-heading"><span className="section-kicker">CINEBOOK CONTROL CENTER</span><h1>Admin Dashboard</h1><p>Monitor bookings and customers. Movies are loaded live from TMDB.</p></div>
      {error && <p className="admin-error">{error}</p>}
      <div className="admin-stats">
        {cards.map((card) => (
          <article className="admin-stat-card" key={card.label}>
            <span className="admin-stat-icon">{card.icon}</span>
            <p>{card.label}</p>
            <h2>{card.value}</h2>
            <small>{card.note}</small>
          </article>
        ))}
      </div>
      <section className="admin-section">
        <div className="admin-section-heading"><h2><Activity size={19} /> Recent Bookings</h2><span>{bookings.length} total</span></div>
        {bookings.length === 0 ? <p className="admin-empty">No bookings yet.</p> : (
          <div className="admin-list">{bookings.slice(0, RECENT_BOOKINGS_SHOWN).map((booking) => (
            <article className="admin-list-item" key={booking._id}>
              <div>
                <strong>{booking.movie?.title || "Movie booking"}</strong>
                <small>
                  {booking.user?.name || "Unknown user"}{booking.user?.email ? ` · ${booking.user.email}` : ""}
                </small>
                <small>
                  {booking.cinema} · {booking.showDate} · {booking.showTime} · Seats {booking.seats?.join(", ")}
                </small>
              </div>
              <div className="admin-list-side">
                <span className="admin-amount">₹{booking.totalAmount ?? 0}</span>
                <span className={`admin-row-tag ${String(booking.paymentStatus || "").toLowerCase()}`}>{booking.paymentStatus || "Pending"}</span>
              </div>
            </article>
          ))}</div>
        )}
      </section>
    </main>
  );
}
export default AdminDashboard;
