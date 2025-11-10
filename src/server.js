const http = require("http");
const WebSocket = require("ws");
const { app } = require("./app"); // Import your Express app
const { setUpChatWebSocket } = require("./modules/chat/chat.ws");
require("dotenv").config();
const { config } = require("../src/config/db");

const server = http.createServer(app); // Create an HTTP server from your Express app
const wss = new WebSocket.Server({ server }); // Create a WebSocket server attached to the HTTP server
setUpChatWebSocket(wss);

// Start HTTP + WS server
const port = config.port;
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
