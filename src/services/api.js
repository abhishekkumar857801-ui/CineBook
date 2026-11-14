
const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5002/api";

async function request(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

export const api = {
  getMovies() {
    return request("/movies");
  },

  register(userData) {
    return request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  login(credentials) {
    return request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  getMyBookings() {
    return request("/bookings/my-bookings");
  },

  createBooking(bookingData) {
    return request("/bookings", {
      method: "POST",
      body: JSON.stringify(bookingData),
    });
  },

  // show = { movieId, cinema, showDate, showTime }
  getSeatAvailability(show) {
    return request(`/bookings/seats?${new URLSearchParams(show)}`);
  },

  holdSeats(show, seats) {
    return request("/bookings/hold", {
      method: "POST",
      body: JSON.stringify({ ...show, seats }),
    });
  },

  releaseSeats(show) {
    return request("/bookings/hold", {
      method: "DELETE",
      body: JSON.stringify(show),
    });
  },

  getTMDBPopularMovies() {
    return request("/tmdb/popular");
  },

  searchTMDBMovies(query) {
    return request(`/tmdb/search?query=${encodeURIComponent(query)}`);
  },

  getAllBookings() {
    return request("/admin/bookings");
  },
};
