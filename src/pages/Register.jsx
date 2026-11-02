import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Film, User, Mail, Lock } from "lucide-react";
import { api } from "../services/api";
import "./Register.css";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    setFormData((previous) => ({ ...previous, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.register(formData);
      navigate("/login", { state: { message: "Account created successfully. Please log in." } });
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page page-animation">
      <section className="auth-card register-card">
        <div className="auth-brand"><span><Film size={25} /></span><strong>CineBook</strong></div>
        <h1>Create your account</h1>
        <p className="auth-description">Join CineBook and discover your next movie.</p>
        {error && <div className="auth-error" role="alert">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label htmlFor="name">Full name</label>
          <div className="auth-input-wrap"><User size={18} /><input id="name" type="text" name="name" placeholder="Your full name" value={formData.name} onChange={handleChange} autoComplete="name" required /></div>
          <label htmlFor="register-email">Email address</label>
          <div className="auth-input-wrap"><Mail size={18} /><input id="register-email" type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} autoComplete="email" required /></div>
          <label htmlFor="register-password">Password</label>
          <div className="auth-input-wrap"><Lock size={18} /><input id="register-password" type="password" name="password" placeholder="At least 8 characters" value={formData.password} onChange={handleChange} autoComplete="new-password" minLength={8} required /></div>
          <button className="auth-submit" type="submit" disabled={loading}>{loading ? "Creating account..." : "Create account"}</button>
        </form>
        <p className="auth-footer">Already have an account? <Link to="/login">Login</Link></p>
      </section>
    </main>
  );
}
export default Register;
