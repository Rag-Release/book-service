const {
  IsbnCertificate,
  IsbnAuditLog,
  Book,
  User,
} = require("../data-access/sequelize/models");
const { Op } = require("sequelize");
const logger = require("../logger/logger");

/**
 * Repository class for ISBN Certificate data operations
 * Handles all database interactions for ISBN certificates and audit logs
 */
class IsbnCertificateRepository {
  /**
   * Create a new ISBN certificate record
   * @param {Object} certificateData - Certificate data to create
   * @param {Object} transaction - Database transaction (optional)
   * @returns {Promise<Object>} Created certificate record
   */
  async create(certificateData, transaction = null) {
    try {
      logger.info("Creating new ISBN certificate", {
        bookId: certificateData.bookId,
        isbn13: certificateData.isbn13,
      });

      const certificate = await IsbnCertificate.create(certificateData, {
        transaction,
        include: [
          { model: Book, as: "book" },
          { model: User, as: "uploader" },
        ],
      });

      logger.info("ISBN certificate created successfully", {
        certificateId: certificate.id,
        isbn13: certificate.isbn13,
      });

      return certificate;
    } catch (error) {
      logger.error("Error creating ISBN certificate", {
        error: error.message,
        bookId: certificateData.bookId,
      });
      throw error;
    }
  }

  /**
   * Find ISBN certificate by ID with related data
   * @param {number} id - Certificate ID
   * @param {boolean} includeAuditLogs - Whether to include audit logs
   * @returns {Promise<Object|null>} Certificate record or null
   */
  async findById(id, includeAuditLogs = false) {
    try {
      const includeOptions = [
        { model: Book, as: "book" },
        {
          model: User,
          as: "uploader",
          attributes: ["id", "email", "firstName", "lastName"],
        },
        {
          model: User,
          as: "verifier",
          attributes: ["id", "email", "firstName", "lastName"],
        },
      ];

      if (includeAuditLogs) {
        includeOptions.push({
          model: IsbnAuditLog,
          as: "auditLogs",
          include: [
            {
              model: User,
              as: "performer",
              attributes: ["id", "email", "firstName", "lastName"],
            },
          ],
          order: [["createdAt", "DESC"]],
        });
      }

      const certificate = await IsbnCertificate.findByPk(id, {
        include: includeOptions,
      });

      return certificate;
    } catch (error) {
      logger.error("Error finding ISBN certificate by ID", {
        error: error.message,
        certificateId: id,
      });
      throw error;
    }
  }

  /**
   * Find ISBN certificate by book ID
   * @param {number} bookId - Book ID
   * @returns {Promise<Object|null>} Certificate record or null
   */
  async findByBookId(bookId) {
    try {
      const certificate = await IsbnCertificate.findOne({
        where: {
          bookId,
          isActive: true,
        },
        include: [
          { model: Book, as: "book" },
          {
            model: User,
            as: "uploader",
            attributes: ["id", "email", "firstName", "lastName"],
          },
          {
            model: User,
            as: "verifier",
            attributes: ["id", "email", "firstName", "lastName"],
          },
        ],
      });

      return certificate;
    } catch (error) {
      logger.error("Error finding ISBN certificate by book ID", {
        error: error.message,
        bookId,
      });
      throw error;
    }
  }

  /**
   * Find ISBN certificate by ISBN number
   * @param {string} isbn13 - ISBN-13 number
   * @returns {Promise<Object|null>} Certificate record or null
   */
  async findByIsbn(isbn13) {
    try {
      const certificate = await IsbnCertificate.findOne({
        where: { isbn13 },
        include: [
          { model: Book, as: "book" },
          {
            model: User,
            as: "uploader",
            attributes: ["id", "email", "firstName", "lastName"],
          },
        ],
      });

      return certificate;
    } catch (error) {
      logger.error("Error finding ISBN certificate by ISBN", {
        error: error.message,
        isbn13,
      });
      throw error;
    }
  }

