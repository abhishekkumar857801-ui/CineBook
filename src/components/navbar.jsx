import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Film, Home, Ticket, LayoutDashboard, LogIn, LogOut } from "lucide-react";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user") || "null"); }
    catch { return null; }
  });

  const isAuthPage = ["/login", "/register"].includes(location.pathname);

  useEffect(() => {
    function syncUser() {
      try { setUser(JSON.parse(localStorage.getItem("user") || "null")); }
      catch { setUser(null); }
    }
    window.addEventListener("authChanged", syncUser);
    window.addEventListener("storage", syncUser);
    return () => {
      window.removeEventListener("authChanged", syncUser);
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.dispatchEvent(new Event("authChanged"));
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
            <NavLink to="/" end className={({ isActive }) => `navbar-link ${isActive ? "active" : ""}`}>
              <Home size={17} /><span>Home</span>
            </NavLink>
            {user && (
              <NavLink to="/my-bookings" className={({ isActive }) => `navbar-link ${isActive ? "active" : ""}`}>
                <Ticket size={17} /><span>My Bookings</span>
              </NavLink>
            )}
            {user?.role === "admin" && (
              <NavLink to="/admin" className={({ isActive }) => `navbar-link ${isActive ? "active" : ""}`}>
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
