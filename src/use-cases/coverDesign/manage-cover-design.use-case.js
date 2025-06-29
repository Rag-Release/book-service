const coverDesignRepository = require("../../repositories/coverDesign.repository");
const logger = require("../../logger/logger");
const { ErrorHandler } = require("../../shared/utils/ErrorHandler");

class ManageCoverDesignUseCase {
  async approveCoverDesign({ coverDesignId, approvedBy, userRole }) {
    try {
      // Validate permissions
      this.validateApprovalPermissions(userRole);

      // Get cover design
      const coverDesign = await coverDesignRepository.findById(coverDesignId);
      if (!coverDesign) {
        throw new ErrorHandler(404, "Cover design not found");
      }

      // Validate status
      if (
        coverDesign.status === "APPROVED" ||
        coverDesign.status === "ACTIVE"
      ) {
        throw new ErrorHandler(400, "Cover design is already approved");
      }

      if (coverDesign.status === "REJECTED") {
        throw new ErrorHandler(400, "Cannot approve a rejected cover design");
      }

      // Approve the cover design
      const approvedCover = await coverDesignRepository.approve(
        coverDesignId,
        approvedBy
      );

      logger.info("Cover design approved", {
        coverDesignId,
        approvedBy,
        bookId: coverDesign.bookId,
      });

      return {
        success: true,
        data: approvedCover.getPublicInfo(),
        message: "Cover design approved successfully",
      };
    } catch (error) {
      logger.error("Cover design approval failed", {
        coverDesignId,
        approvedBy,
        error: error.message,
      });

      if (error instanceof ErrorHandler) {
        throw error;
      }

      throw new ErrorHandler(500, "Failed to approve cover design");
    }
  }

  async rejectCoverDesign({
    coverDesignId,
    rejectionReason,
    rejectedBy,
    userRole,
  }) {
    try {
      // Validate permissions
      this.validateApprovalPermissions(userRole);

      // Validate rejection reason
      if (!rejectionReason || rejectionReason.trim().length === 0) {
        throw new ErrorHandler(400, "Rejection reason is required");
      }

      // Get cover design
      const coverDesign = await coverDesignRepository.findById(coverDesignId);
      if (!coverDesign) {
        throw new ErrorHandler(404, "Cover design not found");
      }

      // Validate status
      if (coverDesign.status === "REJECTED") {
        throw new ErrorHandler(400, "Cover design is already rejected");
      }

      if (coverDesign.status === "ACTIVE") {
        throw new ErrorHandler(400, "Cannot reject an active cover design");
      }

      // Reject the cover design
      const rejectedCover = await coverDesignRepository.reject(
        coverDesignId,
        rejectionReason,
        rejectedBy
      );

      logger.info("Cover design rejected", {
        coverDesignId,
        rejectedBy,
        rejectionReason,
        bookId: coverDesign.bookId,
      });

      return {
        success: true,
        data: rejectedCover.getPublicInfo(),
        message: "Cover design rejected successfully",
      };
    } catch (error) {
      logger.error("Cover design rejection failed", {
        coverDesignId,
        rejectedBy,
        error: error.message,
      });

      if (error instanceof ErrorHandler) {
        throw error;
      }

      throw new ErrorHandler(500, "Failed to reject cover design");
    }
  }

  async setActiveCoverDesign({ coverDesignId, bookId, userId, userRole }) {
    try {
      // Validate permissions
      this.validateActivationPermissions(userRole);

      // Get cover design
      const coverDesign = await coverDesignRepository.findById(coverDesignId);
      if (!coverDesign) {
        throw new ErrorHandler(404, "Cover design not found");
      }

      // Validate that cover belongs to the book
      if (coverDesign.bookId !== bookId) {
        throw new ErrorHandler(
          400,
          "Cover design does not belong to the specified book"
        );
      }

      // Validate status
      if (
        coverDesign.status !== "APPROVED" &&
        coverDesign.status !== "ACTIVE"
      ) {
        throw new ErrorHandler(
          400,
          "Only approved cover designs can be set as active"
        );
      }

      // Set as active
      const activeCover = await coverDesignRepository.setAsActive(
        coverDesignId,
        bookId
      );

      logger.info("Cover design set as active", {
        coverDesignId,
        bookId,
        userId,
      });

      return {
        success: true,
        data: activeCover.getPublicInfo(),
        message: "Cover design set as active successfully",
      };
    } catch (error) {
      logger.error("Setting cover as active failed", {
        coverDesignId,
        bookId,
        userId,
        error: error.message,
      });

      if (error instanceof ErrorHandler) {
        throw error;
      }

      throw new ErrorHandler(500, "Failed to set cover design as active");
    }
  }

  async updateCoverDesign({ coverDesignId, updateData, userId, userRole }) {
    try {
      // Get cover design
      const coverDesign = await coverDesignRepository.findById(coverDesignId);
      if (!coverDesign) {
        throw new ErrorHandler(404, "Cover design not found");
      }

      // Validate permissions
      this.validateUpdatePermissions(coverDesign, userId, userRole);

      // Validate update data
      const allowedFields = [
        "title",
        "description",
        "designConcept",
        "colorScheme",
        "style",
        "targetAudience",
        "designNotes",
        "designerName",
        "designerEmail",
        "designerPortfolio",
      ];

      const filteredUpdateData = {};
      Object.keys(updateData).forEach((key) => {
        if (allowedFields.includes(key)) {
          filteredUpdateData[key] = updateData[key];
        }
      });

      if (Object.keys(filteredUpdateData).length === 0) {
        throw new ErrorHandler(400, "No valid fields to update");
      }

      // Update cover design
      const updatedCover = await coverDesignRepository.update(
        coverDesignId,
        filteredUpdateData
      );

      logger.info("Cover design updated", {
        coverDesignId,
        userId,
        updatedFields: Object.keys(filteredUpdateData),
      });

      return {
        success: true,
        data: updatedCover.getPublicInfo(),
        message: "Cover design updated successfully",
      };
    } catch (error) {
      logger.error("Cover design update failed", {
        coverDesignId,
        userId,
        error: error.message,
      });

      if (error instanceof ErrorHandler) {
        throw error;
      }

      throw new ErrorHandler(500, "Failed to update cover design");
    }
  }

  validateApprovalPermissions(userRole) {
    const allowedRoles = ["ADMIN", "PUBLISHER", "EDITOR"];
    if (!allowedRoles.includes(userRole)) {
      throw new ErrorHandler(
        403,
        "Insufficient permissions to approve/reject cover designs"
      );
    }
  }

  validateActivationPermissions(userRole) {
    const allowedRoles = ["ADMIN", "AUTHOR", "PUBLISHER"];
    if (!allowedRoles.includes(userRole)) {
      throw new ErrorHandler(
        403,
        "Insufficient permissions to set active cover design"
      );
    }
  }

  validateUpdatePermissions(coverDesign, userId, userRole) {
    const allowedRoles = ["ADMIN", "PUBLISHER"];
    const isOwner = coverDesign.designerId === userId;
    const isAuthorized = allowedRoles.includes(userRole) || isOwner;

    if (!isAuthorized) {
      throw new ErrorHandler(
        403,
        "Insufficient permissions to update cover design"
      );
    }

    // Don't allow updates to active covers by non-admin users
    if (coverDesign.status === "ACTIVE" && userRole !== "ADMIN") {
      throw new ErrorHandler(400, "Cannot update active cover designs");
    }
  }
}

module.exports = new ManageCoverDesignUseCase();
