const express = require("express");
const coverDesignRequestController = require("../../controllers/coverDesignRequest.controller");
const { authMiddleware, roleMiddleware } = require("../../middlewares");
const { validateMiddleware } = require("../../middlewares/validate.middleware");
const coverDesignRequestValidators = require("../../validators/coverDesignRequest.validator");

const router = express.Router();

// Create cover design request
router.post(
  "/books/:bookId/cover-requests",
  authMiddleware,
  roleMiddleware(["AUTHOR", "ADMIN", "PUBLISHER"]),
  validateMiddleware(coverDesignRequestValidators.createRequest),
  coverDesignRequestController.createRequest
);

// Get cover design request by ID
router.get(
  "/cover-requests/:requestId",
  validateMiddleware(coverDesignRequestValidators.getRequestById),
  coverDesignRequestController.getRequestById
);

// Get author's cover design requests
router.get(
  "/author/cover-requests",
  authMiddleware,
  roleMiddleware(["AUTHOR", "ADMIN", "PUBLISHER"]),
  validateMiddleware(coverDesignRequestValidators.getAuthorRequests),
  coverDesignRequestController.getAuthorRequests
);

// Get open cover design requests (for designers to browse)
router.get(
  "/cover-requests/open",
  validateMiddleware(coverDesignRequestValidators.getOpenRequests),
  coverDesignRequestController.getOpenRequests
);

// Get designer's assigned requests
router.get(
  "/designer/cover-requests",
  authMiddleware,
  roleMiddleware(["DESIGNER", "ADMIN"]),
  validateMiddleware(coverDesignRequestValidators.getAuthorRequests),
  coverDesignRequestController.getDesignerRequests
);

// Assign designer to request
router.post(
  "/cover-requests/:requestId/assign",
  authMiddleware,
  roleMiddleware(["ADMIN", "PUBLISHER"]),
  validateMiddleware(coverDesignRequestValidators.assignDesigner),
  coverDesignRequestController.assignDesigner
);

// Update cover design request
router.put(
  "/cover-requests/:requestId",
  authMiddleware,
  validateMiddleware(coverDesignRequestValidators.updateRequest),
  coverDesignRequestController.updateRequest
);

module.exports = router;
