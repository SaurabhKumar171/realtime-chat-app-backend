require("dotenv").config();

const config = {
  env: process.env.NODE_ENV || "development",
  port: process.env.PORT || 3000,
  mongo: {
    uri: process.env.MONGO_URI,
    options: {
      maxPoolSize: 50, // connection pool size
      minPoolSize: 5,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
    },
  },
};

module.exports = { config };
