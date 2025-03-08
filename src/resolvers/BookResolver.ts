import {
  Resolver,
  Query,
  Mutation,
  Arg,
  Field,
  InputType,
  ID,
  Float,
  FieldResolver,
  Root,
} from "type-graphql";
import { BookService } from "../services/BookService";
import { Book, PublishingStatus, BookFormat } from "../entities/Book";
import { Feedback } from "../entities/Feedback";

@InputType()
class CreateBookInput {
  @Field()
  title: string;

  @Field()
  isbn: string;

  @Field()
  description: string;

  @Field(() => Float)
  price: number;

  @Field()
  authorId: number;

  @Field()
  language: string;

  @Field({ nullable: true })
  pageCount?: number;

  @Field(() => [String])
  availableFormats: BookFormat[];
}

@InputType()
class UpdateBookInput {
  @Field(() => ID)
  id: number;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Float, { nullable: true })
  price?: number;

  @Field({ nullable: true })
  coverImageUrl?: string;

  @Field({ nullable: true })
  manuscriptUrl?: string;

  @Field({ nullable: true })
  isbnCertificateUrl?: string;

  @Field(() => PublishingStatus, { nullable: true })
  status?: PublishingStatus;

  @Field(() => [String], { nullable: true })
  availableFormats?: BookFormat[];

  @Field({ nullable: true })
  pageCount?: number;
}

@InputType()
class BookFilterInput {
  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  authorId?: number;

  @Field(() => PublishingStatus, { nullable: true })
  status?: PublishingStatus;

  @Field({ nullable: true })
  language?: string;
}

@Resolver(() => Book)
export class BookResolver {
  private bookService = new BookService();

  @Query(() => Book)
  async book(@Arg("id") id: number): Promise<Book> {
    return this.bookService.getBookById(id);
  }

  @Query(() => [Book])
  async books(
    @Arg("filter", { nullable: true }) filter?: BookFilterInput,
    @Arg("skip", { nullable: true }) skip?: number,
    @Arg("take", { nullable: true }) take?: number
  ): Promise<Book[]> {
    return this.bookService.getBooks(filter, skip, take);
  }

  @Query(() => [Book])
  async booksByAuthor(@Arg("authorId") authorId: number): Promise<Book[]> {
    return this.bookService.getBooksByAuthorId(authorId);
  }

  @Mutation(() => Book)
  async createBook(@Arg("input") input: CreateBookInput): Promise<Book> {
    return this.bookService.createBook(input);
  }

  @Mutation(() => Book)
  async updateBook(@Arg("input") input: UpdateBookInput): Promise<Book> {
    return this.bookService.updateBook(input);
  }

  @Mutation(() => Boolean)
  async deleteBook(@Arg("id") id: number): Promise<boolean> {
    return this.bookService.deleteBook(id);
  }

  @Mutation(() => Book)
  async uploadManuscript(
    @Arg("id") id: number,
    @Arg("manuscriptUrl") manuscriptUrl: string
  ): Promise<Book> {
    return this.bookService.uploadManuscript(id, manuscriptUrl);
  }

  @Mutation(() => Book)
  async uploadCover(
    @Arg("id") id: number,
    @Arg("coverImageUrl") coverImageUrl: string
  ): Promise<Book> {
    return this.bookService.uploadCover(id, coverImageUrl);
  }

  @Mutation(() => Book)
  async uploadIsbnCertificate(
    @Arg("id") id: number,
    @Arg("isbnCertificateUrl") isbnCertificateUrl: string
  ): Promise<Book> {
    return this.bookService.uploadIsbnCertificate(id, isbnCertificateUrl);
  }

  @Mutation(() => Book)
  async updatePublishingStatus(
    @Arg("id") id: number,
    @Arg("status") status: PublishingStatus
  ): Promise<Book> {
    return this.bookService.updatePublishingStatus(id, status);
  }

  @FieldResolver(() => Float, { nullable: true })
  async averageRating(@Root() book: Book): Promise<number | null> {
    return this.bookService.calculateAverageRating(book.id);
  }

  @FieldResolver(() => [Feedback])
  async feedback(@Root() book: Book): Promise<Feedback[]> {
    return this.bookService.getBookFeedback(book.id);
  }
}
