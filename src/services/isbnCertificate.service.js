"use strict";

const { ErrorHandler } = require("../shared/utils/ErrorHandler");
// const storageService = require("./storage.service");
const logger = require("../logger/logger");
const { Op } = require("sequelize");

/**
 * Service class for ISBN certificate operations
 */
class IsbnCertificateService {
  constructor() {
    // Initialize repositories when needed, not in constructor
    this.isbnCertificateRepository = null;
    this.bookRepository = null;
  }

  // Lazy load repositories
  getIsbnCertificateRepository() {
    if (!this.isbnCertificateRepository) {
      const { IsbnCertificateRepository } = require("../repositories");
      this.isbnCertificateRepository = new IsbnCertificateRepository();
    }
    return this.isbnCertificateRepository;
  }

  getBookRepository() {
    if (!this.bookRepository) {
      const { BookRepository } = require("../repositories");
      this.bookRepository = new BookRepository();
    }
    return this.bookRepository;
  }

  /**
   * Create a new ISBN certificate request
   * @param {Object} certificateData - Certificate data
   * @returns {Promise<Object>} Created certificate data
   */
  async createCertificate(certificateData) {
    try {
      // Validate ISBN number format and uniqueness
      await this.validateIsbnNumber(
        certificateData.isbn13,
        certificateData.isbn10
      );

      // Create certificate record
      const certificate =
        await this.getIsbnCertificateRepository().create(certificateData);

      logger.info("ISBN certificate created", {
        certificateId: certificate.id,
        isbn: certificate.isbn13,
      });

      return certificate;
    } catch (error) {
      logger.error("Error creating ISBN certificate", {
        error: error.message,
        data: certificateData,
      });
      throw error;
    }
  }

  /**
   * Get certificate details by ID
   * @param {number} certificateId - Certificate ID
   * @returns {Promise<Object>} Certificate details
   */
  async getCertificateById(certificateId) {
    try {
      const certificate =
        await this.getIsbnCertificateRepository().findById(certificateId);
      if (!certificate) {
        throw new ErrorHandler("ISBN certificate not found", 404);
      }

      return certificate;
    } catch (error) {
      logger.error("Error getting ISBN certificate by ID", {
        error: error.message,
        certificateId,
      });
      throw error;
    }
  }

  /**
   * Update certificate details
   * @param {number} certificateId - Certificate ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated certificate data
   */
  async updateCertificate(certificateId, updateData) {
    try {
      // Check if certificate exists
      const certificate =
        await this.getIsbnCertificateRepository().findById(certificateId);
      if (!certificate) {
        throw new ErrorHandler("ISBN certificate not found", 404);
      }

      // Update certificate record
      await this.getIsbnCertificateRepository().update(
        certificateId,
        updateData
      );

      logger.info("ISBN certificate updated", {
        certificateId,
        updates: updateData,
      });

      return this.getCertificateById(certificateId);
    } catch (error) {
      logger.error("Error updating ISBN certificate", {
        error: error.message,
        certificateId,
        updates: updateData,
      });
      throw error;
    }
  }

  /**
   * Delete a certificate request
   * @param {number} certificateId - Certificate ID
   * @returns {Promise<void>}
   */
  async deleteCertificate(certificateId) {
    try {
      // Check if certificate exists
      const certificate =
        await this.getIsbnCertificateRepository().findById(certificateId);
      if (!certificate) {
        throw new ErrorHandler("ISBN certificate not found", 404);
      }

      // Delete certificate record
      await this.getIsbnCertificateRepository().delete(certificateId);

      logger.info("ISBN certificate deleted", {
        certificateId,
      });
    } catch (error) {
      logger.error("Error deleting ISBN certificate", {
        error: error.message,
        certificateId,
      });
      throw error;
    }
  }

  /**
   * Search for certificates with pagination and filtering
   * @param {Object} filter - Filter criteria
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>} Paginated list of certificates
   */
  async searchCertificates(filter = {}, pagination = { page: 1, limit: 20 }) {
    try {
      const where = {};

      // Filter by ISBN number
      if (filter.isbn) {
        where.isbn13 = {
          [Op.like]: `%${filter.isbn}%`,
        };
      }

      // Filter by status
      if (filter.status) {
        where.verificationStatus = filter.status;
      }

      // Filter by date range
      if (filter.startDate && filter.endDate) {
        where.uploadedAt = {
          [Op.between]: [new Date(filter.startDate), new Date(filter.endDate)],
        };
      }

      const result = await this.getIsbnCertificateRepository().search(
        where,
        pagination
      );

      return result;
    } catch (error) {
      logger.error("Error searching ISBN certificates", {
        error: error.message,
        filter,
        pagination,
      });
      throw error;
    }
  }

