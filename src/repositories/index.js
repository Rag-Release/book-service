// Repository exports for centralized import

const BookRepository = require("./book.repository");
const ReviewRepository = require("./review.repository");
const PaymentRecordRepository = require("./paymentRecord.repository");
const IsbnCertificateRepository = require("./isbnCertificate.repository");

module.exports = {
  BookRepository,
  ReviewRepository,
  PaymentRecordRepository,
  IsbnCertificateRepository,
};
