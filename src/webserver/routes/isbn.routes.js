const express = require("express");
const multer = require("multer");
const IsbnCertificateController = require("../../controllers/isbnCertificate.controller");
const {
  authMiddleware,
  roleMiddleware,
  validateMiddleware,
} = require("../../middlewares");
const isbnValidator = require("../../validators/isbn.validator");

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    // Allow only PDF and image files
    const allowedMimeTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/tiff",
      "image/tif",
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error("Invalid file type. Only PDF and image files are allowed."),
        false
      );
    }
  },
});

// Initialize controller
const isbnCertificateController = new IsbnCertificateController();

// Public routes (no authentication required)
// None for ISBN certificates

// Protected routes (authentication required)
router.use(authMiddleware);

/**
 * @route POST /api/isbn/upload
 * @description Upload ISBN certificate for a book
 * @access Author, Admin, Publisher
 */
router.post(
  "/upload",
  upload.single("certificate"),
  validateMiddleware(isbnValidator.uploadCertificate),
  isbnCertificateController.uploadCertificate
);

/**
 * @route GET /api/isbn/:id
 * @description Get certificate by ID
 * @access Owner, Admin, Publisher
 */
router.get(
  "/:id",
  validateMiddleware(isbnValidator.getCertificateById),
  isbnCertificateController.getCertificateById
);

/**
 * @route GET /api/isbn/book/:bookId
 * @description Get certificate by book ID
 * @access Owner, Admin, Publisher
 */
router.get(
  "/book/:bookId",
  validateMiddleware(isbnValidator.getCertificateByBookId),
  isbnCertificateController.getCertificateByBookId
);

/**
 * @route GET /api/isbn/my-certificates
 * @description Get current user's certificates
 * @access Author, Admin, Publisher
 */
router.get("/my-certificates", isbnCertificateController.getUserCertificates);

/**
 * @route PUT /api/isbn/:id/resubmit
 * @description Resubmit rejected certificate
 * @access Owner, Admin
 */
router.put(
  "/:id/resubmit",
  upload.single("certificate"),
  validateMiddleware(isbnValidator.resubmitCertificate),
  isbnCertificateController.resubmitCertificate
);

/**
 * @route GET /api/isbn/:id/download
 * @description Generate download URL for certificate
 * @access Owner, Admin, Publisher (for verified certificates)
 */
router.get(
  "/:id/download",
  validateMiddleware(isbnValidator.downloadCertificate),
  isbnCertificateController.downloadCertificate
);

/**
 * @route GET /api/isbn/:id/audit-logs
 * @description Get audit logs for certificate
 * @access Owner, Admin
 */
router.get(
  "/:id/audit-logs",
  validateMiddleware(isbnValidator.getCertificateAuditLogs),
  isbnCertificateController.getCertificateAuditLogs
);

// Admin and Publisher only routes
router.use(roleMiddleware(["ADMIN", "PUBLISHER"]));

/**
 * @route POST /api/isbn/:id/verify
 * @description Verify ISBN certificate
 * @access Admin, Publisher
 */
router.post(
  "/:id/verify",
  validateMiddleware(isbnValidator.verifyCertificate),
  isbnCertificateController.verifyCertificate
);

/**
 * @route POST /api/isbn/:id/reject
 * @description Reject ISBN certificate
 * @access Admin, Publisher
 */
router.post(
  "/:id/reject",
  validateMiddleware(isbnValidator.rejectCertificate),
  isbnCertificateController.rejectCertificate
);

/**
 * @route GET /api/isbn/admin/pending
 * @description Get pending certificates for verification
 * @access Admin, Publisher
 */
router.get("/admin/pending", isbnCertificateController.getPendingCertificates);

/**
 * @route GET /api/isbn/admin/search
 * @description Search certificates with filters
 * @access Admin, Publisher
 */
router.get(
  "/admin/search",
  validateMiddleware(isbnValidator.searchCertificates),
  isbnCertificateController.searchCertificates
);

/**
 * @route GET /api/isbn/admin/statistics
 * @description Get certificate statistics
 * @access Admin, Publisher
 */
router.get(
  "/admin/statistics",
  isbnCertificateController.getCertificateStatistics
);

/**
 * @route POST /api/isbn/admin/bulk-verify
 * @description Bulk verify certificates
 * @access Admin, Publisher
 */
router.post(
  "/admin/bulk-verify",
  validateMiddleware(isbnValidator.bulkVerifyCertificates),
  isbnCertificateController.bulkVerifyCertificates
);

module.exports = router;
