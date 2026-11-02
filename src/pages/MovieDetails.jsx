import { useLocation, useNavigate } from "react-router-dom";
import { Star, Clock, Ticket, ArrowLeft } from "lucide-react";
import "./MovieDetails.css";

function MovieDetails() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const movie = state?.movie;

  if (!movie) {
    return (
      <main className="movie-details-page page-animation">
        <div className="details-empty"><h2>Movie not found</h2><p>Please select a movie from the homepage.</p><button className="primary-button" onClick={() => navigate("/")}>Back to Home</button></div>
      </main>
    );
  }

  const poster = movie.poster || (movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "");
  const rating = movie.rating ?? (movie.vote_average ? movie.vote_average.toFixed(1) : "N/A");
  const release = movie.release_date?.slice(0, 4) || "Now showing";

  return (
    <main className="movie-details-page page-animation">
      <button className="details-back" onClick={() => navigate("/")}><ArrowLeft size={16} /> Back to movies</button>
      <section className="movie-details-card">
        <div className="details-poster-wrap">
          {poster ? <img src={poster} alt={movie.title || "Movie poster"} /> : <div className="details-poster-fallback"><Ticket size={42} /></div>}
        </div>
        <div className="movie-details-content">
          <span className="details-kicker">CINEBOOK FEATURE</span>
          <h1>{movie.title || movie.name || "Selected Movie"}</h1>
          <div className="details-meta">
            <span>{release}</span><span className="meta-dot" />
            <span><Star size={16} fill="currentColor" /> {rating}/10</span>
            {movie.runtime ? <><span className="meta-dot" /><span><Clock size={16} /> {movie.runtime} min</span></> : null}
          </div>
          <h3>Overview</h3>
          <p className="details-description">{movie.overview || "Enjoy this movie on the big screen. Choose your show and reserve your seats with CineBook."}</p>
          <div className="details-note"><Ticket size={18} /><span>Choose your cinema, showtime and preferred seats in the next step.</span></div>
          <button className="details-book-button" onClick={() => navigate("/select-seats", { state: { movie } })}><Ticket size={18} /> Select Seats</button>
        </div>
      </section>
    </main>
  );
}
export default MovieDetails;
