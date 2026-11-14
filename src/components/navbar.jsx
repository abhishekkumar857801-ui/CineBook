import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Film, Home, Ticket, LayoutDashboard, LogIn, LogOut } from "lucide-react";
import { clearSession, getStoredUser } from "../services/auth";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  // getStoredUser() returns null (and clears it) once the login has expired.
  const [user, setUser] = useState(getStoredUser);

  const isAuthPage = ["/login", "/register"].includes(location.pathname);

  // Re-check on every page change so an expired login is noticed.
  useEffect(() => {
    setUser(getStoredUser());
  }, [location.pathname]);

  useEffect(() => {
    function syncUser() {
      setUser(getStoredUser());
    }
    window.addEventListener("authChanged", syncUser);
    window.addEventListener("storage", syncUser);
    return () => {
      window.removeEventListener("authChanged", syncUser);
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  function handleLogout() {
    clearSession();
    setUser(null);
    navigate("/login", { replace: true });
  }

  return (
    <header className="site-header">
      <nav className={`navbar ${isAuthPage ? "navbar-auth-page" : ""}`}>
        <Link to="/" className="navbar-logo">
          <span className="logo-icon"><Film size={22} strokeWidth={2.5} /></span>
          <span>CineBook</span>
        </Link>

        {!isAuthPage && (
          <div className="navbar-links">
            <NavLink to="/" end aria-label="Home" className={({ isActive }) => `navbar-link ${isActive ? "active" : ""}`}>
              <Home size={17} /><span>Home</span>
            </NavLink>
            {user && (
              <NavLink to="/my-bookings" aria-label="My Bookings" className={({ isActive }) => `navbar-link ${isActive ? "active" : ""}`}>
                <Ticket size={17} /><span>My Bookings</span>
              </NavLink>
            )}
            {user?.role === "admin" && (
              <NavLink to="/admin" aria-label="Admin" className={({ isActive }) => `navbar-link ${isActive ? "active" : ""}`}>
                <LayoutDashboard size={17} /><span>Admin</span>
              </NavLink>
            )}
          </div>
        )}

        <div className="navbar-actions">
          {isAuthPage ? (
            <Link to="/" className="navbar-back-button">Back to Home</Link>
          ) : user ? (
            <button type="button" className="navbar-login-button" onClick={handleLogout}>
              <LogOut size={16} /> Logout
            </button>
          ) : (
            <Link to="/login" className="navbar-login-button">
              <LogIn size={16} /> Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
