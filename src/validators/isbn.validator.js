const Joi = require("joi");

/**
 * Validation schemas for ISBN certificate operations
 */

// ISBN-13 format validation regex
const isbn13Regex = /^978-\d{1}-\d{3}-\d{5}-\d{1}$/;

// ISBN-10 format validation regex
const isbn10Regex = /^\d{1}-\d{5}-\d{3}-[\dX]$/;

// Country code validation (ISO 3166-1 alpha-3)
const countryCodeRegex = /^[A-Z]{3}$/;

/**
 * Validation for uploading ISBN certificate
 */
const uploadCertificate = {
  body: Joi.object({
    bookId: Joi.number().integer().positive().required().messages({
      "number.base": "Book ID must be a number",
      "number.integer": "Book ID must be an integer",
      "number.positive": "Book ID must be positive",
      "any.required": "Book ID is required",
    }),

    isbn13: Joi.string().pattern(isbn13Regex).required().messages({
      "string.pattern.base": "ISBN-13 must be in format: 978-X-XXXXX-XXX-X",
      "any.required": "ISBN-13 is required",
    }),

    isbn10: Joi.string().pattern(isbn10Regex).optional().messages({
      "string.pattern.base": "ISBN-10 must be in format: X-XXXXX-XXX-X",
    }),

    issuingAuthority: Joi.string().min(2).max(255).required().messages({
      "string.min": "Issuing authority must be at least 2 characters",
      "string.max": "Issuing authority cannot exceed 255 characters",
      "any.required": "Issuing authority is required",
    }),

    issuingCountry: Joi.string().pattern(countryCodeRegex).required().messages({
      "string.pattern.base":
        "Issuing country must be a valid 3-letter country code (e.g., USA, GBR)",
      "any.required": "Issuing country is required",
    }),

    issueDate: Joi.date().iso().max("now").required().messages({
      "date.base": "Issue date must be a valid date",
      "date.iso": "Issue date must be in ISO format (YYYY-MM-DD)",
      "date.max": "Issue date cannot be in the future",
      "any.required": "Issue date is required",
    }),

    expiryDate: Joi.date().iso().min(Joi.ref("issueDate")).optional().messages({
      "date.base": "Expiry date must be a valid date",
      "date.iso": "Expiry date must be in ISO format (YYYY-MM-DD)",
      "date.min": "Expiry date must be after issue date",
    }),

    registrationNumber: Joi.string().max(100).optional().messages({
      "string.max": "Registration number cannot exceed 100 characters",
    }),

    notes: Joi.string().max(1000).optional().messages({
      "string.max": "Notes cannot exceed 1000 characters",
    }),

    metadata: Joi.string()
      .optional()
      .custom((value, helpers) => {
        try {
          const parsed = JSON.parse(value);
          if (typeof parsed !== "object" || Array.isArray(parsed)) {
            return helpers.error("any.invalid");
          }
          return value;
        } catch (error) {
          return helpers.error("any.invalid");
        }
      })
      .messages({
        "any.invalid": "Metadata must be a valid JSON object",
      }),
  }),
};

/**
 * Validation for getting certificate by ID
 */
const getCertificateById = {
  params: Joi.object({
    id: Joi.number().integer().positive().required().messages({
      "number.base": "Certificate ID must be a number",
      "number.integer": "Certificate ID must be an integer",
      "number.positive": "Certificate ID must be positive",
      "any.required": "Certificate ID is required",
    }),
  }),

  query: Joi.object({
    includeAuditLogs: Joi.boolean().optional().messages({
      "boolean.base": "includeAuditLogs must be a boolean",
    }),
  }),
};

/**
 * Validation for getting certificate by book ID
 */
const getCertificateByBookId = {
  params: Joi.object({
    bookId: Joi.number().integer().positive().required().messages({
      "number.base": "Book ID must be a number",
      "number.integer": "Book ID must be an integer",
      "number.positive": "Book ID must be positive",
      "any.required": "Book ID is required",
    }),
  }),
};

/**
 * Validation for certificate verification
 */
const verifyCertificate = {
  params: Joi.object({
    id: Joi.number().integer().positive().required().messages({
      "number.base": "Certificate ID must be a number",
      "number.integer": "Certificate ID must be an integer",
      "number.positive": "Certificate ID must be positive",
      "any.required": "Certificate ID is required",
    }),
  }),

  body: Joi.object({
    reason: Joi.string().max(500).optional().messages({
      "string.max": "Reason cannot exceed 500 characters",
    }),
  }),
};

/**
 * Validation for certificate rejection
 */
const rejectCertificate = {
  params: Joi.object({
    id: Joi.number().integer().positive().required().messages({
      "number.base": "Certificate ID must be a number",
      "number.integer": "Certificate ID must be an integer",
      "number.positive": "Certificate ID must be positive",
      "any.required": "Certificate ID is required",
    }),
  }),

  body: Joi.object({
    reason: Joi.string().min(10).max(1000).required().messages({
      "string.min": "Rejection reason must be at least 10 characters",
      "string.max": "Rejection reason cannot exceed 1000 characters",
      "any.required": "Rejection reason is required",
    }),
  }),
};

/**
 * Validation for certificate resubmission
 */
