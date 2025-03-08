import {
  Resolver,
  Query,
  Mutation,
  Arg,
  Field,
  InputType,
  ID,
  FieldResolver,
  Root,
} from "type-graphql";
import { AuthorService } from "../services/AuthorService";
import { Author } from "../entities/Author";
import { Book } from "../entities/Book";

@InputType()
class CreateAuthorInput {
  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  biography?: string;

  @Field({ nullable: true })
  profileImageUrl?: string;

  @Field({ nullable: true })
  website?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  address?: string;
}

@InputType()
class UpdateAuthorInput {
  @Field(() => ID)
  id: number;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  biography?: string;

  @Field({ nullable: true })
  profileImageUrl?: string;

  @Field({ nullable: true })
  website?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  isVerified?: boolean;
}

@Resolver(() => Author)
export class AuthorResolver {
  private authorService = new AuthorService();

  @Query(() => Author)
  async author(@Arg("id") id: number): Promise<Author> {
    return this.authorService.getAuthorById(id);
  }

  @Query(() => [Author])
  async authors(
    @Arg("skip", { nullable: true }) skip?: number,
    @Arg("take", { nullable: true }) take?: number
  ): Promise<Author[]> {
    return this.authorService.getAuthors(skip, take);
  }

  @Query(() => Author, { nullable: true })
  async authorByEmail(@Arg("email") email: string): Promise<Author | null> {
    return this.authorService.getAuthorByEmail(email);
  }

  @Mutation(() => Author)
  async createAuthor(@Arg("input") input: CreateAuthorInput): Promise<Author> {
    return this.authorService.createAuthor(input);
  }

  @Mutation(() => Author)
  async updateAuthor(@Arg("input") input: UpdateAuthorInput): Promise<Author> {
    return this.authorService.updateAuthor(input);
  }

  @Mutation(() => Boolean)
  async deleteAuthor(@Arg("id") id: number): Promise<boolean> {
    return this.authorService.deleteAuthor(id);
  }

  @Mutation(() => Author)
  async verifyAuthor(@Arg("id") id: number): Promise<Author> {
    return this.authorService.verifyAuthor(id);
  }

  @FieldResolver(() => [Book])
  async books(@Root() author: Author): Promise<Book[]> {
    return this.authorService.getAuthorBooks(author.id);
  }
}
