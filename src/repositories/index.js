// Repository exports for centralized import

const BookRepository = require("./book.repository");
const ReviewRepository = require("./review.repository");
const PaymentRecordRepository = require("./paymentRecord.repository");
const IsbnCertificateRepository = require("./isbnCertificate.repository");
const coverDesignRepository = require("./coverDesign.repository");
const coverDesignRequestRepository = require("./coverDesignRequest.repository");

module.exports = {
  BookRepository,
  ReviewRepository,
  PaymentRecordRepository,
  IsbnCertificateRepository,
  coverDesignRepository,
  coverDesignRequestRepository,
};
