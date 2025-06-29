const uploadIsbnCertificateUseCase = require("../use-cases/isbnCertificate/upload-isbn-certificate.use-case");
const isbnCertificateRepository = require("../repositories/isbnCertificate.repository");
const logger = require("../logger/logger");
const { ErrorHandler } = require("../shared/utils/ErrorHandler");

class IsbnCertificateController {
  async uploadCertificate(req, res, next) {
    try {
      const { bookId } = req.params;
      const uploadedBy = req.user.id;
      const userRole = req.user.role;
      const file = req.file;

      // Extract certificate info from request body
      const certificateInfo = {
        isbn13: req.body.isbn13,
        isbn10: req.body.isbn10,
        title: req.body.title,
        authorName: req.body.authorName,
        publisherName: req.body.publisherName,
        publicationDate: req.body.publicationDate
          ? new Date(req.body.publicationDate)
          : null,
        issuingAuthority: req.body.issuingAuthority,
        countryCode: req.body.countryCode,
        language: req.body.language,
        format: req.body.format || "PAPERBACK",
        certificateType: req.body.certificateType || "ORIGINAL",
        issueDate: new Date(req.body.issueDate),
        expiryDate: req.body.expiryDate ? new Date(req.body.expiryDate) : null,
        registrationNumber: req.body.registrationNumber,
        documentPages: req.body.documentPages
          ? parseInt(req.body.documentPages)
          : null,
        notes: req.body.notes,
        tags: req.body.tags ? JSON.parse(req.body.tags) : null,
      };

      const result = await uploadIsbnCertificateUseCase.execute({
        bookId: parseInt(bookId),
        uploadedBy,
        file,
        certificateInfo,
        userRole,
      });

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getCertificateById(req, res, next) {
    try {
      const { certificateId } = req.params;

      const certificate = await isbnCertificateRepository.findById(
        parseInt(certificateId)
      );

      if (!certificate) {
        return res.status(404).json({
          success: false,
          message: "ISBN certificate not found",
        });
      }

      // Check permissions
      const userRole = req.user?.role;
      const userId = req.user?.id;
      const isUploader = certificate.uploadedBy === userId;
      const canViewDetailed =
        ["ADMIN", "PUBLISHER", "EDITOR"].includes(userRole) || isUploader;

      const responseData = canViewDetailed
        ? certificate.getDetailedInfo()
        : certificate.getPublicInfo();

      res.json({
        success: true,
        data: responseData,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCertificatesByBook(req, res, next) {
    try {
      const { bookId } = req.params;
      const { includeInactive, limit, offset } = req.query;

      const certificates = await isbnCertificateRepository.findByBookId(
        parseInt(bookId),
        {
          includeInactive: includeInactive === "true",
          limit: limit ? parseInt(limit) : undefined,
          offset: offset ? parseInt(offset) : undefined,
        }
      );

      res.json({
        success: true,
        data: certificates.map((cert) => cert.getPublicInfo()),
        meta: {
          total: certificates.length,
          bookId: parseInt(bookId),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getUploaderCertificates(req, res, next) {
    try {
      const uploaderId = req.user.id;
      const { status, limit, offset } = req.query;

      const certificates = await isbnCertificateRepository.findByUploaderId(
        uploaderId,
        {
          status,
          limit: limit ? parseInt(limit) : undefined,
          offset: offset ? parseInt(offset) : undefined,
        }
      );

      res.json({
        success: true,
        data: certificates.map((cert) => cert.getDetailedInfo()),
        meta: {
          total: certificates.length,
          uploaderId,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getPendingCertificates(req, res, next) {
    try {
      const { limit, offset, issuingAuthority } = req.query;

      const certificates =
        await isbnCertificateRepository.findPendingCertificates({
          limit: limit ? parseInt(limit) : undefined,
          offset: offset ? parseInt(offset) : undefined,
          issuingAuthority,
        });

      res.json({
        success: true,
        data: certificates.map((cert) => cert.getDetailedInfo()),
        meta: {
          total: certificates.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyCertificate(req, res, next) {
    try {
      const { certificateId } = req.params;
      const { verificationMethod } = req.body;
      const verifierId = req.user.id;
      const userRole = req.user.role;

      // Check permissions
      if (!["ADMIN", "PUBLISHER", "EDITOR"].includes(userRole)) {
        throw new ErrorHandler(
          403,
          "Insufficient permissions to verify certificates"
        );
      }

      const updatedCertificate = await isbnCertificateRepository.verify(
        parseInt(certificateId),
        verifierId,
        verificationMethod || "MANUAL"
      );

      if (!updatedCertificate) {
        throw new ErrorHandler(404, "ISBN certificate not found");
      }

      logger.info("ISBN certificate verified", {
        certificateId,
        verifierId,
        verificationMethod,
      });

      res.json({
        success: true,
        data: updatedCertificate.getDetailedInfo(),
        message: "Certificate verified successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async approveCertificate(req, res, next) {
    try {
      const { certificateId } = req.params;
      const verifierId = req.user.id;
      const userRole = req.user.role;

      // Check permissions
      if (!["ADMIN", "PUBLISHER"].includes(userRole)) {
        throw new ErrorHandler(
          403,
          "Insufficient permissions to approve certificates"
        );
      }

      const updatedCertificate = await isbnCertificateRepository.approve(
        parseInt(certificateId),
        verifierId
      );

      if (!updatedCertificate) {
        throw new ErrorHandler(404, "ISBN certificate not found");
      }

      logger.info("ISBN certificate approved", {
        certificateId,
        verifierId,
      });

      res.json({
        success: true,
        data: updatedCertificate.getDetailedInfo(),
        message: "Certificate approved successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async rejectCertificate(req, res, next) {
    try {
      const { certificateId } = req.params;
      const { rejectionReason } = req.body;
      const verifierId = req.user.id;
      const userRole = req.user.role;

      // Check permissions
      if (!["ADMIN", "PUBLISHER", "EDITOR"].includes(userRole)) {
        throw new ErrorHandler(
          403,
          "Insufficient permissions to reject certificates"
        );
      }

      if (!rejectionReason || rejectionReason.trim().length === 0) {
        throw new ErrorHandler(400, "Rejection reason is required");
      }

      const updatedCertificate = await isbnCertificateRepository.reject(
        parseInt(certificateId),
        verifierId,
        rejectionReason
      );

      if (!updatedCertificate) {
        throw new ErrorHandler(404, "ISBN certificate not found");
      }

      logger.info("ISBN certificate rejected", {
        certificateId,
        verifierId,
        rejectionReason,
      });

      res.json({
        success: true,
        data: updatedCertificate.getDetailedInfo(),
        message: "Certificate rejected successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async searchCertificates(req, res, next) {
    try {
      const {
        q: searchQuery,
        status,
        issuingAuthority,
        limit,
        offset,
      } = req.query;

      if (!searchQuery || searchQuery.trim().length < 3) {
        throw new ErrorHandler(
          400,
          "Search query must be at least 3 characters"
        );
      }

      const certificates = await isbnCertificateRepository.searchCertificates(
        searchQuery.trim(),
        {
          status,
          issuingAuthority,
          limit: limit ? parseInt(limit) : undefined,
          offset: offset ? parseInt(offset) : undefined,
        }
      );

      res.json({
        success: true,
        data: certificates.map((cert) => cert.getPublicInfo()),
        meta: {
          total: certificates.length,
          searchQuery: searchQuery.trim(),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getCertificateStats(req, res, next) {
    try {
      const userRole = req.user.role;

      // Check permissions
      if (!["ADMIN", "PUBLISHER"].includes(userRole)) {
        throw new ErrorHandler(
          403,
          "Insufficient permissions to view certificate statistics"
        );
      }

      const stats = await isbnCertificateRepository.getStatsByStatus();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateCertificate(req, res, next) {
    try {
      const { certificateId } = req.params;
      const updateData = req.body;
      const userId = req.user.id;
      const userRole = req.user.role;

      // Get the certificate to check permissions
      const certificate = await isbnCertificateRepository.findById(
        parseInt(certificateId)
      );

      if (!certificate) {
        throw new ErrorHandler(404, "ISBN certificate not found");
      }

      // Check permissions
      const isUploader = certificate.uploadedBy === userId;
      const canUpdate = ["ADMIN", "PUBLISHER"].includes(userRole) || isUploader;

      if (!canUpdate) {
        throw new ErrorHandler(
          403,
          "Insufficient permissions to update this certificate"
        );
      }

      // Filter allowed fields based on user type
      const allowedFields = this.getAllowedUpdateFields(userRole, isUploader);
      const filteredUpdateData = {};

      Object.keys(updateData).forEach((key) => {
        if (allowedFields.includes(key)) {
          filteredUpdateData[key] = updateData[key];
        }
      });

      if (Object.keys(filteredUpdateData).length === 0) {
        throw new ErrorHandler(400, "No valid fields to update");
      }

      const updatedCertificate = await isbnCertificateRepository.update(
        parseInt(certificateId),
        filteredUpdateData
      );

      logger.info("ISBN certificate updated", {
        certificateId,
        userId,
        updatedFields: Object.keys(filteredUpdateData),
      });

      res.json({
        success: true,
        data: updatedCertificate.getDetailedInfo(),
        message: "Certificate updated successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  getAllowedUpdateFields(userRole, isUploader) {
    if (["ADMIN", "PUBLISHER"].includes(userRole)) {
      return ["notes", "tags", "isActive", "registrationNumber", "metadata"];
    }

    if (isUploader) {
      return ["notes", "tags", "registrationNumber"];
    }

    return [];
  }

  async deleteCertificate(req, res, next) {
    try {
      const { certificateId } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      // Get the certificate to check permissions
      const certificate = await isbnCertificateRepository.findById(
        parseInt(certificateId)
      );

      if (!certificate) {
        throw new ErrorHandler(404, "ISBN certificate not found");
      }

      // Check permissions
      const isUploader = certificate.uploadedBy === userId;
      const canDelete =
        ["ADMIN"].includes(userRole) || (isUploader && certificate.isPending());

      if (!canDelete) {
        throw new ErrorHandler(
          403,
          "Insufficient permissions to delete this certificate"
        );
      }

      const deleted = await isbnCertificateRepository.delete(
        parseInt(certificateId)
      );

      if (!deleted) {
        throw new ErrorHandler(500, "Failed to delete certificate");
      }

      logger.info("ISBN certificate deleted", {
        certificateId,
        userId,
      });

      res.json({
        success: true,
        message: "Certificate deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new IsbnCertificateController();
