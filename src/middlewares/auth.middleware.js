const jwt = require("jsonwebtoken");
const config = require("../config/config");
const logger = require("../logger/logger");
const ErrorHandler = require("../shared/utils/ErrorHandler");

/**
 * Authentication middleware to verify JWT tokens
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
        timestamp: new Date().toISOString(),
      });
    }

    // Check if token starts with 'Bearer '
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Invalid token format. Expected: Bearer <token>",
        timestamp: new Date().toISOString(),
      });
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
        timestamp: new Date().toISOString(),
      });
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);

    // Add user info to request object
    req.user = {
      id: decoded.id || decoded.userId,
      email: decoded.email,
      role: decoded.role,
      firstName: decoded.firstName,
      lastName: decoded.lastName,
    };

    logger.info("User authenticated successfully", {
      userId: req.user.id,
      email: req.user.email,
      role: req.user.role,
      endpoint: req.originalUrl,
    });

    next();
  } catch (error) {
    logger.error("Authentication failed", {
      error: error.message,
      endpoint: req.originalUrl,
      ip: req.ip,
    });

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token.",
        timestamp: new Date().toISOString(),
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired.",
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Authentication error.",
      timestamp: new Date().toISOString(),
    });
  }
};

module.exports = authMiddleware;
