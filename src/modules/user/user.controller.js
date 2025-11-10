const userService = require("./user.service");
const { successResponse, errorResponse } = require("../../utils/response");
const jwt = require("jsonwebtoken");

exports.getUser = async (req, res, next) => {
  try {
    const authHeader =
      req.headers["authorization"] ||
      req.cookies?.Authorization ||
      req.body.Authorization;

    if (!authHeader) {
      return errorResponse(res, "Authorization header missing", 401);
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return errorResponse(res, "Invalid token format", 401);
    }

    // ✅ Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.id) {
      return errorResponse(res, "Invalid or expired token", 401);
    }

    // ✅ Fetch user via service
    const user = await userService.getUser(decoded.id);

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    return successResponse(res, user);
  } catch (err) {
    console.error("getUser error:", err);
    return errorResponse(res, err.message, 500);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const authHeader =
      req.headers["authorization"] ||
      req.cookies?.Authorization ||
      req.body.Authorization;

    if (!authHeader) {
      return errorResponse(res, "Authorization header missing", 401);
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return errorResponse(res, "Invalid token format", 401);
    }

    // ✅ Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.id) {
      return errorResponse(res, "Invalid or expired token", 401);
    }

    const updated = await userService.updateProfile(decoded?.id, req.body);
    return successResponse(res, updated);
  } catch (err) {
    return next(err);
  }
};

exports.fetchUserById = async (req, res, next) => {
  try {
    const user = await userService.fetchUserById(req.params.userId);
    if (!user) return errorResponse(res, "User not found", 404);
    return successResponse(res, user);
  } catch (err) {
    return next(err);
  }
};

exports.searchUser = async (req, res, next) => {
  try {
    const query = req.query.q || "";

    const users = await userService.searchUser(query);
    return successResponse(res, users);
  } catch (err) {
    return next(err);
  }
};
