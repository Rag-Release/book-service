const logger = require("../logger/logger");

/**
 * Role-based access control middleware
 * @param {Array} allowedRoles - Array of roles that can access the route
 * @returns {Function} Middleware function
 */
const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        logger.warn("Unauthorized access attempt - no user context", {
          endpoint: req.originalUrl,
          ip: req.ip,
        });

        return res.status(401).json({
          success: false,
          message: "Authentication required.",
          timestamp: new Date().toISOString(),
        });
      }

      // Check if user has required role
      if (!req.user.role) {
        logger.warn("Access denied - no role assigned", {
          userId: req.user.id,
          endpoint: req.originalUrl,
        });

        return res.status(403).json({
          success: false,
          message: "Access denied. No role assigned.",
          timestamp: new Date().toISOString(),
        });
      }

      // Check if user's role is in allowed roles
      if (!allowedRoles.includes(req.user.role)) {
        logger.warn("Access denied - insufficient permissions", {
          userId: req.user.id,
          userRole: req.user.role,
          requiredRoles: allowedRoles,
          endpoint: req.originalUrl,
        });

        return res.status(403).json({
          success: false,
          message: `Access denied. Required roles: ${allowedRoles.join(", ")}`,
          timestamp: new Date().toISOString(),
        });
      }

      logger.info("Role authorization successful", {
        userId: req.user.id,
        userRole: req.user.role,
        endpoint: req.originalUrl,
      });

      next();
    } catch (error) {
      logger.error("Role middleware error", {
        error: error.message,
        userId: req.user?.id,
        endpoint: req.originalUrl,
      });

      return res.status(500).json({
        success: false,
        message: "Authorization error.",
        timestamp: new Date().toISOString(),
      });
    }
  };
};

module.exports = roleMiddleware;
