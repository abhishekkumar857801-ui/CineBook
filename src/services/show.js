// Shared booking constants and helpers used by seat selection and checkout.

export const TICKET_PRICE = 200;

// The id the server uses to tell shows of different movies apart.
export function getMovieId(movie) {
  return String(movie?.id ?? movie?._id ?? movie?.title ?? "");
}

export function getShow({ movie, cinema, showDate, showTime }) {
  return { movieId: getMovieId(movie), cinema, showDate, showTime };
}

// "2026-11-14" + "6:30 PM" -> Date in the viewer's local time.
export function getShowStart(showDate, showTime) {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(showDate || "");
  const timeMatch = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(showTime || "");
  if (!dateMatch || !timeMatch) return null;

  let hours = Number(timeMatch[1]) % 12;
  if (timeMatch[3].toUpperCase() === "PM") hours += 12;

  return new Date(
    Number(dateMatch[1]),
    Number(dateMatch[2]) - 1,
    Number(dateMatch[3]),
    hours,
    Number(timeMatch[2])
  );
}

// True when the show has already started (or the values are invalid).
export function isShowInPast(showDate, showTime, now = new Date()) {
  const start = getShowStart(showDate, showTime);
  return !start || start <= now;
}
