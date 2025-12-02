// middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");
const { errorResponse } = require("../utils/response");

module.exports = (req, res, next) => {
  try {
    const authHeader =
      req.headers["authorization"] ||
      req.cookies?.Authorization ||
      req.body.Authorization;

    if (!authHeader) {
      return errorResponse(res, "Authorization header missing", 401);
    }

    // Header format: "Bearer <token>"
    const token = authHeader.split(" ")[1];
    if (!token) {
      return errorResponse(res, "Invalid token format", 401);
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.id) {
      return errorResponse(res, "Invalid or expired token", 401);
    }

    // Attach user to request (id, email, role, etc.)
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (err) {
    console.error("Auth error:", err.message);

    if (err.name === "TokenExpiredError") {
      return errorResponse(res, "Token expired", 401);
    }

    return errorResponse(res, "Unauthorized", 401);
  }
};
