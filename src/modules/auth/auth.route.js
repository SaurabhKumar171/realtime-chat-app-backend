const express = require("express");
const router = express.Router();

const { login, signup, logout, refreshToken } = require("./auth.controller");
const {
  signupValidator,
  loginValidator,
  logoutValidator,
  refreshTokenValidator,
} = require("./auth.validator");
const { validateRequest } = require("../../middleware/validateRequest");

// Signup Route
router.post("/signup", signupValidator, validateRequest, signup);

// Login Route
router.post("/login", loginValidator, validateRequest, login);

// Logout Route
router.post("/logout", logoutValidator, validateRequest, logout);

// Token Refresh Route
router.post("/refresh", refreshTokenValidator, validateRequest, refreshToken);

module.exports = router;
