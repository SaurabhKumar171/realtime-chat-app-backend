const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app); // Create an HTTP server from your Express app
const wss = new WebSocket.Server({ server }); // Create a WebSocket server attached to the HTTP server

let userCount = 0;
wss.on("connection", function connection(ws) {
  console.log("Client connected", ++userCount);
  ws.username = null;

  ws.send(
    JSON.stringify({
      type: "prompt_username",
      message: "Please enter your username:",
    })
  );

  ws.on("message", function incoming(message, binary) {
    const msg = message.toString();

    // username not set yet
    if (!ws.username) {
      ws.username = msg;
      ws.send(
        JSON.stringify({
          type: "welcome_message",
          message: `Welcome, ${ws.username}!`,
        })
      );

      broadCast(`${ws.username} joined the chat.`, userCount, ws);
      return;
    }

    broadCast(`${ws.username}: ${msg}`, userCount, ws);
  });

  ws.on("close", () => {
    if (ws.username) {
      userCount--;
      broadCast(`${ws.username} has left the chat`, userCount, ws);
    }
    console.log("Client disconnected");
  });
});

// Helper: broadcast message to all except sender
const broadCast = (message, userCount, sender) => {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({ type: "chat", message, user_count: userCount })
      );
    }
  });
};

app.get("/", (req, res) => {
  res.send("Hello from Express and WebSockets!");
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
