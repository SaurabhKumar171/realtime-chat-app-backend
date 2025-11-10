const mongoose = require("mongoose");
const { config } = require("./db.js");

const connectDB = async (retries = 5, delay = 5000) => {
  try {
    await mongoose.connect(config.mongo.uri, config.mongo.options);
    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);

    if (retries > 0) {
      console.log(
        `🔁 Retrying in ${delay / 1000}s... (${retries} retries left)`
      );
      setTimeout(() => connectDB(retries - 1, delay), delay);
    } else {
      console.error("💥 All retries failed. Exiting process.");
      process.exit(1);
    }
  }

  // Graceful shutdown
  process.on("SIGINT", async () => {
    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed due to app termination.");
    process.exit(0);
  });
};
module.exports = { connectDB };
