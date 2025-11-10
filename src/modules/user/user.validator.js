const { body } = require("express-validator");

exports.getUserValidator = [
  body("userId").notEmpty().isUUID().withMessage("Valid user id is required"),
];
