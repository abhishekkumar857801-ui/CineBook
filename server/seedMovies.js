
require("dotenv").config();

const mongoose = require("mongoose");
const Movie = require("./models/Movie");

const movies = [
  {
    title: "Interstellar",
    description: "A team of explorers travels through a wormhole to find a future for humanity.",
    poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    genre: "Sci-Fi",
    duration: 169,
    language: "English",
    rating: 8.7,
    price: 200,
  },
  {
    title: "Inception",
    description: "A skilled thief enters dreams to steal secrets and plant an idea.",
    poster: "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
    genre: "Action",
    duration: 148,
    language: "English",
    rating: 8.8,
    price: 200,
  },
  {
    title: "The Dark Knight",
    description: "Batman faces a criminal who threatens Gotham City.",
    poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    genre: "Action",
    duration: 152,
    language: "English",
    rating: 9.0,
    price: 200,
  },
  {
    title: "Dune: Part Two",
    description: "Paul Atreides joins the Fremen on a journey of destiny and revenge.",
    poster: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    genre: "Sci-Fi",
    duration: 166,
    language: "English",
    rating: 8.5,
    price: 200,
  },
  {
    title: "The Shawshank Redemption",
    description: "Two imprisoned men develop a friendship over many years.",
    poster: "https://image.tmdb.org/t/p/w500/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg",
    genre: "Drama",
    duration: 142,
    language: "English",
    rating: 9.3,
    price: 200,
  },
  {
    title: "The Godfather",
    description: "The aging head of a crime family transfers control to his son.",
    poster: "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
    genre: "Crime",
    duration: 175,
    language: "English",
    rating: 9.2,
    price: 200,
  },
  {
    title: "Pulp Fiction",
    description: "Interconnected crime stories unfold in Los Angeles.",
    poster: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
    genre: "Crime",
    duration: 154,
    language: "English",
    rating: 8.9,
    price: 200,
  },
  {
    title: "Fight Club",
    description: "An office worker forms an underground fight club.",
    poster: "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    genre: "Drama",
    duration: 139,
    language: "English",
    rating: 8.8,
    price: 200,
  },
  {
    title: "Forrest Gump",
    description: "A kind-hearted man experiences defining moments in American history.",
    poster: "https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
    genre: "Drama",
    duration: 142,
    language: "English",
    rating: 8.8,
    price: 200,
  },
  {
    title: "The Matrix",
    description: "A hacker discovers that reality is not what it seems.",
    poster: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
    genre: "Sci-Fi",
    duration: 136,
    language: "English",
    rating: 8.7,
    price: 200,
  },
  {
    title: "Avatar",
    description: "A marine becomes involved in the struggle to protect an alien world.",
    poster: "https://image.tmdb.org/t/p/w500/kyeqWdyUXW608qlYkRqosgbbJyK.jpg",
    genre: "Adventure",
    duration: 162,
    language: "English",
    rating: 7.9,
    price: 220,
  },
  {
    title: "Titanic",
    description: "A romance unfolds aboard the famous ocean liner.",
    poster: "https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg",
    genre: "Romance",
    duration: 195,
    language: "English",
    rating: 7.9,
    price: 200,
  },
  {
    title: "Joker",
    description: "A troubled comedian descends into chaos in Gotham City.",
    poster: "https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg",
    genre: "Crime",
    duration: 122,
    language: "English",
    rating: 8.1,
    price: 200,
  },
  {
    title: "Avengers: Endgame",
    description: "The Avengers attempt to reverse the devastation caused by Thanos.",
    poster: "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
    genre: "Action",
    duration: 181,
    language: "English",
    rating: 8.4,
    price: 250,
  },
  {
    title: "Spider-Man: No Way Home",
    description: "Peter Parker seeks help after his identity is revealed.",
    poster: "https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
    genre: "Action",
    duration: 148,
    language: "English",
    rating: 8.2,
    price: 220,
  },
  {
    title: "Top Gun: Maverick",
    description: "A veteran pilot trains a new generation for a dangerous mission.",
    poster: "https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg",
    genre: "Action",
    duration: 130,
    language: "English",
    rating: 8.2,
    price: 220,
  },
  {
    title: "Oppenheimer",
    description: "A scientist leads the development of the first atomic bomb.",
    poster: "https://image.tmdb.org/t/p/w500/ptpr0kGAckfQkJeJIt8st5dglvd.jpg",
    genre: "Drama",
    duration: 180,
    language: "English",
    rating: 8.3,
    price: 250,
  },
  {
    title: "The Batman",
    description: "Batman investigates corruption and crimes in Gotham City.",
    poster: "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg",
    genre: "Action",
    duration: 176,
    language: "English",
    rating: 7.8,
    price: 220,
  },
  {
    title: "Iron Man",
    description: "A billionaire inventor builds an armored suit to fight evil.",
    poster: "https://image.tmdb.org/t/p/w500/78lPtwv72eTNqFW9COBYI0dWDJa.jpg",
    genre: "Action",
    duration: 126,
    language: "English",
    rating: 7.9,
    price: 200,
  },
  {
    title: "Doctor Strange",
    description: "A surgeon discovers the hidden world of mystical arts.",
    poster: "https://image.tmdb.org/t/p/w500/uGBVj3bEbCoZbDjjl9wTxcygko1.jpg",
    genre: "Fantasy",
    duration: 115,
    language: "English",
    rating: 7.5,
    price: 200,
  },
  {
    title: "Coco",
    description: "A young musician explores the Land of the Dead to discover his family history.",
    poster: "https://image.tmdb.org/t/p/w500/gGEsBPAijhVUFoiNpgZXqRVWJt2.jpg",
    genre: "Animation",
    duration: 105,
    language: "English",
    rating: 8.4,
    price: 180,
  },
  {
    title: "Toy Story",
    description: "Toys come to life when humans are not around.",
    poster: "https://image.tmdb.org/t/p/w500/uXDfjJbdP4ijW5hWSBrPrlKpxab.jpg",
    genre: "Animation",
    duration: 81,
    language: "English",
    rating: 8.3,
    price: 180,
  },
  {
    title: "The Lion King",
    description: "A young lion discovers his place in the circle of life.",
    poster: "https://image.tmdb.org/t/p/w500/sKCr78MXSLixwmZ8DyJLrpMsd15.jpg",
    genre: "Animation",
    duration: 88,
    language: "English",
    rating: 8.5,
    price: 180,
  },
  {
    title: "Your Name",
    description: "Two teenagers mysteriously begin exchanging bodies.",
    poster: "https://image.tmdb.org/t/p/w500/q719jXXEzOoYaps6babgKnONONX.jpg",
    genre: "Animation",
    duration: 106,
    language: "Japanese",
    rating: 8.4,
    price: 180,
  },
  {
    title: "Parasite",
    description: "A poor family becomes entangled with a wealthy household.",
    poster: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
    genre: "Thriller",
    duration: 132,
    language: "Korean",
    rating: 8.5,
    price: 200,
  },
];

async function seedMovies() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from your server/.env file.");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB.");

    for (const movie of movies) {
      await Movie.findOneAndUpdate(
        { title: movie.title },
        { $set: movie },
        {
          upsert: true,
          new: true,
          runValidators: true,
        }
      );

      console.log(`Added or updated: ${movie.title}`);
    }

    console.log(`\nSuccessfully processed ${movies.length} movies.`);
  } catch (error) {
    console.error("Error seeding movies:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedMovies();
