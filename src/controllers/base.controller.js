const logger = require("../logger/logger");

/**
 * Base controller class with common functionality
 */
class BaseController {
  /**
   * Send success response
   * @param {Object} res - Express response object
   * @param {*} data - Response data
   * @param {string} message - Success message
   * @param {number} statusCode - HTTP status code
   */
  sendSuccess(res, data = null, message = "Success", statusCode = 200) {
    const response = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    logger.info("Successful response sent", {
      statusCode,
      message,
      hasData: !!data,
    });

    return res.status(statusCode).json(response);
  }

  /**
   * Send error response
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {*} errors - Additional error details
   */
  sendError(res, message = "Error occurred", statusCode = 500, errors = null) {
    const response = {
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString(),
    };

    logger.error("Error response sent", {
      statusCode,
      message,
      errors,
    });

    return res.status(statusCode).json(response);
  }

  /**
   * Send paginated response
   * @param {Object} res - Express response object
   * @param {Object} data - Paginated data with items and pagination info
   * @param {string} message - Success message
   * @param {number} statusCode - HTTP status code
   */
  sendPaginatedResponse(
    res,
    data,
    message = "Data retrieved successfully",
    statusCode = 200
  ) {
    const response = {
      success: true,
      message,
      data: data.items || data.rows || [],
      pagination: {
        page: data.pagination?.page || data.page || 1,
        limit: data.pagination?.limit || data.limit || 10,
        total: data.pagination?.total || data.count || 0,
        totalPages: Math.ceil(
          (data.pagination?.total || data.count || 0) /
            (data.pagination?.limit || data.limit || 10)
        ),
      },
      timestamp: new Date().toISOString(),
    };

    logger.info("Paginated response sent", {
      statusCode,
      message,
      totalItems: response.pagination.total,
      currentPage: response.pagination.page,
    });

    return res.status(statusCode).json(response);
  }

  /**
   * Handle async controller methods
   * @param {Function} fn - Async function to wrap
   */
  asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  /**
   * Extract pagination parameters from request
   * @param {Object} req - Express request object
   * @returns {Object} Pagination parameters
   */
  getPaginationParams(req) {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const offset = (page - 1) * limit;

    return {
      page,
      limit,
      offset,
    };
  }

  /**
   * Extract sorting parameters from request
   * @param {Object} req - Express request object
   * @param {Array} allowedFields - Array of allowed sort fields
   * @returns {Object} Sorting parameters
   */
  getSortParams(req, allowedFields = []) {
    const sortBy = req.query.sortBy;
    const sortOrder =
      req.query.sortOrder?.toUpperCase() === "DESC" ? "DESC" : "ASC";

    if (sortBy && allowedFields.includes(sortBy)) {
      return {
        sortBy,
        sortOrder,
        order: [[sortBy, sortOrder]],
      };
    }

    return {
      sortBy: "createdAt",
      sortOrder: "DESC",
      order: [["createdAt", "DESC"]],
    };
  }
}

module.exports = BaseController;
