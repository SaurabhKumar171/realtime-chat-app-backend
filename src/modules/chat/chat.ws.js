const WebSocket = require("ws");
const {
  handleJoin,
  handleLeave,
  handleUserMessage,
  handleUSerTyping,
  broadcastMessage,
  sendDirectMessage,
  sendUsersCount,
  sendUsers,
} = require("../../utils/broadcast.js");
const { chatType } = require("./chat.constant.js");
const { v4: uuidv4 } = require("uuid");

/**
 * Sets up WebSocket event handling for real-time chat.
 * Handles user identification, group messaging, direct messaging, and disconnects.
 *
 * @param {WebSocket.Server} wss - The WebSocket server instance.
 */
const setUpChatWebSocket = (wss) => {
  const users = new Map(); // username -> WebSocket
  const typingUsers = new Set();
  const storedMessages = [];

  wss.on("connection", (ws) => {
    ws.username = null;

    ws.on("message", (message) => {
      let msg;
      try {
        msg = JSON.parse(message.toString());
      } catch (err) {
        console.error("Invalid message format:", message);
        return;
      }

      switch (msg.type) {
        /**
         * User identification (initial handshake)
         */
        case "identify":
          if (ws.username) return; // ignore if already identified

          ws.username = msg.user_name?.trim();
          if (!ws.username) return;

          users.set(ws.username, ws);

          handleJoin(ws, ws.username, wss);
          sendUsersCount(wss, users);
          sendUsers(wss, users);

          ws.send(JSON.stringify({ type: chatType.HISTORY, storedMessages }));

          break;

        /**
         * Group chat message
         */
        case chatType.GROUP_CHAT:
          if (!ws.username) return;

          const msgObj = {
            id: uuidv4(),
            type: chatType.GROUP_CHAT,
            sender: ws.username,
            text: msg.message,
            ts: msg.timeStamp,
          };
          storedMessages.push(msgObj);
          if (storedMessages.length > 20) storedMessages.shift();

          handleUserMessage(ws, msg.message, ws.username, wss);
          break;

        /**
         * Direct message
         */
        case chatType.DIRECT_MESSAGE:
          if (!ws.username) return;

          sendDirectMessage(
            `[${msg.timeStamp}] ${ws.username}: ${msg.message}`,
            ws,
            wss,
            msg.sendTo,
            users
          );
          break;

        case chatType.TYPING:
          if (!ws.username) return;
          if (msg.action === "start") {
            typingUsers.add(ws.username);
          } else if (msg.action === "stop") {
            typingUsers.delete(ws.username);
          }

          handleUSerTyping(ws, Array.from(typingUsers), wss);
          break;

        default:
          console.warn("Unknown message type:", msg.type);
          break;
      }
    });

    /**
     * Handle client disconnection
     */
    ws.on("close", () => {
      if (ws.username && users.has(ws.username)) {
        users.delete(ws.username);

        handleLeave(ws, ws.username, wss);
        // broadcastMessage(`${ws.username} left the chat.`, ws, wss);

        sendUsersCount(wss, users);
      }
    });

    /**
     * Handle connection errors gracefully
     */
    ws.on("error", (err) => {
      console.error(`WebSocket error (${ws.username || "unknown"}):`, err);
    });
  });
};

module.exports = { setUpChatWebSocket };
