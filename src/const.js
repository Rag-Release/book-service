module.exports = {
  // Book Status Constants
  BOOK_STATUS: {
    DRAFT: 'DRAFT',
    IN_REVIEW: 'IN_REVIEW',
    NEEDS_REVISION: 'NEEDS_REVISION',
    APPROVED: 'APPROVED',
    PUBLISHED: 'PUBLISHED',
    ARCHIVED: 'ARCHIVED'
  },

  // User Roles
  USER_ROLES: {
    AUTHOR: 'AUTHOR',
    REVIEWER: 'REVIEWER',
    DESIGNER: 'DESIGNER',
    PUBLISHER: 'PUBLISHER',
    ADMIN: 'ADMIN',
    READER: 'READER'
  },

  // Publishing Methods
  PUBLISHING_METHODS: {
    DIGITAL: 'DIGITAL',
    PRINT: 'PRINT',
    BOTH: 'BOTH'
  },

  // File Types
  FILE_TYPES: {
    COVER: 'COVER',
    CERTIFICATE: 'CERTIFICATE',
    MANUSCRIPT: 'MANUSCRIPT'
  },

  // Payment Status
  PAYMENT_STATUS: {
    PENDING: 'PENDING',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED',
    REFUNDED: 'REFUNDED'
  },

  // Review Types
  REVIEW_TYPES: {
    EDITORIAL: 'EDITORIAL',
    READER: 'READER'
  },

  // Error Messages
  ERROR_MESSAGES: {
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Insufficient permissions',
    NOT_FOUND: 'Resource not found',
    VALIDATION_ERROR: 'Validation error',
    SERVER_ERROR: 'Internal server error'
  },

  // HTTP Status Codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
  }
};
