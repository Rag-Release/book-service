const Joi = require("joi");

const coverDesignRequestValidators = {
  // Validation for creating cover design request
  createRequest: {
    params: Joi.object({
      bookId: Joi.number().integer().positive().required().messages({
        "number.base": "Book ID must be a number",
        "number.integer": "Book ID must be an integer",
        "number.positive": "Book ID must be positive",
        "any.required": "Book ID is required",
      }),
    }),
    body: Joi.object({
      title: Joi.string().min(3).max(200).required().messages({
        "string.base": "Title must be a string",
        "string.min": "Title must be at least 3 characters",
        "string.max": "Title cannot exceed 200 characters",
        "any.required": "Title is required",
      }),
      description: Joi.string().max(3000).optional().messages({
        "string.max": "Description cannot exceed 3000 characters",
      }),
      preferredDimensions: Joi.object({
        width: Joi.number().integer().min(100).max(10000),
        height: Joi.number().integer().min(100).max(10000),
        aspectRatio: Joi.string().optional(),
      }).optional(),
      minFileSize: Joi.number().integer().min(1024).optional().messages({
        "number.min": "Minimum file size must be at least 1KB",
      }),
      maxFileSize: Joi.number().integer().max(52428800).optional().messages({
        "number.max": "Maximum file size cannot exceed 50MB",
      }),
      preferredFormats: Joi.array()
        .items(
          Joi.string().valid(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/tiff"
          )
        )
        .optional(),
      conceptBrief: Joi.string().max(5000).optional(),
      stylePreferences: Joi.array().items(Joi.string()).optional(),
      colorSchemeRequirements: Joi.string().max(1000).optional(),
      targetAudience: Joi.string().max(300).optional(),
      moodBoard: Joi.array().items(Joi.string().uri()).optional(),
      tags: Joi.array().items(Joi.string().max(50)).max(20).optional(),
      inspirationReferences: Joi.array().items(Joi.string().uri()).optional(),
      budget: Joi.number().min(0).optional(),
      deadlineDate: Joi.date().iso().min("now").optional().messages({
        "date.min": "Deadline must be in the future",
      }),
      priority: Joi.string()
        .valid("LOW", "MEDIUM", "HIGH", "URGENT")
        .optional(),
      requirements: Joi.object().optional(),
      deliverables: Joi.array().items(Joi.string()).optional(),
      revisionLimit: Joi.number().integer().min(0).max(10).optional(),
      authorNotes: Joi.string().max(2000).optional(),
    }),
  },

  // Validation for getting request by ID
  getRequestById: {
    params: Joi.object({
      requestId: Joi.number().integer().positive().required(),
    }),
  },

  // Validation for getting author requests
  getAuthorRequests: {
    query: Joi.object({
      status: Joi.string()
        .valid(
          "OPEN",
          "ASSIGNED",
          "IN_PROGRESS",
          "SUBMITTED",
          "APPROVED",
          "COMPLETED",
          "CANCELLED"
        )
        .optional(),
      priority: Joi.string()
        .valid("LOW", "MEDIUM", "HIGH", "URGENT")
        .optional(),
      limit: Joi.number().integer().min(1).max(100).optional(),
      offset: Joi.number().integer().min(0).optional(),
    }),
  },

  // Validation for getting open requests
  getOpenRequests: {
    query: Joi.object({
      priority: Joi.string()
        .valid("LOW", "MEDIUM", "HIGH", "URGENT")
        .optional(),
      budget: Joi.number().min(0).optional(),
      limit: Joi.number().integer().min(1).max(100).optional(),
      offset: Joi.number().integer().min(0).optional(),
    }),
  },

  // Validation for assigning designer
  assignDesigner: {
    params: Joi.object({
      requestId: Joi.number().integer().positive().required(),
    }),
    body: Joi.object({
      designerId: Joi.number().integer().positive().required().messages({
        "number.base": "Designer ID must be a number",
        "number.integer": "Designer ID must be an integer",
        "number.positive": "Designer ID must be positive",
        "any.required": "Designer ID is required",
      }),
    }),
  },

  // Validation for updating request
  updateRequest: {
    params: Joi.object({
      requestId: Joi.number().integer().positive().required(),
    }),
    body: Joi.object({
      title: Joi.string().min(3).max(200).optional(),
      description: Joi.string().max(3000).optional(),
      priority: Joi.string()
        .valid("LOW", "MEDIUM", "HIGH", "URGENT")
        .optional(),
      status: Joi.string()
        .valid(
          "OPEN",
          "ASSIGNED",
          "IN_PROGRESS",
          "SUBMITTED",
          "APPROVED",
          "COMPLETED",
          "CANCELLED"
        )
        .optional(),
      deadlineDate: Joi.date().iso().min("now").optional(),
      budget: Joi.number().min(0).optional(),
      authorNotes: Joi.string().max(2000).optional(),
      designerNotes: Joi.string().max(2000).optional(),
    })
      .min(1)
      .messages({
        "object.min": "At least one field must be provided for update",
      }),
  },
};

module.exports = coverDesignRequestValidators;
