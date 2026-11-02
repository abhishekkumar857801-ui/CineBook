import { useEffect, useState } from "react";
import { Film, Ticket, TrendingUp, Activity } from "lucide-react";
import { api } from "../services/api";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [movies, setMovies] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadDashboard() {
      try {
        const [movieData, bookingData] = await Promise.all([api.getMovies(), api.getAllBookings()]);
        if (active) {
          setMovies(Array.isArray(movieData) ? movieData : movieData.movies || []);
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

  return (
    <main className="admin-page page-animation">
      <div className="admin-heading"><span className="section-kicker">CINEBOOK CONTROL CENTER</span><h1>Admin Dashboard</h1><p>Monitor your platform overview and recent activity.</p></div>
      {error && <p className="admin-error">{error}</p>}
      <div className="admin-stats">
        <article className="admin-stat-card"><span className="admin-stat-icon"><Film /></span><p>Total Movies</p><h2>{movies.length}</h2><small>Movies in your catalogue</small></article>
        <article className="admin-stat-card"><span className="admin-stat-icon"><Ticket /></span><p>Total Bookings</p><h2>{bookings.length}</h2><small>Reservations received</small></article>
        <article className="admin-stat-card"><span className="admin-stat-icon"><TrendingUp /></span><p>Booking Activity</p><h2>{bookings.length ? "Active" : "—"}</h2><small>Based on current records</small></article>
      </div>
      <section className="admin-section">
        <div className="admin-section-heading"><h2><Film size={19} /> Movies</h2><span>{movies.length} total</span></div>
        {movies.length === 0 ? <p className="admin-empty">No movies found.</p> : (
          <div className="admin-list">{movies.map((movie) => (
            <article className="admin-list-item" key={movie._id || movie.id}>
              <div><strong>{movie.title || "Untitled movie"}</strong><small>{movie.genre || "Genre not specified"}</small></div>
              <span className="admin-row-tag">Catalogue</span>
            </article>
          ))}</div>
        )}
      </section>
      <section className="admin-section">
        <div className="admin-section-heading"><h2><Activity size={19} /> Recent Bookings</h2><span>{bookings.length} total</span></div>
        {bookings.length === 0 ? <p className="admin-empty">No bookings found.</p> : (
          <div className="admin-list">{bookings.slice(0,10).map((booking) => (
            <article className="admin-list-item" key={booking._id || booking.id}>
              <div><strong>{booking.movie?.title || booking.movieTitle || "Movie booking"}</strong><small>{booking._id || booking.id}</small></div>
              <span className="admin-amount">₹{booking.totalAmount ?? booking.total ?? 0}</span>
            </article>
          ))}</div>
        )}
      </section>
    </main>
  );
}
export default AdminDashboard;