  /**
   * Get all certificates for a specific user (uploaded by them)
   * @param {number} userId - User ID
   * @param {Object} filters - Additional filters
   * @returns {Promise<Array>} Array of certificate records
   */
  async findByUserId(userId, filters = {}) {
    try {
      const whereCondition = {
        uploadedBy: userId,
        ...filters,
      };

      const certificates = await IsbnCertificate.findAll({
        where: whereCondition,
        include: [
          { model: Book, as: "book" },
          {
            model: User,
            as: "verifier",
            attributes: ["id", "email", "firstName", "lastName"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      return certificates;
    } catch (error) {
      logger.error("Error finding ISBN certificates by user ID", {
        error: error.message,
        userId,
      });
      throw error;
    }
  }

  /**
   * Get certificates pending verification
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>} Paginated certificates
   */
  async findPendingVerification(pagination = { page: 1, limit: 10 }) {
    try {
      const offset = (pagination.page - 1) * pagination.limit;

      const { count, rows } = await IsbnCertificate.findAndCountAll({
        where: {
          verificationStatus: "PENDING",
          isActive: true,
        },
        include: [
          { model: Book, as: "book" },
          {
            model: User,
            as: "uploader",
            attributes: ["id", "email", "firstName", "lastName"],
          },
        ],
        order: [["createdAt", "ASC"]],
        limit: pagination.limit,
        offset,
      });

      return {
        certificates: rows,
        pagination: {
          total: count,
          page: pagination.page,
          limit: pagination.limit,
          totalPages: Math.ceil(count / pagination.limit),
        },
      };
    } catch (error) {
      logger.error("Error finding pending ISBN certificates", {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Update ISBN certificate
   * @param {number} id - Certificate ID
   * @param {Object} updateData - Data to update
   * @param {Object} transaction - Database transaction (optional)
   * @returns {Promise<Object>} Updated certificate record
   */
  async update(id, updateData, transaction = null) {
    try {
      logger.info("Updating ISBN certificate", {
        certificateId: id,
        updateFields: Object.keys(updateData),
      });

      const [updatedRowsCount] = await IsbnCertificate.update(updateData, {
        where: { id },
        transaction,
      });

      if (updatedRowsCount === 0) {
        throw new Error("ISBN certificate not found or no changes made");
      }

      const updatedCertificate = await this.findById(id);

      logger.info("ISBN certificate updated successfully", {
        certificateId: id,
      });

      return updatedCertificate;
    } catch (error) {
      logger.error("Error updating ISBN certificate", {
        error: error.message,
        certificateId: id,
      });
      throw error;
    }
  }

  /**
   * Verify an ISBN certificate
   * @param {number} id - Certificate ID
   * @param {number} verifiedBy - Admin user ID
   * @param {string} reason - Verification reason (optional)
   * @param {Object} transaction - Database transaction (optional)
   * @returns {Promise<Object>} Updated certificate record
   */
  async verify(id, verifiedBy, reason = null, transaction = null) {
    try {
      const updateData = {
        verificationStatus: "VERIFIED",
        verifiedBy,
        verifiedAt: new Date(),
        rejectionReason: null, // Clear any previous rejection reason
      };

      const updatedCertificate = await this.update(id, updateData, transaction);

      logger.info("ISBN certificate verified successfully", {
        certificateId: id,
        verifiedBy,
      });

      return updatedCertificate;
    } catch (error) {
      logger.error("Error verifying ISBN certificate", {
        error: error.message,
        certificateId: id,
      });
      throw error;
    }
  }

  /**
   * Reject an ISBN certificate
   * @param {number} id - Certificate ID
   * @param {number} rejectedBy - Admin user ID
   * @param {string} reason - Rejection reason
   * @param {Object} transaction - Database transaction (optional)
   * @returns {Promise<Object>} Updated certificate record
   */
  async reject(id, rejectedBy, reason, transaction = null) {
    try {
      const updateData = {
        verificationStatus: "REJECTED",
        verifiedBy: rejectedBy,
        verifiedAt: new Date(),
        rejectionReason: reason,
      };

      const updatedCertificate = await this.update(id, updateData, transaction);

      logger.info("ISBN certificate rejected", {
        certificateId: id,
        rejectedBy,
        reason,
      });

      return updatedCertificate;
    } catch (error) {
      logger.error("Error rejecting ISBN certificate", {
        error: error.message,
        certificateId: id,
      });
      throw error;
    }
  }

  /**
   * Deactivate an ISBN certificate
   * @param {number} id - Certificate ID
   * @param {Object} transaction - Database transaction (optional)
   * @returns {Promise<Object>} Updated certificate record
   */
  async deactivate(id, transaction = null) {
    try {
      const updatedCertificate = await this.update(
        id,
        { isActive: false },
        transaction
      );

      logger.info("ISBN certificate deactivated", { certificateId: id });

      return updatedCertificate;
    } catch (error) {
      logger.error("Error deactivating ISBN certificate", {
        error: error.message,
        certificateId: id,
      });
      throw error;
    }
  }

  /**
   * Create audit log entry
   * @param {Object} auditData - Audit log data
   * @param {Object} transaction - Database transaction (optional)
   * @returns {Promise<Object>} Created audit log entry
   */
  async createAuditLog(auditData, transaction = null) {
    try {
      const auditLog = await IsbnAuditLog.create(auditData, { transaction });

      logger.info("ISBN certificate audit log created", {
        auditLogId: auditLog.id,
        action: auditData.action,
        certificateId: auditData.isbnCertificateId,
      });

      return auditLog;
    } catch (error) {
      logger.error("Error creating ISBN certificate audit log", {
        error: error.message,
        certificateId: auditData.isbnCertificateId,
      });
      throw error;
    }
  }

  /**
   * Get audit logs for a certificate
   * @param {number} isbnCertificateId - Certificate ID
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>} Paginated audit logs
   */
  async getAuditLogs(isbnCertificateId, pagination = { page: 1, limit: 20 }) {
    try {
      const offset = (pagination.page - 1) * pagination.limit;

      const { count, rows } = await IsbnAuditLog.findAndCountAll({
        where: { isbnCertificateId },
        include: [
          {
            model: User,
            as: "performer",
            attributes: ["id", "email", "firstName", "lastName"],
          },
        ],
        order: [["createdAt", "DESC"]],
        limit: pagination.limit,
        offset,
      });

      return {
        auditLogs: rows,
        pagination: {
          total: count,
          page: pagination.page,
          limit: pagination.limit,
          totalPages: Math.ceil(count / pagination.limit),
        },
      };
    } catch (error) {
      logger.error("Error getting ISBN certificate audit logs", {
        error: error.message,
        certificateId: isbnCertificateId,
      });
      throw error;
    }
  }

  /**
   * Search certificates with advanced filters
   * @param {Object} searchCriteria - Search criteria
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>} Paginated search results
   */
  async search(searchCriteria = {}, pagination = { page: 1, limit: 10 }) {
    try {
      const whereCondition = {};
      const bookWhereCondition = {};

      // Filter by verification status
      if (searchCriteria.verificationStatus) {
        whereCondition.verificationStatus = searchCriteria.verificationStatus;
      }

      // Filter by issuing authority
      if (searchCriteria.issuingAuthority) {
        whereCondition.issuingAuthority = {
          [Op.iLike]: `%${searchCriteria.issuingAuthority}%`,
        };
      }

      // Filter by issuing country
      if (searchCriteria.issuingCountry) {
        whereCondition.issuingCountry = searchCriteria.issuingCountry;
      }

      // Filter by date range
      if (searchCriteria.fromDate || searchCriteria.toDate) {
        whereCondition.issueDate = {};
        if (searchCriteria.fromDate) {
          whereCondition.issueDate[Op.gte] = searchCriteria.fromDate;
        }
        if (searchCriteria.toDate) {
          whereCondition.issueDate[Op.lte] = searchCriteria.toDate;
        }
      }

      // Filter by book title
      if (searchCriteria.bookTitle) {
        bookWhereCondition.title = {
          [Op.iLike]: `%${searchCriteria.bookTitle}%`,
        };
      }

      // Filter by active status
      if (searchCriteria.isActive !== undefined) {
        whereCondition.isActive = searchCriteria.isActive;
      }

      const offset = (pagination.page - 1) * pagination.limit;

      const { count, rows } = await IsbnCertificate.findAndCountAll({
        where: whereCondition,
        include: [
          {
            model: Book,
            as: "book",
            where:
              Object.keys(bookWhereCondition).length > 0
                ? bookWhereCondition
                : undefined,
          },
          {
            model: User,
            as: "uploader",
            attributes: ["id", "email", "firstName", "lastName"],
          },
          {
            model: User,
            as: "verifier",
            attributes: ["id", "email", "firstName", "lastName"],
          },
        ],
        order: [["createdAt", "DESC"]],
        limit: pagination.limit,
        offset,
      });

      return {
        certificates: rows,
        pagination: {
          total: count,
          page: pagination.page,
          limit: pagination.limit,
          totalPages: Math.ceil(count / pagination.limit),
        },
      };
    } catch (error) {
      logger.error("Error searching ISBN certificates", {
        error: error.message,
        searchCriteria,
      });
      throw error;
    }
  }
}

module.exports = IsbnCertificateRepository;
