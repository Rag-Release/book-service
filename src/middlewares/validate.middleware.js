const logger = require("../logger/logger");

/**
 * Validation middleware using Joi schemas
 * @param {Object} schema - Joi validation schema object with body, params, query properties
 * @returns {Function} Middleware function
 */
const validateMiddleware = (schema) => {
  return (req, res, next) => {
    try {
      const validationErrors = [];

      // Validate request body
      if (schema.body) {
        const { error } = schema.body.validate(req.body, {
          abortEarly: false,
          allowUnknown: false,
          stripUnknown: true,
        });

        if (error) {
          error.details.forEach((detail) => {
            validationErrors.push({
              field: detail.path.join("."),
              message: detail.message,
              type: "body",
            });
          });
        } else {
          // Update req.body with validated/transformed data
          req.body = schema.body.validate(req.body).value;
        }
      }

      // Validate request parameters
      if (schema.params) {
        const { error } = schema.params.validate(req.params, {
          abortEarly: false,
          allowUnknown: false,
          stripUnknown: true,
        });

        if (error) {
          error.details.forEach((detail) => {
            validationErrors.push({
              field: detail.path.join("."),
              message: detail.message,
              type: "params",
            });
          });
        } else {
          // Update req.params with validated/transformed data
          req.params = schema.params.validate(req.params).value;
        }
      }

      // Validate query parameters
      if (schema.query) {
        const { error } = schema.query.validate(req.query, {
          abortEarly: false,
          allowUnknown: false,
          stripUnknown: true,
        });

        if (error) {
          error.details.forEach((detail) => {
            validationErrors.push({
              field: detail.path.join("."),
              message: detail.message,
              type: "query",
            });
          });
        } else {
          // Update req.query with validated/transformed data
          req.query = schema.query.validate(req.query).value;
        }
      }

      // If there are validation errors, return them
      if (validationErrors.length > 0) {
        logger.warn("Validation failed", {
          endpoint: req.originalUrl,
          method: req.method,
          errors: validationErrors,
          userId: req.user?.id,
        });

        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validationErrors,
          timestamp: new Date().toISOString(),
        });
      }

      logger.debug("Validation successful", {
        endpoint: req.originalUrl,
        method: req.method,
        userId: req.user?.id,
      });

      next();
    } catch (error) {
      logger.error("Validation middleware error", {
        error: error.message,
        endpoint: req.originalUrl,
        method: req.method,
        userId: req.user?.id,
      });

      return res.status(500).json({
        success: false,
        message: "Validation error occurred",
        timestamp: new Date().toISOString(),
      });
    }
  };
};

module.exports = {
  validateMiddleware,
};
