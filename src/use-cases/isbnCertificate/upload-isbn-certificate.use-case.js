const isbnCertificateRepository = require("../../repositories/isbnCertificate.repository");
const storageService = require("../../services/storage.service");
const logger = require("../../logger/logger");
const { ErrorHandler } = require("../../shared/utils/ErrorHandler");
const crypto = require("crypto");
const path = require("path");

class UploadIsbnCertificateUseCase {
  async execute({ bookId, uploadedBy, file, certificateInfo, userRole }) {
    try {
      // Validate file
      this.validateFile(file);

      // Validate permissions
      this.validatePermissions(userRole);

      // Validate certificate info
      this.validateCertificateInfo(certificateInfo);

      // Check for existing ISBN
      await this.checkDuplicateIsbn(
        certificateInfo.isbn13,
        certificateInfo.isbn10
      );

      // Upload file to S3
      const fileData = await this.uploadToStorage(
        file,
        bookId,
        certificateInfo.isbn13
      );

      // Calculate file checksum
      const checksum = this.calculateChecksum(file.buffer);

      // Prepare certificate data
      const certificateData = {
        bookId,
        uploadedBy,
        ...certificateInfo,
        fileName: file.originalname,
        fileUrl: fileData.fileUrl,
        fileSize: file.size,
        mimeType: file.mimetype,
        checksum,
        status: "PENDING",
        isActive: true,
      };

      // Create certificate record
      const certificate =
        await isbnCertificateRepository.create(certificateData);

      logger.info(`ISBN certificate uploaded successfully`, {
        certificateId: certificate.id,
        bookId,
        uploadedBy,
        isbn13: certificateInfo.isbn13,
        fileName: file.originalname,
      });

      return {
        success: true,
        data: certificate.getDetailedInfo(),
        message: "ISBN certificate uploaded successfully",
      };
    } catch (error) {
      logger.error("ISBN certificate upload failed", {
        bookId,
        uploadedBy,
        error: error.message,
        stack: error.stack,
      });

      if (error instanceof ErrorHandler) {
        throw error;
      }

      throw new ErrorHandler(500, "Failed to upload ISBN certificate");
    }
  }

  validateFile(file) {
    if (!file) {
      throw new ErrorHandler(400, "Certificate file is required");
    }

    const allowedMimeTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/tiff",
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new ErrorHandler(
        400,
        "Invalid file type. Only PDF and image files are allowed"
      );
    }

    const maxFileSize = 25 * 1024 * 1024; // 25MB
    if (file.size > maxFileSize) {
      throw new ErrorHandler(400, "File size exceeds 25MB limit");
    }

    const minFileSize = 1024; // 1KB
    if (file.size < minFileSize) {
      throw new ErrorHandler(400, "File size is too small");
    }
  }

  validatePermissions(userRole) {
    const allowedRoles = ["AUTHOR", "ADMIN", "PUBLISHER"];
    if (!allowedRoles.includes(userRole)) {
      throw new ErrorHandler(
        403,
        "Insufficient permissions to upload ISBN certificates"
      );
    }
  }

  validateCertificateInfo(certificateInfo) {
    if (!certificateInfo.isbn13) {
      throw new ErrorHandler(400, "ISBN-13 is required");
    }

    if (!certificateInfo.title) {
      throw new ErrorHandler(400, "Book title is required");
    }

    if (!certificateInfo.authorName) {
      throw new ErrorHandler(400, "Author name is required");
    }

    if (!certificateInfo.issuingAuthority) {
      throw new ErrorHandler(400, "Issuing authority is required");
    }

    if (!certificateInfo.issueDate) {
      throw new ErrorHandler(400, "Issue date is required");
    }

    // Validate ISBN-13 format
    const cleanIsbn13 = certificateInfo.isbn13.replace(/-/g, "");
    if (!/^\d{13}$/.test(cleanIsbn13)) {
      throw new ErrorHandler(400, "Invalid ISBN-13 format");
    }

    // Validate ISBN-10 format if provided
    if (certificateInfo.isbn10) {
      const cleanIsbn10 = certificateInfo.isbn10.replace(/-/g, "");
      if (!/^[\dX]{10}$/.test(cleanIsbn10)) {
        throw new ErrorHandler(400, "Invalid ISBN-10 format");
      }
    }

    // Validate issue date
    const issueDate = new Date(certificateInfo.issueDate);
    if (issueDate > new Date()) {
      throw new ErrorHandler(400, "Issue date cannot be in the future");
    }

    // Validate expiry date if provided
    if (certificateInfo.expiryDate) {
      const expiryDate = new Date(certificateInfo.expiryDate);
      if (expiryDate <= issueDate) {
        throw new ErrorHandler(400, "Expiry date must be after issue date");
      }
    }
  }

  async checkDuplicateIsbn(isbn13, isbn10) {
    const existingCertificate =
      await isbnCertificateRepository.findByIsbn(isbn13);
    if (existingCertificate && existingCertificate.isActive) {
      throw new ErrorHandler(
        409,
        "A certificate with this ISBN already exists"
      );
    }

    if (isbn10) {
      const existingCertificate10 =
        await isbnCertificateRepository.findByIsbn(isbn10);
      if (existingCertificate10 && existingCertificate10.isActive) {
        throw new ErrorHandler(
          409,
          "A certificate with this ISBN-10 already exists"
        );
      }
    }
  }

  async uploadToStorage(file, bookId, isbn13) {
    try {
      const timestamp = Date.now();
      const extension = path.extname(file.originalname);
      const sanitizedIsbn = isbn13.replace(/-/g, "");
      const key = `isbn-certificates/${bookId}/${sanitizedIsbn}_${timestamp}${extension}`;

      const metadata = {
        "original-name": file.originalname,
        "content-type": file.mimetype,
        "upload-timestamp": timestamp.toString(),
        "book-id": bookId.toString(),
        isbn: sanitizedIsbn,
      };

      const fileUrl = await storageService.uploadFile(file.buffer, key, {
        ContentType: file.mimetype,
        Metadata: metadata,
      });

      return {
        fileUrl,
        key,
      };
    } catch (error) {
      throw new ErrorHandler(500, `File upload failed: ${error.message}`);
    }
  }

  calculateChecksum(buffer) {
    return crypto.createHash("sha256").update(buffer).digest("hex");
  }

  extractMetadata(file, certificateInfo) {
    return {
      uploadInfo: {
        originalName: file.originalname,
        uploadTime: new Date().toISOString(),
        fileSize: file.size,
        mimeType: file.mimetype,
      },
      documentInfo: {
        extractedText: null, // Could be populated by OCR service
        confidence: null,
        pageCount: certificateInfo.documentPages || null,
      },
      validationInfo: {
        checksumValidated: true,
        formatValidated: true,
        contentValidated: false,
      },
    };
  }
}

module.exports = new UploadIsbnCertificateUseCase();
