
require("dotenv").config();

const mongoose = require("mongoose");
const User = require("./models/user");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function makeAdmin() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from .env");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB.");

    const email = await new Promise((resolve) => {
      rl.question("Enter your registered email: ", resolve);
    });

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      console.log("Email is required.");
      return;
    }

    const user = await User.findOneAndUpdate(
      { email: normalizedEmail },
      { $set: { role: "admin" } },
      { new: true, runValidators: true }
    );

    if (!user) {
      console.log(
        "User not found. Register an account first, then run this script again."
      );
      return;
    }

    console.log(`Admin access granted to ${user.email}.`);
    console.log("Log out and log in again to obtain a fresh token.");
  } catch (error) {
    console.error("Unable to grant admin access:", error.message);
    process.exitCode = 1;
  } finally {
    rl.close();
    await mongoose.disconnect();
  }
}

makeAdmin();
