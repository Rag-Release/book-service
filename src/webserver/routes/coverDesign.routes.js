const express = require("express");
const multer = require("multer");
const coverDesignController = require("../../controllers/coverDesign.controller");
const { authMiddleware, roleMiddleware } = require("../../middlewares");
const { validateMiddleware } = require("../../middlewares/validate.middleware");
const coverDesignValidators = require("../../validators/coverDesign.validator");

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/tiff",
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only JPEG, PNG, WebP, and TIFF are allowed"
        ),
        false
      );
    }
  },
});

// Upload cover design
router.post(
  "/books/:bookId/covers",
  authMiddleware,
  roleMiddleware(["AUTHOR", "DESIGNER", "ADMIN"]),
  upload.single("cover"),
  validateMiddleware(coverDesignValidators.uploadCoverDesign),
  coverDesignController.uploadCoverDesign
);

// Get all cover designs for a book
router.get(
  "/books/:bookId/covers",
  validateMiddleware(coverDesignValidators.getCoverDesignsByBook),
  coverDesignController.getCoverDesignsByBook
);

// Get active cover design
router.get(
  "/books/:bookId/covers/active",
  validateMiddleware(coverDesignValidators.getActiveCoverDesign),
  coverDesignController.getActiveCoverDesign
);

// Get version history
router.get(
  "/books/:bookId/covers/history",
  authMiddleware,
  roleMiddleware(["AUTHOR", "ADMIN", "PUBLISHER"]),
  validateMiddleware(coverDesignValidators.getCoverDesignVersionHistory),
  coverDesignController.getCoverDesignVersionHistory
);

// Get specific cover design
router.get(
  "/cover-designs/:coverDesignId",
  validateMiddleware(coverDesignValidators.getCoverDesignById),
  coverDesignController.getCoverDesignById
);

// Get designer's cover designs
router.get(
  "/designer/cover-designs",
  authMiddleware,
  roleMiddleware(["DESIGNER", "ADMIN"]),
  validateMiddleware(coverDesignValidators.getDesignerCoverDesigns),
  coverDesignController.getDesignerCoverDesigns
);

// Get uploader's cover designs
router.get(
  "/uploader/cover-designs",
  authMiddleware,
  roleMiddleware(["AUTHOR", "DESIGNER", "ADMIN"]),
  validateMiddleware(coverDesignValidators.getUploaderCoverDesigns),
  coverDesignController.getUploaderCoverDesigns
);

// Update cover design
router.put(
  "/cover-designs/:coverDesignId",
  authMiddleware,
  validateMiddleware(coverDesignValidators.updateCoverDesign),
  coverDesignController.updateCoverDesign
);

// Approve cover design
router.post(
  "/cover-designs/:coverDesignId/approve",
  authMiddleware,
  roleMiddleware(["ADMIN", "PUBLISHER", "EDITOR"]),
  validateMiddleware(coverDesignValidators.approveCoverDesign),
  coverDesignController.approveCoverDesign
);

// Reject cover design
router.post(
  "/cover-designs/:coverDesignId/reject",
  authMiddleware,
  roleMiddleware(["ADMIN", "PUBLISHER", "EDITOR"]),
  validateMiddleware(coverDesignValidators.rejectCoverDesign),
  coverDesignController.rejectCoverDesign
);

// Set active cover design
router.post(
  "/books/:bookId/covers/:coverDesignId/activate",
  authMiddleware,
  roleMiddleware(["AUTHOR", "ADMIN", "PUBLISHER"]),
  validateMiddleware(coverDesignValidators.setActiveCoverDesign),
  coverDesignController.setActiveCoverDesign
);

// Delete cover design
router.delete(
  "/cover-designs/:coverDesignId",
  authMiddleware,
  validateMiddleware(coverDesignValidators.deleteCoverDesign),
  coverDesignController.deleteCoverDesign
);

module.exports = router;
