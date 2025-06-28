const { Book } = require("../data-access/sequelize/models");
const logger = require("../logger/logger");

/**
 * Repository for Book data operations
 */
class BookRepository {
  /**
   * Find book by ID
   * @param {number} id - Book ID
   * @returns {Promise<Object|null>} Book or null
   */
  async findById(id) {
    try {
      const book = await Book.findByPk(id);
      return book;
    } catch (error) {
      logger.error("Error finding book by ID", {
        error: error.message,
        id,
      });
      throw error;
    }
  }

  /**
   * Create a new book
   * @param {Object} bookData - Book data
   * @returns {Promise<Object>} Created book
   */
  async create(bookData) {
    try {
      const book = await Book.create(bookData);
      return book;
    } catch (error) {
      logger.error("Error creating book", {
        error: error.message,
        data: bookData,
      });
      throw error;
    }
  }

  /**
   * Update book
   * @param {number} id - Book ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<number>} Number of affected rows
   */
  async update(id, updateData) {
    try {
      const [affectedRows] = await Book.update(updateData, {
        where: { id },
      });
      return affectedRows;
    } catch (error) {
      logger.error("Error updating book", {
        error: error.message,
        id,
        updateData,
      });
      throw error;
    }
  }
}

module.exports = BookRepository;
