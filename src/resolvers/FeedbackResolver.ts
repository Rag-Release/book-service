import {
  Resolver,
  Query,
  Mutation,
  Arg,
  Field,
  InputType,
  ObjectType,
  ID,
  Int,
} from "type-graphql";
import { FeedbackService } from "../services/FeedbackService";
import { Feedback, FeedbackType } from "../entities/Feedback";

@InputType()
class CreateFeedbackInput {
  @Field(() => Int)
  rating: number;

  @Field()
  comment: string;

  @Field()
  reviewerName: string;

  @Field({ nullable: true })
  reviewerEmail?: string;

  @Field()
  bookId: number;

  @Field()
  userId: number;

  @Field()
  content: string;

  @Field(() => FeedbackType)
  type: FeedbackType;
}

@InputType()
class UpdateFeedbackInput {
  @Field(() => ID)
  id: number;

  @Field(() => Int, { nullable: true })
  rating?: number;

  @Field({ nullable: true })
  comment?: string;

  @Field({ nullable: true })
  isVerified?: boolean;

  @Field({ nullable: true })
  content?: string;

  @Field(() => FeedbackType, { nullable: true })
  type?: FeedbackType;
}

@Resolver(() => Feedback)
export class FeedbackResolver {
  private feedbackService = new FeedbackService();

  @Query(() => Feedback)
  async feedback(@Arg("id") id: number): Promise<Feedback> {
    return this.feedbackService.getFeedbackById(id);
  }

  @Query(() => [Feedback])
  async feedbacksByBook(@Arg("bookId") bookId: number): Promise<Feedback[]> {
    return this.feedbackService.getFeedbackByBookId(bookId);
  }

  @Query(() => [Feedback])
  async allFeedback(
    @Arg("skip", { nullable: true }) skip?: number,
    @Arg("take", { nullable: true }) take?: number
  ): Promise<Feedback[]> {
    return this.feedbackService.getAllFeedbacks(skip, take);
  }

  @Mutation(() => Feedback)
  async createFeedback(
    @Arg("input") input: CreateFeedbackInput
  ): Promise<Feedback> {
    return this.feedbackService.createFeedback({
      bookId: input.bookId,
      userId: input.userId,
      comment: input.comment,
      rating: input.rating,
      type: input.type,
    });
  }

  @Mutation(() => Feedback)
  async updateFeedback(
    @Arg("input") input: UpdateFeedbackInput
  ): Promise<Feedback> {
    return this.feedbackService.updateFeedback(input.id, {
      comment: input.comment,
      rating: input.rating,
      type: input.type,
    });
  }

  @Mutation(() => Boolean)
  async deleteFeedback(@Arg("id") id: number): Promise<boolean> {
    return this.feedbackService.deleteFeedback(id);
  }

  @Mutation(() => Feedback)
  async verifyFeedback(@Arg("id") id: number): Promise<Feedback> {
    return this.feedbackService.verifyFeedback(id);
  }
}
