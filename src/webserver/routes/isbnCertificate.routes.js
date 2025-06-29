const express = require("express");
const multer = require("multer");
const isbnCertificateController = require("../../controllers/isbnCertificate.controller");
const { authMiddleware, roleMiddleware } = require("../../middlewares");
const { validateMiddleware } = require("../../middlewares/validate.middleware");
const isbnCertificateValidators = require("../../validators/isbnCertificate.validator");

const router = express.Router();

// Configure multer for certificate uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/tiff",
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error("Invalid file type. Only PDF and image files are allowed"),
        false
      );
    }
  },
});

// Upload ISBN certificate
router.post(
  "/books/:bookId/isbn-certificates",
  authMiddleware,
  roleMiddleware(["AUTHOR", "PUBLISHER", "ADMIN"]),
  upload.single("certificate"),
  validateMiddleware(isbnCertificateValidators.uploadCertificate),
  isbnCertificateController.uploadCertificate
);

// Get certificate by ID
router.get(
  "/isbn-certificates/:certificateId",
  validateMiddleware(isbnCertificateValidators.getCertificateById),
  isbnCertificateController.getCertificateById
);

// Get certificates by book
router.get(
  "/books/:bookId/isbn-certificates",
  validateMiddleware(isbnCertificateValidators.getCertificatesByBook),
  isbnCertificateController.getCertificatesByBook
);

// Get uploader's certificates
router.get(
  "/uploader/isbn-certificates",
  authMiddleware,
  roleMiddleware(["AUTHOR", "PUBLISHER", "ADMIN"]),
  validateMiddleware(isbnCertificateValidators.getUploaderCertificates),
  isbnCertificateController.getUploaderCertificates
);

// Get pending certificates for verification
router.get(
  "/isbn-certificates/pending",
  authMiddleware,
  roleMiddleware(["ADMIN", "PUBLISHER", "EDITOR"]),
  validateMiddleware(isbnCertificateValidators.getPendingCertificates),
  isbnCertificateController.getPendingCertificates
);

// Verify certificate
router.post(
  "/isbn-certificates/:certificateId/verify",
  authMiddleware,
  roleMiddleware(["ADMIN", "PUBLISHER", "EDITOR"]),
  validateMiddleware(isbnCertificateValidators.verifyCertificate),
  isbnCertificateController.verifyCertificate
);

// Approve certificate
router.post(
  "/isbn-certificates/:certificateId/approve",
  authMiddleware,
  roleMiddleware(["ADMIN", "PUBLISHER"]),
  validateMiddleware(isbnCertificateValidators.approveCertificate),
  isbnCertificateController.approveCertificate
);

// Reject certificate
router.post(
  "/isbn-certificates/:certificateId/reject",
  authMiddleware,
  roleMiddleware(["ADMIN", "PUBLISHER", "EDITOR"]),
  validateMiddleware(isbnCertificateValidators.rejectCertificate),
  isbnCertificateController.rejectCertificate
);

// Search certificates
router.get(
  "/isbn-certificates/search",
  validateMiddleware(isbnCertificateValidators.searchCertificates),
  isbnCertificateController.searchCertificates
);

// Get certificate statistics
router.get(
  "/isbn-certificates/stats",
  authMiddleware,
  roleMiddleware(["ADMIN", "PUBLISHER"]),
  isbnCertificateController.getCertificateStats
);

// Update certificate
router.put(
  "/isbn-certificates/:certificateId",
  authMiddleware,
  validateMiddleware(isbnCertificateValidators.updateCertificate),
  isbnCertificateController.updateCertificate
);

// Delete certificate
router.delete(
  "/isbn-certificates/:certificateId",
  authMiddleware,
  validateMiddleware(isbnCertificateValidators.deleteCertificate),
  isbnCertificateController.deleteCertificate
);

module.exports = router;
