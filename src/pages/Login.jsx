import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Film, Mail, Lock } from "lucide-react";
import { api } from "../services/api";
import "./Login.css";

const BOOKING_STORAGE_KEY = "cinebook_pending_booking";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    if (!formData.email.trim() || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }
    try {
      setLoading(true);
      const data = await api.login({ email: formData.email.trim(), password: formData.password });
      if (!data.token || !data.user) throw new Error("Invalid login response from server.");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("authChanged"));

      if (data.user.role === "admin") {
        sessionStorage.removeItem(BOOKING_STORAGE_KEY);
        navigate("/admin", { replace: true });
        return;
      }

      let booking = location.state?.booking || location.state?.checkoutState || null;
      if (!booking) {
        try { booking = JSON.parse(sessionStorage.getItem(BOOKING_STORAGE_KEY) || "null"); }
        catch { sessionStorage.removeItem(BOOKING_STORAGE_KEY); }
      }
      if (booking?.movie && Array.isArray(booking.selectedSeats) && booking.selectedSeats.length) {
        sessionStorage.removeItem(BOOKING_STORAGE_KEY);
        navigate("/checkout", { replace: true, state: booking });
        return;
      }
      navigate(location.state?.from || "/", { replace: true });
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page page-animation">
      <section className="auth-card">
        <div className="auth-brand"><span><Film size={25} /></span><strong>CineBook</strong></div>
        <h1>Welcome back</h1>
        <p className="auth-description">Log in to continue your movie experience.</p>
        {location.state?.message && <p className="auth-notice" role="status">{location.state.message}</p>}
        {error && <div className="auth-error" role="alert">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email address</label>
          <div className="auth-input-wrap"><Mail size={18} /><input id="email" name="email" type="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} autoComplete="email" required /></div>
          <label htmlFor="password">Password</label>
          <div className="auth-input-wrap"><Lock size={18} /><input id="password" name="password" type="password" placeholder="Enter your password" value={formData.password} onChange={handleChange} autoComplete="current-password" required /></div>
          <button className="auth-submit" type="submit" disabled={loading}>{loading ? "Logging in..." : "Login to CineBook"}</button>
        </form>
        <p className="auth-footer">Don't have an account? <Link to="/register">Create account</Link></p>
      </section>
    </main>
  );
}
export default Login;
