# 🎬 CineBook – Movie Ticket Booking Website

CineBook is a full-stack movie ticket booking app. Customers browse movies, pick a cinema, date and showtime, reserve seats and track their bookings. Administrators get a dashboard of movies and bookings.

Built with **React + Vite**, **Node.js + Express**, and **MongoDB**.

## 🚀 Features

### 👤 Customers
- Register and log in (JWT authentication, bcrypt-hashed passwords).
- Browse and search popular movies (from TMDB, with automatic fallback to the CineBook catalogue in MongoDB if TMDB is unreachable).
- View movie details.
- Choose a cinema, show date and showtime.
- **Live seat availability**: booked seats and seats currently being booked by someone else are shown and cannot be selected. The seat map refreshes every 15 seconds.
- **Seat locking**: selected seats are held for 10 minutes while you check out, with a countdown on the checkout page.
- View booking history in *My Bookings*.

### 🛠️ Administrators
- Dashboard with movie and booking overviews.
- Add, update and delete movies (API).
- View all bookings.

## 🔒 How seat locking works

Each seat for a show (movie + cinema + date + time) is stored as one document in the `seatholds` collection, protected by a **unique index**. That makes double-booking impossible, even if two people click at the same instant.

1. **Continue** on the seat page asks the server to hold the seats (`POST /api/bookings/hold`). If any seat was just taken, nothing is held and you are asked to pick again.
2. The hold expires after 10 minutes. MongoDB removes expired holds automatically using a TTL index.
3. **Confirm Booking** turns the hold into a booking. The seats then stay taken permanently.
4. **Back to Seats** releases the hold so others can pick those seats.

Ticket prices are set on the server (₹200 per seat), so customers cannot change them.

## 📁 Project Structure

```text
movie ticket booking/
├── index.html
├── vite.config.js
├── package.json            # frontend
├── src/
│   ├── components/         # Navbar, MovieCard, ProtectedRoute, ...
│   ├── pages/              # Home, MovieDetails, SelectSeats, Checkout, MyBookings, Login, Register, AdminDashboard
│   ├── services/           # api.js (API client), show.js (booking helpers)
│   ├── App.jsx
│   └── main.jsx
└── server/
    ├── config/db.js
    ├── middleware/authMiddleware.js
    ├── models/             # user, movie, booking, seatHold
    ├── routes/             # auth, movies, bookings, admin, tmdb
    ├── seedMovies.js       # load sample movies
    ├── makeAdmin.js        # give an account admin rights
    ├── migrateMovies.js    # copy movies from the old "test" database
    ├── server.js
    └── .env                # your secrets (not committed)
```

## ⚙️ Setup

You need Node.js 20+ and a MongoDB database (MongoDB Atlas works).

### 1. Backend

```bash
cd server
npm install
```

Create a file called `server/.env` with:

```env
PORT=5002
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=a_long_random_secret
TMDB_READ_ACCESS_TOKEN=your_tmdb_read_access_token
```

Load the sample movies, then start the API:

```bash
npm run seed
npm run dev
```

The API runs at `http://localhost:5002`.

### 2. Frontend

From the project root (the folder containing `index.html`):

```bash
npm install
npm run dev
```

The site runs at `http://localhost:5173`. To use a different API address, set `VITE_API_URL` (default `http://localhost:5002/api`).

### 3. Make yourself an admin (optional)

Register an account on the site, then:

```bash
cd server
npm run make-admin
```

Log out and back in to see the **Admin** link.

## 🔌 API overview

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | – | Create an account |
| POST | `/api/auth/login` | – | Log in, returns a JWT |
| GET | `/api/movies` | – | CineBook movie catalogue |
| GET | `/api/tmdb/popular` | – | Popular movies from TMDB |
| GET | `/api/tmdb/search?query=` | – | Search TMDB |
| GET | `/api/bookings/seats?movieId=&cinema=&showDate=&showTime=` | optional | Booked / held seats for a show |
| POST | `/api/bookings/hold` | user | Hold seats for 10 minutes |
| DELETE | `/api/bookings/hold` | user | Release your held seats |
| POST | `/api/bookings` | user | Book your held seats |
| GET | `/api/bookings/my-bookings` | user | Your bookings |
| GET | `/api/admin/stats` | admin | Movie, booking and user counts |
| GET | `/api/admin/bookings` | admin | All bookings |
| GET/POST/PUT/DELETE | `/api/admin/movies` | admin | Manage movies |

## 🛣️ Not built yet

- Online payment (e.g. Cashfree / UPI). Bookings are currently saved with **Pending** payment status.
- Booking cancellation.
- Email notifications.
- Admin UI for adding and editing movies (the API exists).

## 📌 Note

This project was built for learning and demonstration purposes.
