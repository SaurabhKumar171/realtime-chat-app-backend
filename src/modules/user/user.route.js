const express = require("express");
const router = express.Router();

const userController = require("./user.controller");
const { getUserValidator } = require("./user.validator");
const { validateRequest } = require("../../middleware/validateRequest");

// Fetch profile of authenticated user
router.get("/me", userController.getUser);

// Update name, photo, etc.
router.patch("/me", userController.updateProfile);

// Search by name/email
router.get("/search", userController.searchUser);

// Get current user
router.get("/:userId", userController.fetchUserById);

module.exports = router;
