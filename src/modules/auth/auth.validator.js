const { body } = require("express-validator");

exports.signupValidator = [
  body("username")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters long"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

exports.loginValidator = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

exports.logoutValidator = [
  body("userId").notEmpty().withMessage("Valid user id is required"),
];

exports.refreshTokenValidator = (req, res, next) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Refresh token not found in body, cookies, or headers",
    });
  }

  req.token = token;
  next();
};
