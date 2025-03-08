import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";
import { Book } from "./Book";

@ObjectType()
@Entity("authors")
export class Author {
  @Field(() => ID)
  @PrimaryGeneratedColumn({ type: "int" })
  id: number;

  @Field()
  @Column()
  firstName: string;

  @Field()
  @Column()
  lastName: string;

  @Field()
  @Column({ unique: true })
  email: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  biography: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  profileImageUrl: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  website: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  phone: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  address: string;

  @Field()
  @Column({ default: false })
  isVerified: boolean;

  @Field(() => [Book], { nullable: true })
  @OneToMany(() => Book, (book) => book.author)
  books: Book[];

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt: Date;

  // Helper calculated field
  @Field()
  fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
