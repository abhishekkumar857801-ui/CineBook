// Shared booking constants and helpers used by seat selection and checkout.

export const TICKET_PRICE = 200;

// The id the server uses to tell shows of different movies apart.
export function getMovieId(movie) {
  return String(movie?.id ?? movie?._id ?? movie?.title ?? "");
}

export function getShow({ movie, cinema, showDate, showTime }) {
  return { movieId: getMovieId(movie), cinema, showDate, showTime };
}
