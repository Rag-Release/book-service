// Validator exports for centralized import

const bookValidator = require("./book.validator");
const reviewValidator = require("./review.validator");
const isbnValidator = require("./isbn.validator");
const coverDesignValidators = require("./coverDesign.validator");
const coverDesignRequestValidators = require("./coverDesignRequest.validator");

module.exports = {
  bookValidator,
  reviewValidator,
  isbnValidator,
  coverDesignValidators,
  coverDesignRequestValidators,
};
