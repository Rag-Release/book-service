import { AppDataSource } from "../config/database";
import { Book, PublishingStatus } from "../entities/Book";
import { Author } from "../entities/Author";
import { Feedback } from "../entities/Feedback";
import { ensureValidUuid } from "../utils/uuidValidator";

interface BookFilter {
  title?: string;
  authorId?: number;
  status?: PublishingStatus;
  language?: string;
}

export class BookService {
  private bookRepository = AppDataSource.getRepository(Book);
  private authorRepository = AppDataSource.getRepository(Author);
  private feedbackRepository = AppDataSource.getRepository(Feedback);

  async getBookById(id: number): Promise<Book> {
    const book = await this.bookRepository.findOne({
      where: { id },
      relations: ["author"],
    });

    if (!book) {
      throw new Error(`Book with ID ${id} not found`);
    }

    return book;
  }

  async getBooks(
    filter?: BookFilter,
    skip?: number,
    take?: number
  ): Promise<Book[]> {
    const query = this.bookRepository.createQueryBuilder("book");
    query.leftJoinAndSelect("book.author", "author");

    if (filter) {
      if (filter.title) {
        query.andWhere("LOWER(book.title) LIKE LOWER(:title)", {
          title: `%${filter.title}%`,
        });
      }

      if (filter.authorId) {
        query.andWhere("book.authorId = :authorId", {
          authorId: filter.authorId,
        });
      }

      if (filter.status) {
        query.andWhere("book.status = :status", { status: filter.status });
      }

      if (filter.language) {
        query.andWhere("book.language = :language", {
          language: filter.language,
        });
      }
    }

    query.orderBy("book.createdAt", "DESC");

    if (skip !== undefined) {
      query.skip(skip);
    }

    if (take !== undefined) {
      query.take(take);
    }

    return query.getMany();
  }

  async getBooksByAuthorId(authorId: number): Promise<Book[]> {
    return this.bookRepository.find({
      where: { authorId },
      order: { createdAt: "DESC" },
    });
  }

  async createBook(bookData: Partial<Book>): Promise<Book> {
    // Validate and potentially fix the authorId UUID
    if (!bookData.authorId) {
      throw new Error("authorId is required");
    }
    // const validAuthorId = ensureValidUuid(bookData.authorId);
    // if (!validAuthorId) {
    //   throw new Error(`Invalid UUID format for authorId: ${bookData.authorId}`);
    // }

    // Use the validated UUID
    const author = await this.authorRepository.findOne({
      where: { id: bookData.authorId },
    });

    if (!author) {
      throw new Error(`Author with ID ${bookData.authorId} not found`);
    }

    // Continue with the rest of the method using validAuthorId
    const book = this.bookRepository.create({
      ...bookData,
      authorId: bookData.authorId,
    });

    return this.bookRepository.save(book);
  }
  async updateBook(bookData: Partial<Book>): Promise<Book> {
    const book = await this.getBookById(bookData.id as number);

    // Update book with new data
    Object.assign(book, bookData);
    return this.bookRepository.save(book);
  }

  async deleteBook(id: number): Promise<boolean> {
    const result = await this.bookRepository.delete(id);
    return (
      result.affected !== undefined &&
      result.affected !== null &&
      result.affected > 0
    );
  }

  async uploadManuscript(id: number, manuscriptUrl: string): Promise<Book> {
    const book = await this.getBookById(id);
    book.manuscriptUrl = manuscriptUrl;

    // If status is draft, update to submitted
    if (book.status === PublishingStatus.DRAFT) {
      book.status = PublishingStatus.SUBMITTED;
    }

    return this.bookRepository.save(book);
  }

  async uploadCover(id: number, coverImageUrl: string): Promise<Book> {
    const book = await this.getBookById(id);
    book.coverImageUrl = coverImageUrl;
    return this.bookRepository.save(book);
  }

  async uploadIsbnCertificate(
    id: number,
    isbnCertificateUrl: string
  ): Promise<Book> {
    const book = await this.getBookById(id);
    book.isbnCertificateUrl = isbnCertificateUrl;
    return this.bookRepository.save(book);
  }

  async updatePublishingStatus(
    id: number,
    status: PublishingStatus
  ): Promise<Book> {
    const book = await this.getBookById(id);
    book.status = status;

    // If status is now published, set published date
    if (status === PublishingStatus.PUBLISHED) {
      book.publishedDate = new Date();
    }

    return this.bookRepository.save(book);
  }

  async calculateAverageRating(bookId: number): Promise<number | null> {
    const result = await this.feedbackRepository
      .createQueryBuilder("feedback")
      .select("AVG(feedback.rating)", "averageRating")
      .where("feedback.bookId = :bookId", { bookId })
      .andWhere("feedback.isVerified = :isVerified", { isVerified: true })
      .getRawOne();

    return result.averageRating ? parseFloat(result.averageRating) : null;
  }

  async getBookFeedback(bookId: number): Promise<Feedback[]> {
    return this.feedbackRepository.find({
      where: { bookId, isVerified: true },
      order: { createdAt: "DESC" },
    });
  }
}
