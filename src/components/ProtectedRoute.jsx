import { Navigate } from "react-router-dom";

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

// adminOnly: also require the logged-in user to be an administrator.
// (The server checks this too; this just avoids showing a broken page.)
function ProtectedRoute({ children, adminOnly = false }) {
  const isLoggedIn = Boolean(localStorage.getItem("token"));

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && getStoredUser()?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
