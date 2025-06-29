const Joi = require("joi");

const isbnCertificateValidators = {
  // Validation for uploading ISBN certificate
  uploadCertificate: {
    params: Joi.object({
      bookId: Joi.number().integer().positive().required().messages({
        "number.base": "Book ID must be a number",
        "number.integer": "Book ID must be an integer",
        "number.positive": "Book ID must be positive",
        "any.required": "Book ID is required",
      }),
    }),
    body: Joi.object({
      isbn13: Joi.string().min(13).max(17).required().messages({
        "string.base": "ISBN-13 must be a string",
        "string.min": "ISBN-13 must be at least 13 characters",
        "string.max": "ISBN-13 cannot exceed 17 characters",
        "any.required": "ISBN-13 is required",
      }),
      isbn10: Joi.string().min(10).max(13).optional().messages({
        "string.min": "ISBN-10 must be at least 10 characters",
        "string.max": "ISBN-10 cannot exceed 13 characters",
      }),
      title: Joi.string().min(1).max(500).required().messages({
        "string.min": "Title must be at least 1 character",
        "string.max": "Title cannot exceed 500 characters",
        "any.required": "Title is required",
      }),
      authorName: Joi.string().min(1).max(200).required().messages({
        "string.min": "Author name must be at least 1 character",
        "string.max": "Author name cannot exceed 200 characters",
        "any.required": "Author name is required",
      }),
      publisherName: Joi.string().max(200).optional(),
      publicationDate: Joi.date().iso().optional(),
      issuingAuthority: Joi.string().min(1).max(200).required().messages({
        "string.min": "Issuing authority must be at least 1 character",
        "string.max": "Issuing authority cannot exceed 200 characters",
        "any.required": "Issuing authority is required",
      }),
      countryCode: Joi.string().length(2).optional().messages({
        "string.length": "Country code must be exactly 2 characters",
      }),
      language: Joi.string().max(50).optional(),
      format: Joi.string()
        .valid("HARDCOVER", "PAPERBACK", "EBOOK", "AUDIOBOOK", "OTHER")
        .optional(),
      certificateType: Joi.string()
        .valid("ORIGINAL", "DUPLICATE", "AMENDED", "PROVISIONAL")
        .optional(),
      issueDate: Joi.date().iso().max("now").required().messages({
        "date.max": "Issue date cannot be in the future",
        "any.required": "Issue date is required",
      }),
      expiryDate: Joi.date()
        .iso()
        .min(Joi.ref("issueDate"))
        .optional()
        .messages({
          "date.min": "Expiry date must be after issue date",
        }),
      registrationNumber: Joi.string().max(100).optional(),
      documentPages: Joi.number().integer().min(1).optional(),
      notes: Joi.string().max(3000).optional(),
      tags: Joi.string().optional(), // Will be parsed as JSON
    }),
  },

  // Validation for getting certificate by ID
  getCertificateById: {
    params: Joi.object({
      certificateId: Joi.number().integer().positive().required(),
    }),
  },

  // Validation for getting certificates by book
  getCertificatesByBook: {
    params: Joi.object({
      bookId: Joi.number().integer().positive().required(),
    }),
    query: Joi.object({
      includeInactive: Joi.boolean().optional(),
      limit: Joi.number().integer().min(1).max(100).optional(),
      offset: Joi.number().integer().min(0).optional(),
    }),
  },

  // Validation for getting uploader certificates
  getUploaderCertificates: {
    query: Joi.object({
      status: Joi.string()
        .valid("PENDING", "VERIFIED", "APPROVED", "REJECTED", "EXPIRED")
        .optional(),
      limit: Joi.number().integer().min(1).max(100).optional(),
      offset: Joi.number().integer().min(0).optional(),
    }),
  },

  // Validation for getting pending certificates
  getPendingCertificates: {
    query: Joi.object({
      issuingAuthority: Joi.string().max(200).optional(),
      limit: Joi.number().integer().min(1).max(100).optional(),
      offset: Joi.number().integer().min(0).optional(),
    }),
  },

  // Validation for verifying certificate
  verifyCertificate: {
    params: Joi.object({
      certificateId: Joi.number().integer().positive().required(),
    }),
    body: Joi.object({
      verificationMethod: Joi.string()
        .valid("MANUAL", "API", "OCR", "AUTOMATED")
        .optional(),
    }),
  },

  // Validation for approving certificate
  approveCertificate: {
    params: Joi.object({
      certificateId: Joi.number().integer().positive().required(),
    }),
  },

  // Validation for rejecting certificate
  rejectCertificate: {
    params: Joi.object({
      certificateId: Joi.number().integer().positive().required(),
    }),
    body: Joi.object({
      rejectionReason: Joi.string().min(1).max(2000).required().messages({
        "string.min": "Rejection reason must be at least 1 character",
        "string.max": "Rejection reason cannot exceed 2000 characters",
        "any.required": "Rejection reason is required",
      }),
    }),
  },

  // Validation for searching certificates
  searchCertificates: {
    query: Joi.object({
      q: Joi.string().min(3).max(100).required().messages({
        "string.min": "Search query must be at least 3 characters",
        "string.max": "Search query cannot exceed 100 characters",
        "any.required": "Search query is required",
      }),
      status: Joi.string()
        .valid("PENDING", "VERIFIED", "APPROVED", "REJECTED", "EXPIRED")
        .optional(),
      issuingAuthority: Joi.string().max(200).optional(),
      limit: Joi.number().integer().min(1).max(100).optional(),
      offset: Joi.number().integer().min(0).optional(),
    }),
  },

  // Validation for updating certificate
  updateCertificate: {
    params: Joi.object({
      certificateId: Joi.number().integer().positive().required(),
    }),
    body: Joi.object({
      notes: Joi.string().max(3000).optional(),
      tags: Joi.array().items(Joi.string().max(50)).max(20).optional(),
      isActive: Joi.boolean().optional(),
      registrationNumber: Joi.string().max(100).optional(),
      metadata: Joi.object().optional(),
    })
      .min(1)
      .messages({
        "object.min": "At least one field must be provided for update",
      }),
  },

  // Validation for deleting certificate
  deleteCertificate: {
    params: Joi.object({
      certificateId: Joi.number().integer().positive().required(),
    }),
  },
};

module.exports = isbnCertificateValidators;
