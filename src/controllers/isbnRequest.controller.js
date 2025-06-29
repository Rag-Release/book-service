const isbnRequestRepository = require("../repositories/isbnRequest.repository");
const logger = require("../logger/logger");
const { ErrorHandler } = require("../shared/utils/ErrorHandler");

class IsbnRequestController {
  async createRequest(req, res, next) {
    try {
      const { bookId } = req.params;
      const authorId = req.user.id;
      const userRole = req.user.role;
      const requestData = req.body;

      // Check permissions
      if (!["AUTHOR", "ADMIN"].includes(userRole)) {
        throw new ErrorHandler(403, "Only authors can create ISBN requests");
      }

      const isbnRequestData = {
        bookId: parseInt(bookId),
        authorId,
        ...requestData,
        status: "PENDING",
      };

      const request = await isbnRequestRepository.create(isbnRequestData);

      logger.info("ISBN request created successfully", {
        requestId: request.id,
        bookId,
        authorId,
      });

      res.status(201).json({
        success: true,
        data: request.getDetailedInfo(),
        message: "ISBN request created successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async getRequestById(req, res, next) {
    try {
      const { requestId } = req.params;

      const request = await isbnRequestRepository.findById(parseInt(requestId));

      if (!request) {
        return res.status(404).json({
          success: false,
          message: "ISBN request not found",
        });
      }

      // Check permissions
      const userRole = req.user?.role;
      const userId = req.user?.id;
      const isAuthor = request.authorId === userId;
      const isPublisher = request.publisherId === userId;
      const canViewDetailed =
        ["ADMIN", "PUBLISHER"].includes(userRole) || isAuthor || isPublisher;

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
      const { status, limit, offset } = req.query;

      const requests = await isbnRequestRepository.findByAuthorId(authorId, {
        status,
        limit: limit ? parseInt(limit) : undefined,
        offset: offset ? parseInt(offset) : undefined,
      });

      res.json({
        success: true,
        data: requests.map((request) => request.getDetailedInfo()),
        meta: { total: requests.length, authorId },
      });
    } catch (error) {
      next(error);
    }
  }

  async getPendingRequests(req, res, next) {
    try {
      const { limit, offset } = req.query;

      const requests = await isbnRequestRepository.findPendingRequests({
        limit: limit ? parseInt(limit) : undefined,
        offset: offset ? parseInt(offset) : undefined,
      });

      res.json({
        success: true,
        data: requests.map((request) => request.getPublicInfo()),
        meta: { total: requests.length },
      });
    } catch (error) {
      next(error);
    }
  }

  async assignPublisher(req, res, next) {
    try {
      const { requestId } = req.params;
      const { publisherId } = req.body;
      const userRole = req.user.role;

      if (!["ADMIN", "PUBLISHER"].includes(userRole)) {
        throw new ErrorHandler(
          403,
          "Insufficient permissions to assign publishers"
        );
      }

      const updatedRequest = await isbnRequestRepository.assignPublisher(
        parseInt(requestId),
        publisherId
      );

      if (!updatedRequest) {
        throw new ErrorHandler(404, "ISBN request not found");
      }

      logger.info("Publisher assigned to ISBN request", {
        requestId,
        publisherId,
        assignedBy: req.user.id,
      });

      res.json({
        success: true,
        data: updatedRequest.getDetailedInfo(),
        message: "Publisher assigned successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async completeRequest(req, res, next) {
    try {
      const { requestId } = req.params;
      const { isbnCertificateId } = req.body;
      const userId = req.user.id;
      const userRole = req.user.role;

      if (!["ADMIN", "PUBLISHER"].includes(userRole)) {
        throw new ErrorHandler(
          403,
          "Insufficient permissions to complete ISBN requests"
        );
      }

      const updatedRequest = await isbnRequestRepository.completeRequest(
        parseInt(requestId),
        isbnCertificateId
      );

      if (!updatedRequest) {
        throw new ErrorHandler(404, "ISBN request not found");
      }

      logger.info("ISBN request completed", {
        requestId,
        isbnCertificateId,
        completedBy: userId,
      });

      res.json({
        success: true,
        data: updatedRequest.getDetailedInfo(),
        message: "ISBN request completed successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new IsbnRequestController();
