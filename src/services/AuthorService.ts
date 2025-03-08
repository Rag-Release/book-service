import { AppDataSource } from "../config/database";
import { Author } from "../entities/Author";
import { Book } from "../entities/Book";

export class AuthorService {
  private authorRepository = AppDataSource.getRepository(Author);
  private bookRepository = AppDataSource.getRepository(Book);

  async getAuthorById(id: number): Promise<Author> {
    const author = await this.authorRepository.findOneBy({ id });
    if (!author) {
      throw new Error(`Author with ID ${id} not found`);
    }
    return author;
  }

  async getAuthors(skip?: number, take?: number): Promise<Author[]> {
    const options: any = {
      order: { firstName: "ASC", lastName: "ASC" },
    };

    if (skip !== undefined) {
      options.skip = skip;
    }

    if (take !== undefined) {
      options.take = take;
    }

    return this.authorRepository.find(options);
  }

  async getAuthorByEmail(email: string): Promise<Author | null> {
    return this.authorRepository.findOneBy({ email });
  }

  async createAuthor(authorData: Partial<Author>): Promise<Author> {
    // Check if email is already in use
    const existingAuthor = await this.authorRepository.findOneBy({
      email: authorData.email,
    });

    if (existingAuthor) {
      throw new Error(`Email ${authorData.email} is already in use`);
    }

    const author = this.authorRepository.create(authorData);
    return this.authorRepository.save(author);
  }

  async updateAuthor(authorData: Partial<Author>): Promise<Author> {
    const author = await this.getAuthorById(authorData.id as number);

    // If email is being changed, check for uniqueness
    if (authorData.email && authorData.email !== author.email) {
      const existingAuthor = await this.authorRepository.findOneBy({
        email: authorData.email,
      });

      if (existingAuthor) {
        throw new Error(`Email ${authorData.email} is already in use`);
      }
    }

    // Update author with new data
    Object.assign(author, authorData);
    return this.authorRepository.save(author);
  }

  async deleteAuthor(id: number): Promise<boolean> {
    // Check if author has books
    const books = await this.bookRepository.findBy({ authorId: id });
    if (books.length > 0) {
      throw new Error(`Cannot delete author with existing books`);
    }

    const result = await this.authorRepository.delete(id);
    return (
      result.affected !== undefined &&
      result.affected !== null &&
      result.affected > 0
    );
  }

  async verifyAuthor(id: number): Promise<Author> {
    const author = await this.getAuthorById(id);
    author.isVerified = true;
    return this.authorRepository.save(author);
  }

  async getAuthorBooks(authorId: number): Promise<Book[]> {
    return this.bookRepository.find({
      where: { authorId },
      order: { createdAt: "DESC" },
    });
  }
}
