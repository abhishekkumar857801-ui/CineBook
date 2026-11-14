import { clearSession, getValidToken } from "./auth";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5002/api";

async function request(endpoint, options = {}) {
  const token = getValidToken();

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  // The server no longer accepts our login (expired, user deleted, ...).
  // Login/register return 401 for wrong passwords, so skip those.
  if (response.status === 401 && token && !endpoint.startsWith("/auth/")) {
    clearSession();
    throw new Error("Your login has expired. Please log in again.");
  }

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

export const api = {

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

  // TMDB can hang on some networks, so give up after 15 seconds
  // and let the page show its "Try again" message.
  getTMDBPopularMovies() {
    return request("/tmdb/popular", { signal: AbortSignal.timeout(15000) });
  },

  searchTMDBMovies(query) {
    return request(`/tmdb/search?query=${encodeURIComponent(query)}`, {
      signal: AbortSignal.timeout(15000),
    });
  },

  getAllBookings() {
    return request("/admin/bookings");
  },

  getAdminStats() {
    return request("/admin/stats");
  },
};
