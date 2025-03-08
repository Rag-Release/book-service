import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { ObjectType, Field, ID, Float, registerEnumType } from "type-graphql";
import { Author } from "./Author";
import { Feedback } from "./Feedback";
import { Payment } from "./Payment";

export enum PublishingStatus {
  DRAFT = "draft",
  SUBMITTED = "submitted",
  UNDER_REVIEW = "under_review",
  APPROVED = "approved",
  PUBLISHED = "published",
  REJECTED = "rejected",
}
registerEnumType(PublishingStatus, {
  name: "PublishingStatus",
});

export enum BookFormat {
  HARDCOVER = "hardcover",
  PAPERBACK = "paperback",
  EBOOK = "ebook",
  AUDIOBOOK = "audiobook",
}

registerEnumType(BookFormat, {
  name: "BookFormat",
});

@ObjectType()
@Entity("books")
export class Book {
  @Field(() => ID)
  @PrimaryGeneratedColumn({ type: "int" })
  id: number;

  @Field()
  @Column()
  title: string;

  @Field()
  @Column({ unique: true })
  isbn: string;

  @Field()
  @Column("text")
  description: string;

  @Field(() => Float)
  @Column({ type: "decimal", precision: 10, scale: 3 })
  price: number;

  @Field(() => PublishingStatus)
  @Column({
    type: "enum",
    enum: PublishingStatus,
    default: PublishingStatus.DRAFT,
  })
  status: PublishingStatus;

  @Field()
  @Column({ nullable: true })
  coverImageUrl: string;

  @Field()
  @Column({ nullable: true })
  manuscriptUrl: string;

  @Field()
  @Column({ nullable: true })
  isbnCertificateUrl: string;

  @Field(() => [BookFormat])
  @Column("simple-array")
  availableFormats: BookFormat[];

  @Field()
  @Column({ type: "int" })
  authorId: number;

  @Field(() => Author)
  @ManyToOne(() => Author, (author) => author.books)
  @JoinColumn({ name: "authorId" })
  author: Author;

  @Field(() => [Feedback], { nullable: true })
  @OneToMany(() => Feedback, (feedback) => feedback.book)
  feedback: Feedback[];

  @Field(() => [Payment], { nullable: true })
  @OneToMany(() => Payment, (payment) => payment.book)
  payments: Payment[];

  @Field()
  @Column({ nullable: true })
  pageCount: number;

  @Field()
  @Column()
  language: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  publishedDate: Date;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt: Date;

  // Calculated field for average rating
  @Field(() => Float, { nullable: true })
  averageRating?: number;
}
