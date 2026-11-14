import { Navigate } from "react-router-dom";
import { getStoredUser, getValidToken } from "../services/auth";

// adminOnly: also require the logged-in user to be an administrator.
// (The server checks this too; this just avoids showing a broken page.)
function ProtectedRoute({ children, adminOnly = false }) {
  if (!getValidToken()) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ message: "Please log in to continue." }}
      />
    );
  }

  if (adminOnly && getStoredUser()?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
