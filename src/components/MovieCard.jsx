import { Star, Clock, Ticket } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./MovieCard.css";

function MovieCard({ movie }) {
  const navigate = useNavigate();

  function handleBooking() {
    navigate("/movie-details", { state: { movie } });
  }

  const duration = Number(movie.duration);
  const durationText = Number.isFinite(duration) && duration > 0
    ? `${Math.floor(duration / 60)}h ${duration % 60}m`
    : "Now showing";

  return (
    <article className="movie-card">
      <button type="button" className="movie-poster-button" onClick={handleBooking} aria-label={`View ${movie.title}`}>
        {movie.poster ? (
          <img className="movie-poster" src={movie.poster} alt={movie.title || "Movie poster"} loading="lazy"
            onError={(event) => { event.currentTarget.style.opacity = "0"; }} />
        ) : (
          <div className="poster-fallback"><Ticket size={34} /><span>Poster unavailable</span></div>
        )}
        <span className="poster-overlay"><span>View movie</span></span>
      </button>
      <div className="movie-info">
        <h3 title={movie.title}>{movie.title || "Untitled Movie"}</h3>
        <div className="movie-details">
          <span>{movie.genre || "Movie"}</span>
          <span className="movie-rating"><Star size={14} fill="currentColor" /> {movie.rating ?? "N/A"}</span>
        </div>
        <p className="movie-duration"><Clock size={13} /> {durationText}</p>
        <button type="button" className="book-button" onClick={handleBooking}>Book Tickets <Ticket size={15} /></button>
      </div>
    </article>
  );
}

export default MovieCard;
