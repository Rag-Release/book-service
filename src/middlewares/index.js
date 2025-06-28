// Middleware exports for centralized import

const authMiddleware = require("./auth.middleware");
const roleMiddleware = require("./role.middleware");
const globalErrorMiddleware = require("./globalError.middleware");
const validateMiddleware = require("./validate.middleware");

module.exports = {
  authMiddleware,
  roleMiddleware,
  globalErrorMiddleware,
  validateMiddleware,
};
