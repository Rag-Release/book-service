const { HTTP_STATUS, ERROR_MESSAGES } = require('../../const');

class ErrorHandler extends Error {
  constructor(statusCode, message, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

class ValidationError extends ErrorHandler {
  constructor(message = ERROR_MESSAGES.VALIDATION_ERROR) {
    super(HTTP_STATUS.BAD_REQUEST, message);
  }
}

class AuthenticationError extends ErrorHandler {
  constructor(message = ERROR_MESSAGES.UNAUTHORIZED) {
    super(HTTP_STATUS.UNAUTHORIZED, message);
  }
}

class AuthorizationError extends ErrorHandler {
  constructor(message = ERROR_MESSAGES.FORBIDDEN) {
    super(HTTP_STATUS.FORBIDDEN, message);
  }
}

class NotFoundError extends ErrorHandler {
  constructor(message = ERROR_MESSAGES.NOT_FOUND) {
    super(HTTP_STATUS.NOT_FOUND, message);
  }
}

class ServerError extends ErrorHandler {
  constructor(message = ERROR_MESSAGES.SERVER_ERROR) {
    super(HTTP_STATUS.INTERNAL_SERVER_ERROR, message);
  }
}

module.exports = {
  ErrorHandler,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ServerError
};
