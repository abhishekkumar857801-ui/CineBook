// Login session helpers. The server issues a JWT that expires after 1 day.

// Read the expiry time ("exp", in seconds) from a JWT without verifying it.
function isTokenExpired(token) {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const { exp } = JSON.parse(atob(payload));
    return typeof exp === "number" && exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  // Notify after the current render (this can be called while rendering).
  setTimeout(() => window.dispatchEvent(new Event("authChanged")), 0);
}

// The stored token, or null if there is none or it has expired.
// An expired session is cleared so the navbar switches back to "Login".
export function getValidToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  if (isTokenExpired(token)) {
    clearSession();
    return null;
  }

  return token;
}

export function getStoredUser() {
  if (!getValidToken()) return null;

  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}
