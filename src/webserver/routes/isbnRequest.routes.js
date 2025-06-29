const express = require("express");
const isbnRequestController = require("../../controllers/isbnRequest.controller");
const { authMiddleware, roleMiddleware } = require("../../middlewares");
const { validateMiddleware } = require("../../middlewares/validate.middleware");
const isbnRequestValidators = require("../../validators/isbnRequest.validator");

const router = express.Router();

// Create ISBN request
router.post(
  "/books/:bookId/isbn-requests",
  authMiddleware,
  roleMiddleware(["AUTHOR", "ADMIN"]),
  validateMiddleware(isbnRequestValidators.createRequest),
  isbnRequestController.createRequest
);

// Get ISBN request by ID
router.get(
  "/isbn-requests/:requestId",
  validateMiddleware(isbnRequestValidators.getRequestById),
  isbnRequestController.getRequestById
);

// Get author's ISBN requests
router.get(
  "/author/isbn-requests",
  authMiddleware,
  roleMiddleware(["AUTHOR", "ADMIN"]),
  validateMiddleware(isbnRequestValidators.getAuthorRequests),
  isbnRequestController.getAuthorRequests
);

// Get pending ISBN requests
router.get(
  "/isbn-requests/pending",
  authMiddleware,
  roleMiddleware(["ADMIN", "PUBLISHER"]),
  validateMiddleware(isbnRequestValidators.getPendingRequests),
  isbnRequestController.getPendingRequests
);

// Assign publisher to request
router.post(
  "/isbn-requests/:requestId/assign",
  authMiddleware,
  roleMiddleware(["ADMIN", "PUBLISHER"]),
  validateMiddleware(isbnRequestValidators.assignPublisher),
  isbnRequestController.assignPublisher
);

// Complete ISBN request
router.post(
  "/isbn-requests/:requestId/complete",
  authMiddleware,
  roleMiddleware(["ADMIN", "PUBLISHER"]),
  validateMiddleware(isbnRequestValidators.completeRequest),
  isbnRequestController.completeRequest
);

module.exports = router;
