const IsbnCertificateService = require("../../services/isbnCertificate.service");
const logger = require("../../logger/logger");

/**
 * Use case for uploading ISBN certificate
 * Handles business logic for certificate upload workflow
 */
class UploadCertificateUseCase {
  constructor() {
    this.isbnCertificateService = new IsbnCertificateService();
  }

  /**
   * Execute the upload certificate use case
   * @param {Object} uploadData - Certificate upload data
   * @param {Object} fileData - Uploaded file information
   * @param {Object} userContext - User context (id, role, etc.)
   * @param {Object} requestContext - Request context (ip, userAgent)
   * @returns {Promise<Object>} Upload result
   */
  async execute(uploadData, fileData, userContext, requestContext) {
    try {
      logger.info("Starting upload certificate use case", {
        bookId: uploadData.bookId,
        userId: userContext.id,
        isbn13: uploadData.isbn13,
      });

      // Validate user permissions
      if (!["AUTHOR", "ADMIN", "PUBLISHER"].includes(userContext.role)) {
        throw new Error("User does not have permission to upload certificates");
      }

      // Execute the upload through service layer
      const result = await this.isbnCertificateService.uploadCertificate(
        uploadData,
        fileData,
        userContext.id,
        requestContext.ipAddress,
        requestContext.userAgent
      );

      logger.info("Upload certificate use case completed successfully", {
        certificateId: result.id,
        bookId: uploadData.bookId,
        userId: userContext.id,
      });

      return {
        success: true,
        data: result,
        message: "ISBN certificate uploaded successfully",
      };
    } catch (error) {
      logger.error("Upload certificate use case failed", {
        error: error.message,
        bookId: uploadData.bookId,
        userId: userContext.id,
      });

      throw error;
    }
  }
}

module.exports = UploadCertificateUseCase;
