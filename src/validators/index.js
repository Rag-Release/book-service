// Validator exports for centralized import

const bookValidator = require("./book.validator");
const reviewValidator = require("./review.validator");
const isbnValidator = require("./isbn.validator");

module.exports = {
  bookValidator,
  reviewValidator,
  isbnValidator,
};
