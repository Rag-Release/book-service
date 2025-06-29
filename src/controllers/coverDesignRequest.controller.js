const createCoverDesignRequestUseCase = require("../use-cases/coverDesignRequest/create-cover-design-request.use-case");
const coverDesignRequestRepository = require("../repositories/coverDesignRequest.repository");
const logger = require("../logger/logger");
const { ErrorHandler } = require("../shared/utils/ErrorHandler");

class CoverDesignRequestController {
  async createRequest(req, res, next) {
    try {
      const { bookId } = req.params;
      const authorId = req.user.id;
      const userRole = req.user.role;
      const requestData = req.body;

      const result = await createCoverDesignRequestUseCase.execute({
        bookId: parseInt(bookId),
        authorId,
        requestData,
        userRole,
      });

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getRequestById(req, res, next) {
    try {
      const { requestId } = req.params;

      const request = await coverDesignRequestRepository.findById(
        parseInt(requestId)
      );

      if (!request) {
        return res.status(404).json({
          success: false,
          message: "Cover design request not found",
        });
      }

      // Check permissions
      const userRole = req.user?.role;
      const userId = req.user?.id;
      const isAuthor = request.authorId === userId;
      const isAssignedDesigner = request.assignedDesignerId === userId;
      const canViewDetailed =
        ["ADMIN", "PUBLISHER"].includes(userRole) ||
        isAuthor ||
        isAssignedDesigner;

      const responseData = canViewDetailed
        ? request.getDetailedInfo()
        : request.getPublicInfo();

      res.json({
        success: true,
        data: responseData,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAuthorRequests(req, res, next) {
    try {
      const authorId = req.user.id;
      const { status, priority, limit, offset } = req.query;

      const requests = await coverDesignRequestRepository.findByAuthorId(
        authorId,
        {
          status,
          priority,
          limit: limit ? parseInt(limit) : undefined,
          offset: offset ? parseInt(offset) : undefined,
        }
      );

      res.json({
        success: true,
        data: requests.map((request) => request.getPublicInfo()),
        meta: {
          total: requests.length,
          authorId,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getOpenRequests(req, res, next) {
    try {
      const { priority, budget, limit, offset } = req.query;

      const requests = await coverDesignRequestRepository.findOpenRequests({
        priority,
        budget: budget ? parseFloat(budget) : undefined,
        limit: limit ? parseInt(limit) : undefined,
        offset: offset ? parseInt(offset) : undefined,
      });

      res.json({
        success: true,
        data: requests.map((request) => request.getPublicInfo()),
        meta: {
          total: requests.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getDesignerRequests(req, res, next) {
    try {
      const designerId = req.user.id;
      const { status, limit, offset } = req.query;

      const requests = await coverDesignRequestRepository.findByDesignerId(
        designerId,
        {
          status,
          limit: limit ? parseInt(limit) : undefined,
          offset: offset ? parseInt(offset) : undefined,
        }
      );

      res.json({
        success: true,
        data: requests.map((request) => request.getDetailedInfo()),
        meta: {
          total: requests.length,
          designerId,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async assignDesigner(req, res, next) {
    try {
      const { requestId } = req.params;
      const { designerId } = req.body;
      const userRole = req.user.role;

      // Check permissions
      if (!["ADMIN", "PUBLISHER"].includes(userRole)) {
        throw new ErrorHandler(
          403,
          "Insufficient permissions to assign designers"
        );
      }

      const updatedRequest = await coverDesignRequestRepository.assignDesigner(
        parseInt(requestId),
        designerId
      );

      if (!updatedRequest) {
        throw new ErrorHandler(404, "Cover design request not found");
      }

      logger.info("Designer assigned to cover design request", {
        requestId,
        designerId,
        assignedBy: req.user.id,
      });

      res.json({
        success: true,
        data: updatedRequest.getDetailedInfo(),
        message: "Designer assigned successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async updateRequest(req, res, next) {
    try {
      const { requestId } = req.params;
      const updateData = req.body;
      const userId = req.user.id;
      const userRole = req.user.role;

      // Get the request to check permissions
      const request = await coverDesignRequestRepository.findById(
        parseInt(requestId)
      );

      if (!request) {
        throw new ErrorHandler(404, "Cover design request not found");
      }

      // Check permissions
      const isAuthor = request.authorId === userId;
      const isAssignedDesigner = request.assignedDesignerId === userId;
      const canUpdate = ["ADMIN", "PUBLISHER"].includes(userRole) || isAuthor;

      if (!canUpdate) {
        throw new ErrorHandler(
          403,
          "Insufficient permissions to update this request"
        );
      }

      // Filter allowed fields based on user type
      const allowedFields = this.getAllowedUpdateFields(
        userRole,
        isAuthor,
        isAssignedDesigner
      );
      const filteredUpdateData = {};

      Object.keys(updateData).forEach((key) => {
        if (allowedFields.includes(key)) {
          filteredUpdateData[key] = updateData[key];
        }
      });

      if (Object.keys(filteredUpdateData).length === 0) {
        throw new ErrorHandler(400, "No valid fields to update");
      }

      const updatedRequest = await coverDesignRequestRepository.update(
        parseInt(requestId),
        filteredUpdateData
      );

      logger.info("Cover design request updated", {
        requestId,
        userId,
        updatedFields: Object.keys(filteredUpdateData),
      });

      res.json({
        success: true,
        data: updatedRequest.getDetailedInfo(),
        message: "Cover design request updated successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  getAllowedUpdateFields(userRole, isAuthor, isAssignedDesigner) {
    if (["ADMIN", "PUBLISHER"].includes(userRole)) {
      return [
        "title",
        "description",
        "priority",
        "status",
        "deadlineDate",
        "budget",
        "authorNotes",
        "designerNotes",
      ];
    }

    if (isAuthor) {
      return ["title", "description", "authorNotes", "deadlineDate", "budget"];
    }

    if (isAssignedDesigner) {
      return ["designerNotes", "status"];
    }

    return [];
  }
}

module.exports = new CoverDesignRequestController();
