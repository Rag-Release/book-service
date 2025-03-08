import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";
import { Book } from "./Book";

import { registerEnumType } from "type-graphql";

export enum PaymentStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
  REFUNDED = "refunded",
}

registerEnumType(PaymentStatus, {
  name: "PaymentStatus",
});
export enum PaymentMethod {
  CREDIT_CARD = "credit_card",
  DEBIT_CARD = "debit_card",
  PAYPAL = "paypal",
  BANK_TRANSFER = "bank_transfer",
}

registerEnumType(PaymentMethod, {
  name: "PaymentMethod",
});

@ObjectType()
@Entity("payments")
export class Payment {
  @Field(() => ID)
  @PrimaryGeneratedColumn({ type: "int" })
  id: number;

  @Field()
  @Column({ type: "decimal", precision: 10, scale: 2 })
  amount: number;

  @Field()
  @Column()
  currency: string;

  @Field(() => PaymentStatus)
  @Column({
    type: "enum",
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Field(() => PaymentMethod)
  @Column({
    type: "enum",
    enum: PaymentMethod,
  })
  paymentMethod: PaymentMethod;

  @Field({ nullable: true })
  @Column({ nullable: true })
  stripePaymentIntentId: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  stripeCustomerId: string;

  @Field()
  @Column({ type: "int" })
  bookId: number;

  @Field(() => Book)
  @ManyToOne(() => Book)
  @JoinColumn({ name: "bookId" })
  book: Book;

  @Field()
  @Column({ nullable: true })
  receiptUrl: string;

  @Field()
  @Column({ nullable: true })
  paymentDescription: string;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt: Date;
}
