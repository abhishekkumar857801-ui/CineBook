
# 🎬 CineBook – Movie Ticket Booking Website

CineBook is a full-stack movie ticket booking web application that allows users to explore movies, view movie details, select seats, and manage their bookings. It also provides an Admin Dashboard to manage movies and monitor bookings.

The application is built using React.js, Node.js, Express.js, and MongoDB.

## 🚀 Features

### 👤 User Features
- User registration and login.
- Secure authentication using JWT.
- Browse available movies.
- Search and explore movies.
- View movie details.
- Select cinema seats.
- Choose show dates and showtimes.
- Proceed to checkout.
- View personal booking history.

### 🛠️ Admin Features
- Admin login and authentication.
- Admin Dashboard.
- View total movies.
- Add new movies.
- Update movie details.
- Delete movies.
- View movie bookings.

### 🎥 Movie Features
- Movie catalogue with sample movie data.
- TMDB API integration for movie information.
- Movie posters and descriptions.
- Movie genre, language, rating, and ticket price.

## 🧰 Technologies Used

### Frontend
- React.js
- Vite
- JavaScript
- HTML5
- CSS3
- React Router

### Backend
- Node.js
- Express.js
- REST API
- JWT Authentication
- bcryptjs

### Database
- MongoDB Atlas
- Mongoose

### External API
- The Movie Database (TMDB)

## 📁 Project Structure

```text
CineBook/
│
├── client/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── App.jsx
│       └── main.jsx
│
├── server/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── seedMovies.js
│   ├── server.js
│   └── .env
│
├── .gitignore
└── README.md
```

## ⚙️ Installation and Setup


```bash
cd CineBook
```

### 1. Setup Backend

```bash
cd server
npm install
```

Create a `.env` file inside the server folder:

```env
PORT=5002
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
TMDB_READ_ACCESS_TOKEN=your_tmdb_read_access_token
```

Replace the placeholder values with your own credentials.

### 2. Add Sample Movies

To insert the sample movies into MongoDB, run:

```bash
node seedMovies.js
```

### 3. Start Backend Server

```bash
npm run dev
```

If a development script is not configured, use:

```bash
node server.js
```

Backend runs at:

```text
http://localhost:5002
```

### 4. Setup Frontend

Open another terminal:

```bash
cd client
npm install
```

Start the React development server:

```bash
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

## 🔐 Authentication

CineBook uses JWT-based authentication.

- Users can register and log in.
- Passwords are hashed using bcryptjs.
- Protected routes require authentication.
- Admin routes require administrator privileges.

## 🗄️ Database

MongoDB Atlas is used to store application data.

Main collections include:

- Users
- Movies
- Bookings (when booking functionality is configured)

## 🎯 Future Enhancements

- Online payment integration using Cashfree.
- Automatic UPI QR payment verification.
- Real-time booking confirmation.
- Seat availability and temporary seat locking.
- Email and in-app booking notifications.
- Improved movie recommendations.
- Enhanced admin analytics.

## 👨‍💻 Developer

Project: CineBook – Movie Ticket Booking Website

Technologies: React.js | Node.js | Express.js | MongoDB

## 📌 Note

This project is developed for learning and demonstration purposes. Payment integration and some booking features may still be under development.

---