  /**
   * Verify an ISBN certificate (Admin only)
   * @param {number} certificateId - Certificate ID
   * @param {number} adminUserId - Admin user ID
   * @param {string} reason - Verification reason
   * @param {string} ipAddress - Admin IP address
   * @param {string} userAgent - Admin user agent
   * @returns {Promise<Object>} Verified certificate data
   */
  async verifyCertificate(
    certificateId,
    adminUserId,
    reason,
    ipAddress,
    userAgent
  ) {
    try {
      // Check if certificate exists
      const certificate =
        await this.getIsbnCertificateRepository().findById(certificateId);
      if (!certificate) {
        throw new ErrorHandler("ISBN certificate not found", 404);
      }

      // Update certificate status to VERIFIED
      await this.getIsbnCertificateRepository().update(certificateId, {
        verificationStatus: "VERIFIED",
        verifiedBy: adminUserId,
        verificationReason: reason,
        verificationDate: new Date(),
        ipAddress,
        userAgent,
      });

      logger.info("ISBN certificate verified", {
        certificateId,
        adminUserId,
      });

      return this.getCertificateById(certificateId);
    } catch (error) {
      logger.error("Error verifying ISBN certificate", {
        error: error.message,
        certificateId,
        adminUserId,
      });
      throw error;
    }
  }

  /**
   * Get audit logs for a certificate
   * @param {number} certificateId - Certificate ID
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>} Paginated audit logs
   */
  async getCertificateAuditLogs(
    certificateId,
    pagination = { page: 1, limit: 20 }
  ) {
    try {
      // Verify certificate exists
      const certificate =
        await this.getIsbnCertificateRepository().findById(certificateId);
      if (!certificate) {
        throw new ErrorHandler("ISBN certificate not found", 404);
      }

      return await this.getIsbnCertificateRepository().getAuditLogs(
        certificateId,
        pagination
      );
    } catch (error) {
      logger.error("Error getting ISBN certificate audit logs", {
        error: error.message,
        certificateId,
      });
      throw error;
    }
  }

  /**
   * Generate presigned URL for certificate file download
   * @param {number} certificateId - Certificate ID
   * @param {number} userId - User requesting download
   * @param {string} userRole - User role for permission check
   * @returns {Promise<Object>} Presigned URL and metadata
   */
  async generateDownloadUrl(certificateId, userId, userRole) {
    try {
      const certificate =
        await this.getIsbnCertificateRepository().findById(certificateId);
      if (!certificate) {
        throw new ErrorHandler("ISBN certificate not found", 404);
      }

      // Check permissions - only uploader, admin, or verified users can download
      if (
        certificate.uploadedBy !== userId &&
        !["ADMIN", "PUBLISHER"].includes(userRole) &&
        certificate.verificationStatus !== "VERIFIED"
      ) {
        throw new ErrorHandler(
          "You do not have permission to download this certificate",
          403
        );
      }

      //   const downloadUrl = await storageService.generatePresignedUrl(
      //     certificate.certificateFileUrl,
      //     3600 // 1 hour expiry
      //   );

      logger.info("Generated download URL for ISBN certificate", {
        certificateId,
        userId,
      });

      return {
        downloadUrl,
        fileName: certificate.certificateFileName,
        fileSize: certificate.certificateFileSize,
        fileType: certificate.certificateFileType,
        expiresIn: 3600,
      };
    } catch (error) {
      logger.error("Error generating download URL for ISBN certificate", {
        error: error.message,
        certificateId,
        userId,
      });
      throw error;
    }
  }

  /**
   * Validate ISBN number format and uniqueness
   * @param {string} isbn13 - ISBN-13 number
   * @param {string} isbn10 - ISBN-10 number (optional)
   * @returns {Promise<void>}
   */
  async validateIsbnNumber(isbn13, isbn10 = null) {
    // Validate ISBN-13 format
    const isbn13Regex = /^978-\d{1}-\d{5}-\d{3}-\d{1}$/;
    if (!isbn13Regex.test(isbn13)) {
      throw new ErrorHandler(
        "Invalid ISBN-13 format. Expected format: 978-X-XXXXX-XXX-X",
        400
      );
    }

    // Validate ISBN-10 format if provided
    if (isbn10) {
      const isbn10Regex = /^\d{1}-\d{5}-\d{3}-[\dX]$/;
      if (!isbn10Regex.test(isbn10)) {
        throw new ErrorHandler(
          "Invalid ISBN-10 format. Expected format: X-XXXXX-XXX-X",
          400
        );
      }
    }

    // Check if ISBN-13 already exists
    const existingCertificate =
      await this.getIsbnCertificateRepository().findByIsbn(isbn13);
    if (existingCertificate) {
      throw new ErrorHandler(
        "ISBN-13 number already exists in the system",
        400
      );
    }

    // Validate ISBN-13 check digit
    const digits = isbn13.replace(/-/g, "");
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(digits[i]) * (i % 2 === 0 ? 1 : 3);
    }
    const checkDigit = (10 - (sum % 10)) % 10;

