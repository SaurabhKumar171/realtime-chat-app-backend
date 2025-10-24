function broadcastMessage(wss, message) {
  const payload = JSON.stringify(message);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

const handleJoin = (ws, userName, wss) => {
  const joinMsg = {
    type: "system",
    text: `${userName} joined the chat.`,
    ts: new Date().toISOString(),
  };
  broadcastMessage(wss, joinMsg);
};

const handleLeave = (ws, userName, wss) => {
  const leaveMsg = {
    type: "system",
    text: `${userName} left the chat.`,
    ts: new Date().toISOString(),
  };
  broadcastMessage(wss, leaveMsg);
};

const handleUserMessage = (ws, text, userName, wss) => {
  const msg = {
    type: "message",
    text,
    sender: userName,
    ts: new Date().toISOString(),
  };
  broadcastMessage(wss, msg);
};

const handleUSerTyping = (ws, typingUsers, wss) => {
  const username = ws.username;
  const msg = {
    type: "typing",
    typing_users: typingUsers,
  };
  broadcastMessage(wss, msg);
};

const sendDirectMessage = (text, sender, wss, receiver, users) => {
  if (!wss.clients || wss.clients.size === 0) return;

  const payload = JSON.stringify({
    type: "dm",
    text,
    sender: sender.username,
    receiver,
  });

  console.log("payload -> ", payload);

  wss.clients.forEach((client) => {
    const isReceiver = client.username === receiver;

    if (isReceiver && client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
};

const sendUsersCount = (wss, users) => {
  if (!wss.clients || wss.clients.size === 0) return;

  const payload = JSON.stringify({
    type: "user_count",
    count: users.size,
  });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
};

const sendUsers = (wss, users) => {
  if (!wss.clients || wss.clients.size === 0) return;

  const userList = Array.from(users.keys());
  const payload = JSON.stringify({
    type: "users",
    userList,
  });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
};

module.exports = {
  handleJoin,
  handleLeave,
  handleUserMessage,
  handleUSerTyping,
  broadcastMessage,
  sendDirectMessage,
  sendUsersCount,
  sendUsers,
};
