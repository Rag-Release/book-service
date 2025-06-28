const BaseController = require("./base.controller");
const { HTTP_STATUS } = require("../const");
const logger = require("../logger/logger");

class BookController extends BaseController {
  constructor(
    createBookUseCase,
    updateBookUseCase,
    listBooksUseCase,
    deleteBookUseCase,
    publishBookUseCase
  ) {
    super();
    this.createBookUseCase = createBookUseCase;
    this.updateBookUseCase = updateBookUseCase;
    this.listBooksUseCase = listBooksUseCase;
    this.deleteBookUseCase = deleteBookUseCase;
    this.publishBookUseCase = publishBookUseCase;
  }

  /**
   * Create a new book with text content
   */
  async createBook(req, res) {
    try {
      const user = this.getUserFromRequest(req);
      const bookData = req.body;

      logger.info("Creating new book", {
        userId: user.id,
        title: bookData.title,
        genre: bookData.genre,
      });

      const book = await this.createBookUseCase.execute(bookData, user);

      return this.handleSuccess(
        res,
        book,
        "Book created successfully",
        HTTP_STATUS.CREATED
      );
    } catch (error) {
      logger.error("Error creating book", {
        error: error.message,
        stack: error.stack,
      });
      return this.handleError(res, error);
    }
  }

  /**
   * Get book by ID
   */
  async getBookById(req, res) {
    try {
      const { id } = req.params;
      const user = this.getUserFromRequest(req);

      logger.info("Fetching book by ID", { bookId: id, userId: user?.id });

      const book = await this.getBookByIdUseCase.execute(id, user);

      return this.handleSuccess(res, book, "Book retrieved successfully");
    } catch (error) {
      logger.error("Error fetching book", {
        error: error.message,
        bookId: req.params.id,
      });
      return this.handleError(res, error);
    }
  }

  /**
   * List books with pagination and filters
   */
  async listBooks(req, res) {
    try {
      const { page = 1, limit = 10, genre, author, status } = req.query;
      const user = this.getUserFromRequest(req);

      const filters = { genre, author, status };
      const pagination = this.paginate(page, limit);

      logger.info("Listing books", { filters, pagination, userId: user?.id });

      const result = await this.listBooksUseCase.execute(
        filters,
        pagination,
        user
      );

      const formattedResponse = this.formatPaginatedResponse(
        result.books,
        result.total,
        page,
        limit
      );

      return this.handleSuccess(
        res,
        formattedResponse,
        "Books retrieved successfully"
      );
    } catch (error) {
      logger.error("Error listing books", { error: error.message });
      return this.handleError(res, error);
    }
  }

  /**
   * Update book content and metadata
   */
  async updateBook(req, res) {
    try {
      const { id } = req.params;
      const user = this.getUserFromRequest(req);
      const updateData = req.body;

      logger.info("Updating book", { bookId: id, userId: user.id });

      const book = await this.updateBookUseCase.execute(id, updateData, user);

      return this.handleSuccess(res, book, "Book updated successfully");
    } catch (error) {
      logger.error("Error updating book", {
        error: error.message,
        bookId: req.params.id,
      });
      return this.handleError(res, error);
    }
  }

  /**
   * Update book content only
   */
  async updateBookContent(req, res) {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const user = this.getUserFromRequest(req);

      logger.info("Updating book content", { bookId: id, userId: user.id });

      const book = await this.updateBookUseCase.execute(id, { content }, user);

      return this.handleSuccess(res, book, "Book content updated successfully");
    } catch (error) {
      logger.error("Error updating book content", {
        error: error.message,
        bookId: req.params.id,
      });
      return this.handleError(res, error);
    }
  }

  /**
   * Get book content only
   */
  async getBookContent(req, res) {
    try {
      const { id } = req.params;
      const user = this.getUserFromRequest(req);

      logger.info("Fetching book content", { bookId: id, userId: user?.id });

      const content = await this.getBookContentUseCase.execute(id, user);

      return this.handleSuccess(
        res,
        { content },
        "Book content retrieved successfully"
      );
    } catch (error) {
      logger.error("Error fetching book content", {
        error: error.message,
        bookId: req.params.id,
      });
      return this.handleError(res, error);
    }
  }

  /**
   * Delete book
   */
  async deleteBook(req, res) {
    try {
      const { id } = req.params;
      const user = this.getUserFromRequest(req);

      logger.info("Deleting book", { bookId: id, userId: user.id });

      await this.deleteBookUseCase.execute(id, user);

      return this.handleSuccess(res, null, "Book deleted successfully");
    } catch (error) {
      logger.error("Error deleting book", {
        error: error.message,
        bookId: req.params.id,
      });
      return this.handleError(res, error);
    }
  }

  /**
   * Publish book
   */
  async publishBook(req, res) {
    try {
      const { id } = req.params;
      const { publishingMethod, releaseDate } = req.body;
      const user = this.getUserFromRequest(req);

      logger.info("Publishing book", {
        bookId: id,
        userId: user.id,
        publishingMethod,
      });

      const book = await this.publishBookUseCase.execute(
        id,
        { publishingMethod, releaseDate },
        user
      );

      return this.handleSuccess(res, book, "Book published successfully");
    } catch (error) {
      logger.error("Error publishing book", {
        error: error.message,
        bookId: req.params.id,
      });
      return this.handleError(res, error);
    }
  }

  /**
   * Get book status
   */
  async getBookStatus(req, res) {
    try {
      const { id } = req.params;
      const user = this.getUserFromRequest(req);

      logger.info("Fetching book status", { bookId: id, userId: user?.id });

      const status = await this.getBookStatusUseCase.execute(id, user);

      return this.handleSuccess(
        res,
        status,
        "Book status retrieved successfully"
      );
    } catch (error) {
      logger.error("Error fetching book status", {
        error: error.message,
        bookId: req.params.id,
      });
      return this.handleError(res, error);
    }
  }
}

module.exports = BookController;