    if (checkDigit !== parseInt(digits[12])) {
      throw new ErrorHandler("Invalid ISBN-13 check digit", 400);
    }
  }

  /**
   * Upload certificate file to S3
   * @param {Object} fileData - Uploaded file data
   * @param {number} bookId - Book ID
   * @param {string} isbn13 - ISBN number for file naming
   * @returns {Promise<Object>} Upload result with file URL
   */
  async uploadCertificateFile(fileData, bookId, isbn13) {
    try {
      // Validate file type
      const allowedMimeTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/tiff",
      ];
      if (!allowedMimeTypes.includes(fileData.mimetype)) {
        throw new ErrorHandler(
          "Invalid file type. Only PDF and image files are allowed",
          400
        );
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (fileData.size > maxSize) {
        throw new ErrorHandler(
          "File size too large. Maximum size is 10MB",
          400
        );
      }

      // Generate unique file name
      const fileExtension = fileData.originalname.split(".").pop();
      const fileName = `isbn-certificates/book-${bookId}/${isbn13}-${Date.now()}.${fileExtension}`;

      // Upload to S3
      //   const uploadResult = await storageService.uploadFile(
      //     fileData.buffer,
      //     fileName,
      //     fileData.mimetype,
      //     {
      //       bookId: bookId.toString(),
      //       isbn: isbn13,
      //       uploadedAt: new Date().toISOString(),
      //     }
      //   );

      return uploadResult;
    } catch (error) {
      logger.error("Error uploading ISBN certificate file", {
        error: error.message,
        bookId,
        isbn13,
      });
      throw error;
    }
  }

  /**
   * Get certificate statistics for admin dashboard
   * @returns {Promise<Object>} Certificate statistics
   */
  async getCertificateStatistics() {
    try {
      const stats = await this.getIsbnCertificateRepository().search(
        {},
        { page: 1, limit: 1 }
      );

      // Get counts by status
      const pendingCount = await this.getIsbnCertificateRepository().search(
        { verificationStatus: "PENDING" },
        { page: 1, limit: 1 }
      );

      const verifiedCount = await this.getIsbnCertificateRepository().search(
        { verificationStatus: "VERIFIED" },
        { page: 1, limit: 1 }
      );

      const rejectedCount = await this.getIsbnCertificateRepository().search(
        { verificationStatus: "REJECTED" },
        { page: 1, limit: 1 }
      );

      return {
        total: stats.pagination.total,
        pending: pendingCount.pagination.total,
        verified: verifiedCount.pagination.total,
        rejected: rejectedCount.pagination.total,
        activePercentage: (
          (verifiedCount.pagination.total / stats.pagination.total) *
          100
        ).toFixed(2),
      };
    } catch (error) {
      logger.error("Error getting ISBN certificate statistics", {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Bulk verify certificates (Admin only)
   * @param {Array} certificateIds - Array of certificate IDs
   * @param {number} adminUserId - Admin user ID
   * @param {string} reason - Bulk verification reason
   * @param {string} ipAddress - IP address
   * @param {string} userAgent - User agent
   * @returns {Promise<Object>} Bulk verification results
   */
  async bulkVerifyCertificates(
    certificateIds,
    adminUserId,
    reason,
    ipAddress,
    userAgent
  ) {
    const results = {
      verified: [],
      failed: [],
      total: certificateIds.length,
    };

    for (const certificateId of certificateIds) {
      try {
        const verifiedCertificate = await this.verifyCertificate(
          certificateId,
          adminUserId,
          reason,
          ipAddress,
          userAgent
        );

        results.verified.push({
          certificateId,
          isbn: verifiedCertificate.isbn13,
          bookTitle: verifiedCertificate.book?.title,
        });
      } catch (error) {
        results.failed.push({
          certificateId,
          error: error.message,
        });
      }
    }

    logger.info("Bulk verification completed", {
      adminUserId,
      totalRequested: results.total,
      verified: results.verified.length,
      failed: results.failed.length,
    });

    return results;
  }
}

module.exports = IsbnCertificateService;
