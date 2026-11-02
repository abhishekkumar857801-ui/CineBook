import { useEffect, useMemo, useState } from "react";
import { Search, Film, Sparkles } from "lucide-react";
import MovieCard from "../components/MovieCard";
import { api } from "../services/api";
import "./Home.css";

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

function Home() {
  const [search, setSearch] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function fetchMovies() {
      try {
        setLoading(true);
        setError("");
        const data = await api.getTMDBPopularMovies();
        if (active) setMovies(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load TMDB movies:", err);
        if (active) setError(err.message || "Unable to load movies. Please try again.");
      } finally {
        if (active) setLoading(false);
      }
    }
    fetchMovies();
    return () => { active = false; };
  }, []);

  const filteredMovies = useMemo(() => movies.filter((movie) =>
    (movie.title || "").toLowerCase().includes(search.toLowerCase().trim())
  ), [movies, search]);

  return (
    <main className="home-page page-animation">
      <section className="hero">
        <div className="hero-content">
          <span className="hero-eyebrow"><Sparkles size={15} /> YOUR NEXT MOVIE EXPERIENCE</span>
          <h1>Big Screen Moments.<br /><span>Booked in Seconds.</span></h1>
          <p>Discover popular movies, choose your seats and make every movie night special.</p>
          <a href="#movies" className="hero-cta"><Film size={17} /> Explore Movies</a>
        </div>
        <div className="hero-orbit hero-orbit-one" />
        <div className="hero-orbit hero-orbit-two" />
      </section>

      <section className="movies-section" id="movies">
        <div className="section-heading">
          <div>
            <span className="section-kicker">NOW SHOWING</span>
            <h2>Popular Movies</h2>
            <p>Find something great to watch today.</p>
          </div>
          <label className="movie-search">
            <Search size={18} />
            <input
              type="search"
              placeholder="Search movies..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search movies by title"
            />
          </label>
        </div>

        {loading ? (
          <div className="movie-state"><div className="loading-spinner" /><p>Finding movies for you...</p></div>
        ) : error ? (
          <div className="movie-state error-state"><p>{error}</p></div>
        ) : filteredMovies.length ? (
          <div className="movies-grid">
            {filteredMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={{
                  ...movie,
                  id: movie.id,
                  poster: movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : "",
                  genre: "Movie",
                  duration: 0,
                  rating: movie.vote_average ? Number(movie.vote_average.toFixed(1)) : "N/A",
                }}
              />
            ))}
          </div>
        ) : (
          <div className="movie-state"><p>No movies found. Try another title.</p></div>
        )}
      </section>
      <footer className="site-footer">
        <span className="footer-brand"><Film size={17} /> CineBook</span>
        <span>Made for movie lovers.</span>
      </footer>
    </main>
  );
}

export default Home;
