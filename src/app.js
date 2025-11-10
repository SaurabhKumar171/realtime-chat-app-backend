const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const routes = require("./modules/index");
const { connectDB } = require("./config/mongoose");

connectDB(); // Connect mongoDB
const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(cors({ origin: "*", credentials: true }));

// All module routes
app.use("/api/v1", routes);

app.get("/", (req, res) => {
  res.send("Hello from Express and WebSockets!");
});

module.exports = { app };
