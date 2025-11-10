const express = require("express");
// const chatRoutes = require("./chat/chat.routes.js");
const authRoutes = require("./auth/auth.route.js");
const userRoutes = require("./user/user.route.js");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);

// router.use("/chat", chatRoutes);

module.exports = router;
