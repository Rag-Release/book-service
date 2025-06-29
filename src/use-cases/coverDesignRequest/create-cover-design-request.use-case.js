const coverDesignRequestRepository = require("../../repositories/coverDesignRequest.repository");
const logger = require("../../logger/logger");
const { ErrorHandler } = require("../../shared/utils/ErrorHandler");

class CreateCoverDesignRequestUseCase {
  async execute({ bookId, authorId, requestData, userRole }) {
    try {
      // Validate permissions
      this.validatePermissions(userRole);

      // Validate request data
      this.validateRequestData(requestData);

      // Prepare cover design request data
      const coverDesignRequestData = {
        bookId,
        authorId,
        ...requestData,
        status: "OPEN",
      };

      // Create cover design request
      const request = await coverDesignRequestRepository.create(
        coverDesignRequestData
      );

      logger.info(`Cover design request created successfully`, {
        requestId: request.id,
        bookId,
        authorId,
        title: requestData.title,
      });

      return {
        success: true,
        data: request.getDetailedInfo(),
        message: "Cover design request created successfully",
      };
    } catch (error) {
      logger.error("Cover design request creation failed", {
        bookId,
        authorId,
        error: error.message,
        stack: error.stack,
      });

      if (error instanceof ErrorHandler) {
        throw error;
      }

      throw new ErrorHandler(500, "Failed to create cover design request");
    }
  }

  validatePermissions(userRole) {
    const allowedRoles = ["AUTHOR", "ADMIN", "PUBLISHER"];
    if (!allowedRoles.includes(userRole)) {
      throw new ErrorHandler(
        403,
        "Insufficient permissions to create cover design requests"
      );
    }
  }

  validateRequestData(requestData) {
    // Validate required fields
    if (!requestData.title || requestData.title.trim().length === 0) {
      throw new ErrorHandler(400, "Title is required");
    }

    // Validate deadline if provided
    if (requestData.deadlineDate) {
      const deadline = new Date(requestData.deadlineDate);
      if (deadline <= new Date()) {
        throw new ErrorHandler(400, "Deadline must be in the future");
      }
    }

    // Validate budget if provided
    if (requestData.budget && requestData.budget < 0) {
      throw new ErrorHandler(400, "Budget must be non-negative");
    }

    // Validate file size constraints
    if (requestData.minFileSize && requestData.maxFileSize) {
      if (requestData.minFileSize >= requestData.maxFileSize) {
        throw new ErrorHandler(
          400,
          "Minimum file size must be less than maximum file size"
        );
      }
    }

    // Validate revision limit
    if (
      requestData.revisionLimit &&
      (requestData.revisionLimit < 0 || requestData.revisionLimit > 10)
    ) {
      throw new ErrorHandler(400, "Revision limit must be between 0 and 10");
    }
  }
}

module.exports = new CreateCoverDesignRequestUseCase();
