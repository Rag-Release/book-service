const coverDesignRepository = require("../../repositories/coverDesign.repository");
const storageService = require("../../services/storage.service");
const logger = require("../../logger/logger");
const { ErrorHandler } = require("../../shared/utils/ErrorHandler");

class UploadCoverDesignUseCase {
  async execute({
    bookId,
    uploadedBy,
    file,
    designerInfo,
    designInfo,
    userRole,
  }) {
    try {
      // Validate file
      this.validateFile(file);

      // Validate permissions
      await this.validatePermissions(bookId, uploadedBy, userRole);

      // Get next version number
      const version = await coverDesignRepository.getNextVersion(bookId);

      // Upload file to S3
      const fileData = await this.uploadToStorage(file, bookId, version);

      // Prepare cover design data
      const coverDesignData = {
        bookId,
        uploadedBy,
        designerId: designerInfo.designerId || uploadedBy, // Can be different from uploader
        version,
        ...designerInfo,
        ...designInfo,
        ...fileData,
        status: "SUBMITTED",
      };

      // Create cover design record
      const coverDesign = await coverDesignRepository.create(coverDesignData);

      logger.info(`Cover design uploaded successfully`, {
        coverDesignId: coverDesign.id,
        bookId,
        uploadedBy,
        fileName: file.originalname,
      });

      return {
        success: true,
        data: coverDesign.getPublicInfo(),
        message: "Cover design uploaded successfully",
      };
    } catch (error) {
      logger.error("Cover design upload failed", {
        bookId,
        uploadedBy,
        error: error.message,
        stack: error.stack,
      });

      if (error instanceof ErrorHandler) {
        throw error;
      }

      throw new ErrorHandler(500, "Failed to upload cover design");
    }
  }

  validateFile(file) {
    if (!file) {
      throw new ErrorHandler(400, "Cover image file is required");
    }

    // Check file type
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/tiff",
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new ErrorHandler(
        400,
        "Invalid file type. Only JPEG, PNG, WebP, and TIFF are allowed"
      );
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new ErrorHandler(400, "File size too large. Maximum size is 10MB");
    }

    // Check image dimensions if available
    if (file.width && file.height) {
      const minWidth = 300;
      const minHeight = 400;
      if (file.width < minWidth || file.height < minHeight) {
        throw new ErrorHandler(
          400,
          `Image dimensions too small. Minimum size is ${minWidth}x${minHeight}px`
        );
      }
    }
  }

  async validatePermissions(bookId, uploadedBy, userRole) {
    // Check if user has permission to upload covers
    if (!["AUTHOR", "DESIGNER", "ADMIN"].includes(userRole)) {
      throw new ErrorHandler(
        403,
        "Insufficient permissions to upload cover designs"
      );
    }

    // Additional validation logic would go here
    // e.g., checking if the user owns the book or is assigned as designer
  }

  async uploadToStorage(file, bookId, version) {
    try {
      // Generate unique filename
      const timestamp = Date.now();
      const extension = file.originalname.split(".").pop();
      const fileName = `cover-v${version}-${timestamp}.${extension}`;
      const filePath = `books/${bookId}/covers/${fileName}`;

      // Upload original file
      const fileUrl = await storageService.uploadFile(file.buffer, filePath, {
        ContentType: file.mimetype,
        Metadata: {
          bookId: bookId.toString(),
          version: version.toString(),
          originalName: file.originalname,
        },
      });

      // Generate thumbnail
      const thumbnailUrl = await this.generateThumbnail(file, bookId, version);

      // Extract image dimensions
      const dimensions = await this.extractDimensions(file);

      return {
        fileName: file.originalname,
        fileUrl,
        thumbnailUrl,
        fileSize: file.size,
        mimeType: file.mimetype,
        dimensions,
        metadata: {
          uploadedAt: new Date(),
          s3Key: filePath,
          originalName: file.originalname,
        },
      };
    } catch (error) {
      logger.error("File upload to storage failed", {
        bookId,
        fileName: file.originalname,
        error: error.message,
      });
      throw new ErrorHandler(500, "Failed to upload file to storage");
    }
  }

  async generateThumbnail(file, bookId, version) {
    try {
      // This would use an image processing library like Sharp
      // to generate a thumbnail version of the cover
      const thumbnailPath = `books/${bookId}/covers/thumbnails/thumb-v${version}-${Date.now()}.jpg`;

      // Placeholder for thumbnail generation
      // const thumbnailBuffer = await sharp(file.buffer)
      //   .resize(200, 267)
      //   .jpeg({ quality: 85 })
      //   .toBuffer();

      // const thumbnailUrl = await storageService.uploadFile(thumbnailBuffer, thumbnailPath, {
      //   ContentType: 'image/jpeg'
      // });

      // For now, return null - implement thumbnail generation as needed
      return null;
    } catch (error) {
      logger.warn("Thumbnail generation failed", {
        bookId,
        error: error.message,
      });
      return null;
    }
  }

  async extractDimensions(file) {
    try {
      // This would use an image processing library to extract dimensions
      // For now, return dimensions from file metadata if available
      if (file.width && file.height) {
        return {
          width: file.width,
          height: file.height,
        };
      }
      return null;
    } catch (error) {
      logger.warn("Dimension extraction failed", { error: error.message });
      return null;
    }
  }
}

module.exports = new UploadCoverDesignUseCase();
