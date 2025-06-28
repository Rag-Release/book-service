// Controller exports for centralized import

const BaseController = require("./base.controller");
const BookController = require("./book.controller");
const ReviewController = require("./review.controller");
const OrderController = require("./order.controller");
const IsbnCertificateController = require("./isbnCertificate.controller");

module.exports = {
  BaseController,
  BookController,
  ReviewController,
  OrderController,
  IsbnCertificateController,
};
