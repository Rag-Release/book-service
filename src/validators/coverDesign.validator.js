const Joi = require("joi");

const coverDesignValidators = {
  // Validation for uploading cover design
  uploadCoverDesign: {
    params: Joi.object({
      bookId: Joi.number().integer().positive().required().messages({
        "number.base": "Book ID must be a number",
        "number.integer": "Book ID must be an integer",
        "number.positive": "Book ID must be positive",
        "any.required": "Book ID is required",
      }),
    }),
    body: Joi.object({
      designerId: Joi.number().integer().positive().optional().messages({
        "number.base": "Designer ID must be a number",
        "number.integer": "Designer ID must be an integer",
        "number.positive": "Designer ID must be positive",
      }),
      designerName: Joi.string().min(2).max(100).required().messages({
        "string.base": "Designer name must be a string",
        "string.min": "Designer name must be at least 2 characters",
        "string.max": "Designer name cannot exceed 100 characters",
        "any.required": "Designer name is required",
      }),
      designerEmail: Joi.string().email().optional().messages({
        "string.email": "Designer email must be a valid email address",
      }),
      designerPortfolio: Joi.string().uri().optional().messages({
        "string.uri": "Designer portfolio must be a valid URL",
      }),
      title: Joi.string().min(3).max(200).required().messages({
        "string.base": "Title must be a string",
        "string.min": "Title must be at least 3 characters",
        "string.max": "Title cannot exceed 200 characters",
        "any.required": "Title is required",
      }),
      description: Joi.string().max(2000).optional().messages({
        "string.max": "Description cannot exceed 2000 characters",
      }),
      designConcept: Joi.string().max(1000).optional().messages({
        "string.max": "Design concept cannot exceed 1000 characters",
      }),
      colorScheme: Joi.string().max(100).optional().messages({
        "string.max": "Color scheme cannot exceed 100 characters",
      }),
      style: Joi.string().max(100).optional().messages({
        "string.max": "Style cannot exceed 100 characters",
      }),
      targetAudience: Joi.string().max(200).optional().messages({
        "string.max": "Target audience cannot exceed 200 characters",
      }),
      designNotes: Joi.string().max(1500).optional().messages({
        "string.max": "Design notes cannot exceed 1500 characters",
      }),
    }),
  },

  // Validation for getting cover designs by book
  getCoverDesignsByBook: {
    params: Joi.object({
      bookId: Joi.number().integer().positive().required(),
    }),
    query: Joi.object({
      includeInactive: Joi.boolean().optional(),
      limit: Joi.number().integer().min(1).max(100).optional(),
      offset: Joi.number().integer().min(0).optional(),
    }),
  },

  // Validation for getting active cover design
  getActiveCoverDesign: {
    params: Joi.object({
      bookId: Joi.number().integer().positive().required(),
    }),
  },

  // Validation for getting cover design by ID
  getCoverDesignById: {
    params: Joi.object({
      coverDesignId: Joi.number().integer().positive().required().messages({
        "number.base": "Cover design ID must be a number",
        "number.integer": "Cover design ID must be an integer",
        "number.positive": "Cover design ID must be positive",
        "any.required": "Cover design ID is required",
      }),
    }),
  },

  // Validation for getting designer's cover designs
  getDesignerCoverDesigns: {
    query: Joi.object({
      status: Joi.string()
        .valid("DRAFT", "SUBMITTED", "APPROVED", "REJECTED", "ACTIVE")
        .optional(),
      limit: Joi.number().integer().min(1).max(100).optional(),
      offset: Joi.number().integer().min(0).optional(),
    }),
  },

  // Validation for approving cover design
  approveCoverDesign: {
    params: Joi.object({
      coverDesignId: Joi.number().integer().positive().required(),
    }),
  },

  // Validation for rejecting cover design
  rejectCoverDesign: {
    params: Joi.object({
      coverDesignId: Joi.number().integer().positive().required(),
    }),
    body: Joi.object({
      rejectionReason: Joi.string().min(10).max(1000).required().messages({
        "string.base": "Rejection reason must be a string",
        "string.min": "Rejection reason must be at least 10 characters",
        "string.max": "Rejection reason cannot exceed 1000 characters",
        "any.required": "Rejection reason is required",
      }),
    }),
  },

  // Validation for setting active cover design
  setActiveCoverDesign: {
    params: Joi.object({
      bookId: Joi.number().integer().positive().required(),
      coverDesignId: Joi.number().integer().positive().required(),
    }),
  },

  // Validation for updating cover design
  updateCoverDesign: {
    params: Joi.object({
      coverDesignId: Joi.number().integer().positive().required(),
    }),
    body: Joi.object({
      title: Joi.string().min(3).max(200).optional(),
      description: Joi.string().max(2000).optional(),
      designConcept: Joi.string().max(1000).optional(),
      colorScheme: Joi.string().max(100).optional(),
      style: Joi.string().max(100).optional(),
      targetAudience: Joi.string().max(200).optional(),
      designNotes: Joi.string().max(1500).optional(),
      designerName: Joi.string().min(2).max(100).optional(),
      designerEmail: Joi.string().email().optional(),
      designerPortfolio: Joi.string().uri().optional(),
    })
      .min(1)
      .messages({
        "object.min": "At least one field must be provided for update",
      }),
  },

  // Validation for getting version history
  getCoverDesignVersionHistory: {
    params: Joi.object({
      bookId: Joi.number().integer().positive().required(),
    }),
  },

  // Validation for deleting cover design
  deleteCoverDesign: {
    params: Joi.object({
      coverDesignId: Joi.number().integer().positive().required(),
    }),
  },

  // Validation for getting uploader's cover designs
  getUploaderCoverDesigns: {
    query: Joi.object({
      status: Joi.string()
        .valid("DRAFT", "SUBMITTED", "APPROVED", "REJECTED", "ACTIVE")
        .optional(),
      limit: Joi.number().integer().min(1).max(100).optional(),
      offset: Joi.number().integer().min(0).optional(),
    }),
  },
};

module.exports = coverDesignValidators;
