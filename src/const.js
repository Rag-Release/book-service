module.exports = {
  // Book Status Constants
  BOOK_STATUS: {
    DRAFT: "DRAFT",
    IN_REVIEW: "IN_REVIEW",
    NEEDS_REVISION: "NEEDS_REVISION",
    APPROVED: "APPROVED",
    PUBLISHED: "PUBLISHED",
    ARCHIVED: "ARCHIVED",
    REJECTED: "REJECTED",
  },

  // ISBN status constants
  ISBN_STATUS: {
    NOT_REQUESTED: "NOT_REQUESTED",
    REQUESTED: "REQUESTED",
    ASSIGNED: "ASSIGNED",
    VERIFIED: "VERIFIED",
    PUBLISHED: "PUBLISHED",
  },

  // ISBN certificate verification status
  ISBN_VERIFICATION_STATUS: {
    PENDING: "PENDING",
    VERIFIED: "VERIFIED",
    REJECTED: "REJECTED",
    EXPIRED: "EXPIRED",
  },

  // ISBN audit log actions
  ISBN_AUDIT_ACTIONS: {
    CREATED: "CREATED",
    UPDATED: "UPDATED",
    VERIFIED: "VERIFIED",
    REJECTED: "REJECTED",
    RESUBMITTED: "RESUBMITTED",
    DEACTIVATED: "DEACTIVATED",
    ACTIVATED: "ACTIVATED",
    DELETED: "DELETED",
  },

  // Publishing Methods
  PUBLISHING_METHODS: {
    DIGITAL: "DIGITAL",
    PRINT: "PRINT",
    BOTH: "BOTH",
    TRADITIONAL: "TRADITIONAL",
    SELF_PUBLISHED: "SELF_PUBLISHED",
    DIGITAL_ONLY: "DIGITAL_ONLY",
  },

  // User Roles
  USER_ROLES: {
    AUTHOR: "AUTHOR",
    REVIEWER: "REVIEWER",
    DESIGNER: "DESIGNER",
    PUBLISHER: "PUBLISHER",
    ADMIN: "ADMIN",
    READER: "READER",
  },

  // File Types
  FILE_TYPES: {
    COVER: "COVER",
    CERTIFICATE: "CERTIFICATE",
    MANUSCRIPT: "MANUSCRIPT",
  },

  // Allowed file types
  ALLOWED_FILE_TYPES: {
    CERTIFICATE: [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/tiff",
      "image/tif",
    ],
    COVER: ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/tiff"],
  },

  // File size limits (in bytes)
  FILE_SIZE_LIMITS: {
    CERTIFICATE: 10 * 1024 * 1024, // 10MB
    COVER: 5 * 1024 * 1024, // 5MB
    DOCUMENT: 20 * 1024 * 1024, // 20MB
  },

  // S3 bucket prefixes
  S3_PREFIXES: {
    CERTIFICATES: "isbn-certificates/",
    COVERS: "book-covers/",
    DOCUMENTS: "documents/",
  },

  // Pagination defaults
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },

  // Error Codes
  ERROR_CODES: {
    VALIDATION_ERROR: "VALIDATION_ERROR",
    AUTHENTICATION_ERROR: "AUTHENTICATION_ERROR",
    AUTHORIZATION_ERROR: "AUTHORIZATION_ERROR",
    NOT_FOUND: "NOT_FOUND",
    CONFLICT: "CONFLICT",
    FILE_UPLOAD_ERROR: "FILE_UPLOAD_ERROR",
    DATABASE_ERROR: "DATABASE_ERROR",
    EXTERNAL_SERVICE_ERROR: "EXTERNAL_SERVICE_ERROR",
  },

  // ISBN format regex patterns
  ISBN_PATTERNS: {
    ISBN13: /^978-\d{1}-\d{5}-\d{3}-\d{1}$/,
    ISBN10: /^\d{1}-\d{5}-\d{3}-[\dX]$/,
    COUNTRY_CODE: /^[A-Z]{3}$/,
  },

  // HTTP Status Codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
  },
};
