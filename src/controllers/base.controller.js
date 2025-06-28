const { HTTP_STATUS } = require('../const');
const logger = require('../logger/logger');

class BaseController {
  constructor() {
    this.handleSuccess = this.handleSuccess.bind(this);
    this.handleError = this.handleError.bind(this);
  }

  /**
   * Handle successful responses
   */
  handleSuccess(res, data, message = 'Success', statusCode = HTTP_STATUS.OK) {
    const response = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    };

    logger.info('Success response', {
      statusCode,
      message,
      dataKeys: data ? Object.keys(data) : []
    });

    return res.status(statusCode).json(response);
  }

  /**
   * Handle error responses
   */
  handleError(res, error, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    const response = {
      success: false,
      message: error.message || 'An error occurred',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: new Date().toISOString()
    };

    logger.error('Error response', {
      statusCode,
      message: error.message,
      stack: error.stack
    });

    return res.status(statusCode).json(response);
  }

  /**
   * Handle validation errors
   */
  handleValidationError(res, errors) {
    const response = {
      success: false,
      message: 'Validation failed',
      errors,
      timestamp: new Date().toISOString()
    };

    logger.warn('Validation error', { errors });

    return res.status(HTTP_STATUS.BAD_REQUEST).json(response);
  }

  /**
   * Extract user information from request
   */
  getUserFromRequest(req) {
    return req.user || null;
  }

  /**
   * Paginate results
   */
  paginate(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    return { limit: parseInt(limit), offset: parseInt(offset) };
  }

  /**
   * Format pagination response
   */
  formatPaginatedResponse(data, total, page, limit) {
    return {
      items: data,
      pagination: {
        total: parseInt(total),
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
  }
}

module.exports = BaseController;
