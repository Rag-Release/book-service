const {
  uploadCoverDesignUseCase,
  manageCoverDesignUseCase,
} = require("../use-cases/coverDesign");
const coverDesignRepository = require("../repositories/coverDesign.repository");
const logger = require("../logger/logger");
const { ErrorHandler } = require("../shared/utils/ErrorHandler");

class CoverDesignController {
  async uploadCoverDesign(req, res, next) {
    try {
      const { bookId } = req.params;
      const uploadedBy = req.user.id;
      const userRole = req.user.role;
      const file = req.file;

      // Extract designer info from request body
      const designerInfo = {
        designerId: req.body.designerId || uploadedBy, // Can be different from uploader
        designerName: req.body.designerName,
        designerEmail: req.body.designerEmail,
        designerPortfolio: req.body.designerPortfolio,
      };

      // Extract design info from request body
      const designInfo = {
        title: req.body.title,
        description: req.body.description,
        designConcept: req.body.designConcept,
        colorScheme: req.body.colorScheme,
        style: req.body.style,
        targetAudience: req.body.targetAudience,
        designNotes: req.body.designNotes,
      };

      const result = await uploadCoverDesignUseCase.execute({
        bookId: parseInt(bookId),
        uploadedBy,
        file,
        designerInfo,
        designInfo,
        userRole,
      });

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getCoverDesignsByBook(req, res, next) {
    try {
      const { bookId } = req.params;
      const { includeInactive = false, limit, offset } = req.query;

      const coverDesigns = await coverDesignRepository.findByBookId(
        parseInt(bookId),
        {
          includeInactive: includeInactive === "true",
          limit: limit ? parseInt(limit) : undefined,
          offset: offset ? parseInt(offset) : undefined,
        }
      );

      res.json({
        success: true,
        data: coverDesigns.map((cover) => cover.getPublicInfo()),
        meta: {
          total: coverDesigns.length,
          bookId: parseInt(bookId),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getActiveCoverDesign(req, res, next) {
    try {
      const { bookId } = req.params;

      const activeCover = await coverDesignRepository.findActiveByBookId(
        parseInt(bookId)
      );

      if (!activeCover) {
        return res.status(404).json({
          success: false,
          message: "No active cover design found for this book",
        });
      }

      res.json({
        success: true,
        data: activeCover.getPublicInfo(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getCoverDesignById(req, res, next) {
    try {
      const { coverDesignId } = req.params;
      const userRole = req.user?.role;

      const coverDesign = await coverDesignRepository.findById(
        parseInt(coverDesignId)
      );

      if (!coverDesign) {
        return res.status(404).json({
          success: false,
          message: "Cover design not found",
        });
      }

      // Return appropriate data based on user role
      let responseData = coverDesign.getPublicInfo();

      if (
        ["ADMIN", "PUBLISHER", "EDITOR"].includes(userRole) ||
        coverDesign.designerId === req.user?.id
      ) {
        responseData = {
          ...responseData,
          ...coverDesign.getDesignerInfo(),
          ...coverDesign.getTechnicalInfo(),
          rejectionReason: coverDesign.rejectionReason,
          approvedBy: coverDesign.approvedBy,
          approvedAt: coverDesign.approvedAt,
        };
      }

      res.json({
        success: true,
        data: responseData,
      });
    } catch (error) {
      next(error);
    }
  }

  async getDesignerCoverDesigns(req, res, next) {
    try {
      const designerId = req.user.id;
      const { status, limit, offset } = req.query;

      const coverDesigns = await coverDesignRepository.findByDesignerId(
        designerId,
        {
          status,
          limit: limit ? parseInt(limit) : undefined,
          offset: offset ? parseInt(offset) : undefined,
        }
      );

      res.json({
        success: true,
        data: coverDesigns.map((cover) => ({
          ...cover.getPublicInfo(),
          ...cover.getDesignerInfo(),
          rejectionReason: cover.rejectionReason,
        })),
        meta: {
          total: coverDesigns.length,
          designerId,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getUploaderCoverDesigns(req, res, next) {
    try {
      const uploaderId = req.user.id;
      const { status, limit, offset } = req.query;

      const coverDesigns = await coverDesignRepository.findByUploaderId(
        uploaderId,
        {
          status,
          limit: limit ? parseInt(limit) : undefined,
          offset: offset ? parseInt(offset) : undefined,
        }
      );

      res.json({
        success: true,
        data: coverDesigns.map((cover) => cover.getPublicInfo()),
        meta: {
          total: coverDesigns.length,
          uploaderId,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async approveCoverDesign(req, res, next) {
    try {
      const { coverDesignId } = req.params;
      const approvedBy = req.user.id;
      const userRole = req.user.role;

      const result = await manageCoverDesignUseCase.approveCoverDesign({
        coverDesignId: parseInt(coverDesignId),
        approvedBy,
        userRole,
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async rejectCoverDesign(req, res, next) {
    try {
      const { coverDesignId } = req.params;
      const { rejectionReason } = req.body;
      const rejectedBy = req.user.id;
      const userRole = req.user.role;

      const result = await manageCoverDesignUseCase.rejectCoverDesign({
        coverDesignId: parseInt(coverDesignId),
        rejectionReason,
        rejectedBy,
        userRole,
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async setActiveCoverDesign(req, res, next) {
    try {
      const { bookId, coverDesignId } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      const result = await manageCoverDesignUseCase.setActiveCoverDesign({
        coverDesignId: parseInt(coverDesignId),
        bookId: parseInt(bookId),
        userId,
        userRole,
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateCoverDesign(req, res, next) {
    try {
      const { coverDesignId } = req.params;
      const updateData = req.body;
      const userId = req.user.id;
      const userRole = req.user.role;

      const result = await manageCoverDesignUseCase.updateCoverDesign({
        coverDesignId: parseInt(coverDesignId),
        updateData,
        userId,
        userRole,
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getCoverDesignVersionHistory(req, res, next) {
    try {
      const { bookId } = req.params;

      const versions = await coverDesignRepository.getVersionHistory(
        parseInt(bookId)
      );

      res.json({
        success: true,
        data: versions.map((version) => version.getPublicInfo()),
        meta: {
          total: versions.length,
          bookId: parseInt(bookId),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCoverDesign(req, res, next) {
    try {
      const { coverDesignId } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      // Get cover design to check permissions
      const coverDesign = await coverDesignRepository.findById(
        parseInt(coverDesignId)
      );

      if (!coverDesign) {
        return res.status(404).json({
          success: false,
          message: "Cover design not found",
        });
      }

      // Check permissions
      const canDelete =
        userRole === "ADMIN" ||
        (coverDesign.designerId === userId && coverDesign.status !== "ACTIVE");

      if (!canDelete) {
        throw new ErrorHandler(
          403,
          "Insufficient permissions to delete cover design"
        );
      }

      if (coverDesign.status === "ACTIVE") {
        throw new ErrorHandler(400, "Cannot delete active cover design");
      }

      const deleted = await coverDesignRepository.delete(
        parseInt(coverDesignId)
      );

      if (!deleted) {
        throw new ErrorHandler(404, "Cover design not found");
      }

      logger.info("Cover design deleted", {
        coverDesignId,
        userId,
        bookId: coverDesign.bookId,
      });

      res.json({
        success: true,
        message: "Cover design deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CoverDesignController();