const resubmitCertificate = {
  params: Joi.object({
    id: Joi.number().integer().positive().required().messages({
      "number.base": "Certificate ID must be a number",
      "number.integer": "Certificate ID must be an integer",
      "number.positive": "Certificate ID must be positive",
      "any.required": "Certificate ID is required",
    }),
  }),

  body: Joi.object({
    issuingAuthority: Joi.string().min(2).max(255).optional().messages({
      "string.min": "Issuing authority must be at least 2 characters",
      "string.max": "Issuing authority cannot exceed 255 characters",
    }),

    issuingCountry: Joi.string().pattern(countryCodeRegex).optional().messages({
      "string.pattern.base":
        "Issuing country must be a valid 3-letter country code",
    }),

    issueDate: Joi.date().iso().max("now").optional().messages({
      "date.base": "Issue date must be a valid date",
      "date.iso": "Issue date must be in ISO format (YYYY-MM-DD)",
      "date.max": "Issue date cannot be in the future",
    }),

    expiryDate: Joi.date().iso().optional().messages({
      "date.base": "Expiry date must be a valid date",
      "date.iso": "Expiry date must be in ISO format (YYYY-MM-DD)",
    }),

    registrationNumber: Joi.string().max(100).optional().messages({
      "string.max": "Registration number cannot exceed 100 characters",
    }),

    notes: Joi.string().max(1000).optional().messages({
      "string.max": "Notes cannot exceed 1000 characters",
    }),

    metadata: Joi.string()
      .optional()
      .custom((value, helpers) => {
        try {
          const parsed = JSON.parse(value);
          if (typeof parsed !== "object" || Array.isArray(parsed)) {
            return helpers.error("any.invalid");
          }
          return value;
        } catch (error) {
          return helpers.error("any.invalid");
        }
      })
      .messages({
        "any.invalid": "Metadata must be a valid JSON object",
      }),
  }),
};

/**
 * Validation for certificate download
 */
const downloadCertificate = {
  params: Joi.object({
    id: Joi.number().integer().positive().required().messages({
      "number.base": "Certificate ID must be a number",
      "number.integer": "Certificate ID must be an integer",
      "number.positive": "Certificate ID must be positive",
      "any.required": "Certificate ID is required",
    }),
  }),
};

/**
 * Validation for certificate search
 */
const searchCertificates = {
  query: Joi.object({
    verificationStatus: Joi.string()
      .valid("PENDING", "VERIFIED", "REJECTED", "EXPIRED")
      .optional()
      .messages({
        "any.only":
          "Verification status must be one of: PENDING, VERIFIED, REJECTED, EXPIRED",
      }),

    issuingAuthority: Joi.string().max(255).optional().messages({
      "string.max": "Issuing authority cannot exceed 255 characters",
    }),

    issuingCountry: Joi.string().pattern(countryCodeRegex).optional().messages({
      "string.pattern.base":
        "Issuing country must be a valid 3-letter country code",
    }),

    fromDate: Joi.date().iso().optional().messages({
      "date.base": "From date must be a valid date",
      "date.iso": "From date must be in ISO format (YYYY-MM-DD)",
    }),

    toDate: Joi.date().iso().min(Joi.ref("fromDate")).optional().messages({
      "date.base": "To date must be a valid date",
      "date.iso": "To date must be in ISO format (YYYY-MM-DD)",
      "date.min": "To date must be after from date",
    }),

    bookTitle: Joi.string().max(255).optional().messages({
      "string.max": "Book title cannot exceed 255 characters",
    }),

    isActive: Joi.boolean().optional().messages({
      "boolean.base": "isActive must be a boolean",
    }),

    page: Joi.number().integer().min(1).default(1).optional().messages({
      "number.base": "Page must be a number",
      "number.integer": "Page must be an integer",
      "number.min": "Page must be at least 1",
    }),

    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(10)
      .optional()
      .messages({
        "number.base": "Limit must be a number",
        "number.integer": "Limit must be an integer",
        "number.min": "Limit must be at least 1",
        "number.max": "Limit cannot exceed 100",
      }),
  }),
};

/**
 * Validation for getting audit logs
 */
const getCertificateAuditLogs = {
  params: Joi.object({
    id: Joi.number().integer().positive().required().messages({
      "number.base": "Certificate ID must be a number",
      "number.integer": "Certificate ID must be an integer",
      "number.positive": "Certificate ID must be positive",
      "any.required": "Certificate ID is required",
    }),
  }),

  query: Joi.object({
    page: Joi.number().integer().min(1).default(1).optional().messages({
      "number.base": "Page must be a number",
      "number.integer": "Page must be an integer",
      "number.min": "Page must be at least 1",
    }),

    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(20)
      .optional()
      .messages({
        "number.base": "Limit must be a number",
        "number.integer": "Limit must be an integer",
        "number.min": "Limit must be at least 1",
        "number.max": "Limit cannot exceed 100",
      }),
  }),
};

/**
 * Validation for bulk verification
 */
const bulkVerifyCertificates = {
  body: Joi.object({
    certificateIds: Joi.array()
      .items(
        Joi.number().integer().positive().messages({
          "number.base": "Each certificate ID must be a number",
          "number.integer": "Each certificate ID must be an integer",
          "number.positive": "Each certificate ID must be positive",
        })
      )
      .min(1)
      .max(50)
      .unique()
      .required()
      .messages({
        "array.min": "At least one certificate ID is required",
        "array.max": "Cannot verify more than 50 certificates at once",
        "array.unique": "Certificate IDs must be unique",
        "any.required": "Certificate IDs array is required",
      }),

    reason: Joi.string().max(500).optional().messages({
      "string.max": "Reason cannot exceed 500 characters",
    }),
  }),
};

module.exports = {
  uploadCertificate,
  getCertificateById,
  getCertificateByBookId,
  verifyCertificate,
  rejectCertificate,
  resubmitCertificate,
  downloadCertificate,
  searchCertificates,
  getCertificateAuditLogs,
  bulkVerifyCertificates,
};
