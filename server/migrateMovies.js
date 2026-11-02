
require("dotenv").config();
const mongoose = require("mongoose");

async function migrateMovies() {
  let sourceConnection;
  let targetConnection;

  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error("MONGODB_URI is missing from .env");
    }

    console.log("Connecting to MongoDB...");

    // Connect to the old database
    sourceConnection = await mongoose.createConnection(uri, {
      dbName: "test",
    }).asPromise();

    // Connect to the new database
    targetConnection = await mongoose.createConnection(uri, {
      dbName: "cinebook",
    }).asPromise();

    const source = sourceConnection.collection("movies");
    const target = targetConnection.collection("movies");

    const oldMovies = await source.find({}).toArray();

    console.log("Movies found in test:", oldMovies.length);

    if (oldMovies.length === 0) {
      console.log("No movies found to migrate.");
      return;
    }

    // Preserve original IDs and avoid duplicate records.
    const operations = oldMovies.map((movie) => ({
      updateOne: {
        filter: { _id: movie._id },
        update: { $setOnInsert: movie },
        upsert: true,
      },
    }));

    const result = await target.bulkWrite(operations, {
      ordered: false,
    });

    const newCount = await target.countDocuments();

    console.log("Migration completed!");
    console.log("New records inserted:", result.upsertedCount);
    console.log("Total movies in cinebook:", newCount);
  } catch (error) {
    console.error("Migration failed:", error.message);
  } finally {
    if (sourceConnection) await sourceConnection.close();
    if (targetConnection) await targetConnection.close();
  }
}

migrateMovies();
