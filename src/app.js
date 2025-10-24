const express = require("express");
const cors = require("cors");
const routes = require("./modules/index");

const app = express();

app.use(express.json());
app.use(cors());

// All module routes
app.use("/api/v1", routes);

app.get("/", (req, res) => {
  res.send("Hello from Express and WebSockets!");
});

module.exports = { app };
