import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { ObjectType, Field, ID, Int, registerEnumType } from "type-graphql";
import { Book } from "./Book";

export enum FeedbackType {
  REVIEW = "REVIEW",
  SUGGESTION = "SUGGESTION",
  ERROR_REPORT = "ERROR_REPORT",
  GENERAL = "GENERAL",
}

registerEnumType(FeedbackType, {
  name: "FeedbackType",
  description: "The type of feedback provided",
});

@ObjectType()
@Entity("feedback")
export class Feedback {
  @Field(() => ID)
  @PrimaryGeneratedColumn({ type: "int" })
  id: number;

  @Field(() => Int)
  @Column({ type: "int", nullable: true })
  rating?: number;

  @Field()
  @Column({ type: "int" })
  userId: number;

  @Field()
  @Column("text")
  comment: string;

  @Field()
  @Column()
  reviewerName: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  reviewerEmail: string;

  @Field()
  @Column({ type: "int" })
  bookId: number;

  @Field(() => Book)
  @ManyToOne(() => Book, (book) => book.feedback)
  @JoinColumn({ name: "bookId" })
  book: Book;

  @Field({ defaultValue: false })
  @Column({ default: false })
  isVerified: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true })
  verificationDate: Date;

  @Field(() => FeedbackType)
  @Column({
    type: "enum",
    enum: FeedbackType,
    default: FeedbackType.GENERAL,
  })
  type: FeedbackType;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt: Date;
}
