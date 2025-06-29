const logger = require("../logger/logger");
const { ErrorHandler } = require("../shared/utils/ErrorHandler");
const { HTTP_STATUS } = require("../const");

function globalErrorMiddleware(err, req, res, next) {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error("Global error handler", {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = "Resource not found";
    error = new ErrorHandler(HTTP_STATUS.NOT_FOUND, message);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = "Duplicate field value entered";
    error = new ErrorHandler(HTTP_STATUS.BAD_REQUEST, message);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new ErrorHandler(HTTP_STATUS.BAD_REQUEST, message);
  }

  // Sequelize validation error
  if (err.name === "SequelizeValidationError") {
    const message = err.errors.map((e) => e.message).join(", ");
    error = new ErrorHandler(HTTP_STATUS.BAD_REQUEST, message);
  }

  // Sequelize unique constraint error
  if (err.name === "SequelizeUniqueConstraintError") {
    const message = "Duplicate field value entered";
    error = new ErrorHandler(HTTP_STATUS.BAD_REQUEST, message);
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token";
    error = new ErrorHandler(HTTP_STATUS.UNAUTHORIZED, message);
  }

  if (err.name === "TokenExpiredError") {
    const message = "Token expired";
    error = new ErrorHandler(HTTP_STATUS.UNAUTHORIZED, message);
  }

  // Multer errors
  if (err.code === "LIMIT_FILE_SIZE") {
    const message = "File size too large";
    error = new ErrorHandler(HTTP_STATUS.BAD_REQUEST, message);
  }

  if (err.code === "LIMIT_FILE_COUNT") {
    const message = "Too many files";
    error = new ErrorHandler(HTTP_STATUS.BAD_REQUEST, message);
  }

  // Fix: Add fallback for undefined status codes
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    ...(error.isOperational && { details: error.details }),
  });
}

module.exports = globalErrorMiddleware;
