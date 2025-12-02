const express = require("express");
const router = express.Router();

const chatController = require("./chat.controller");
const authMiddleware = require("../../middleware/authMiddleware");

// All chat routes require authentication
router.use(authMiddleware);

// =======================
//   CHAT ROUTES
// =======================

// Create a new chat (DM / Group)
router.post("/", chatController.createChat);

// Get all chats of authenticated user
router.get("/", chatController.getUserChats);

// Get specific chat by MongoDB chatId
router.get("/:chatId", chatController.getChatById);

// Update chat info (name, icon for group only)
router.patch("/:chatId", chatController.updateChat);

// Delete chat
router.delete("/:chatId", chatController.deleteChat);

module.exports = router;
