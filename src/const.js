// Application constants (Updated to camelCase where applicable)

// Book status constants
const BOOK_STATUS = {
  DRAFT: "DRAFT",
  UNDER_REVIEW: "UNDER_REVIEW",
  APPROVED: "APPROVED",
  PUBLISHED: "PUBLISHED",
  REJECTED: "REJECTED",
  ARCHIVED: "ARCHIVED",
};

// Cover design request status constants
const COVER_DESIGN_REQUEST_STATUS = {
  PENDING: "PENDING",
  ASSIGNED: "ASSIGNED",
  IN_PROGRESS: "IN_PROGRESS",
  REVISION_REQUESTED: "REVISION_REQUESTED",
  COMPLETED: "COMPLETED",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
};

// Cover design status constants
const COVER_DESIGN_STATUS = {
  DRAFT: "DRAFT",
  SUBMITTED: "SUBMITTED",
  UNDER_REVIEW: "UNDER_REVIEW",
  REVISION_REQUESTED: "REVISION_REQUESTED",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  SELECTED: "SELECTED",
  PUBLISHED: "PUBLISHED",
};

// Cover design styles
const COVER_DESIGN_STYLES = {
  MINIMALIST: "MINIMALIST",
  VINTAGE: "VINTAGE",
  MODERN: "MODERN",
  ARTISTIC: "ARTISTIC",
  PHOTOGRAPHIC: "PHOTOGRAPHIC",
  ILLUSTRATION: "ILLUSTRATION",
  TYPOGRAPHY: "TYPOGRAPHY",
  ABSTRACT: "ABSTRACT",
  OTHER: "OTHER",
};

// Priority levels
const PRIORITY_LEVELS = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  URGENT: "URGENT",
};

// User roles
const USER_ROLES = {
  AUTHOR: "AUTHOR",
  REVIEWER: "REVIEWER",
  DESIGNER: "DESIGNER",
  PUBLISHER: "PUBLISHER",
  READER: "READER",
  ADMIN: "ADMIN",
};

// ISBN status constants
const ISBN_STATUS = {
  NOT_REQUESTED: "NOT_REQUESTED",
  REQUESTED: "REQUESTED",
  ASSIGNED: "ASSIGNED",
  VERIFIED: "VERIFIED",
  PUBLISHED: "PUBLISHED",
};

// ISBN certificate verification status
const ISBN_VERIFICATION_STATUS = {
  PENDING: "PENDING",
  VERIFIED: "VERIFIED",
  REJECTED: "REJECTED",
  EXPIRED: "EXPIRED",
};

// File type constants (camelCase for keys, but keeping MIME types as-is)
const ALLOWED_FILE_TYPES = {
  certificate: [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/tiff",
    "image/tif",
  ],
  cover: ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/tiff"],
};

// File size limits (in bytes) - camelCase keys
const FILE_SIZE_LIMITS = {
  certificate: 10 * 1024 * 1024, // 10MB
  cover: 50 * 1024 * 1024, // 50MB
  document: 20 * 1024 * 1024, // 20MB
};

// S3 bucket prefixes - camelCase keys
const S3_PREFIXES = {
  certificates: "isbn-certificates/",
  covers: "book-covers/",
  documents: "documents/",
};

// Pagination defaults - camelCase keys
const PAGINATION = {
  defaultPage: 1,
  defaultLimit: 10,
  maxLimit: 100,
};

// Error codes - camelCase keys
const ERROR_CODES = {
  validationError: "VALIDATION_ERROR",
  authenticationError: "AUTHENTICATION_ERROR",
  authorizationError: "AUTHORIZATION_ERROR",
  notFound: "NOT_FOUND",
  conflict: "CONFLICT",
  fileUploadError: "FILE_UPLOAD_ERROR",
  databaseError: "DATABASE_ERROR",
  externalServiceError: "EXTERNAL_SERVICE_ERROR",
};

module.exports = {
  BOOK_STATUS,
  COVER_DESIGN_REQUEST_STATUS,
  COVER_DESIGN_STATUS,
  COVER_DESIGN_STYLES,
  PRIORITY_LEVELS,
  USER_ROLES,
  ISBN_STATUS,
  ISBN_VERIFICATION_STATUS,
  ALLOWED_FILE_TYPES,
  FILE_SIZE_LIMITS,
  S3_PREFIXES,
  PAGINATION,
  ERROR_CODES,
};
