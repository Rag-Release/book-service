const { HTTP_STATUS, ERROR_MESSAGES } = require("../../const");

/**
 * Custom Error Handler class
 */
class ErrorHandler extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);

    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends ErrorHandler {
  constructor(message = ERROR_MESSAGES.VALIDATION_ERROR) {
    super(message, HTTP_STATUS.BAD_REQUEST);
  }
}

class AuthenticationError extends ErrorHandler {
  constructor(message = ERROR_MESSAGES.UNAUTHORIZED) {
    super(message, HTTP_STATUS.UNAUTHORIZED);
  }
}

class AuthorizationError extends ErrorHandler {
  constructor(message = ERROR_MESSAGES.FORBIDDEN) {
    super(message, HTTP_STATUS.FORBIDDEN);
  }
}

class NotFoundError extends ErrorHandler {
  constructor(message = ERROR_MESSAGES.NOT_FOUND) {
    super(message, HTTP_STATUS.NOT_FOUND);
  }
}

class ServerError extends ErrorHandler {
  constructor(message = ERROR_MESSAGES.SERVER_ERROR) {
    super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

module.exports = {
  ErrorHandler,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ServerError,
};
