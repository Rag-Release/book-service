import {
  Resolver,
  Query,
  Mutation,
  Arg,
  Field,
  InputType,
  ObjectType,
} from "type-graphql";
import { PaymentService } from "../services/PaymentService";
import { Payment, PaymentMethod, PaymentStatus } from "../entities/Payment";

@InputType()
class CreatePaymentInput {
  @Field()
  amount: number;

  @Field()
  currency: string;

  @Field()
  bookId: number;

  @Field({ nullable: false })
  customerId!: string;

  @Field(() => String)
  paymentMethod: PaymentMethod;

  @Field({ nullable: true })
  description?: string;
}

@ObjectType()
class PaymentIntentResponse {
  @Field()
  clientSecret: string;

  @Field(() => Payment)
  payment: Payment;
}

@InputType()
class RefundPaymentInput {
  @Field()
  paymentId: number;

  @Field({ nullable: true })
  reason?: string;
}

@Resolver()
export class PaymentResolver {
  private paymentService = new PaymentService();

  @Query(() => Payment)
  async payment(@Arg("id") id: number): Promise<Payment> {
    return this.paymentService.getPaymentById(id);
  }

  @Query(() => [Payment])
  async paymentsByBook(@Arg("bookId") bookId: number): Promise<Payment[]> {
    return this.paymentService.getPaymentsByBookId(bookId);
  }

  @Mutation(() => PaymentIntentResponse)
  async createPaymentIntent(
    @Arg("input") input: CreatePaymentInput
  ): Promise<PaymentIntentResponse> {
    const result = await this.paymentService.createPaymentIntent({
      amount: input.amount,
      currency: input.currency,
      bookId: input.bookId,
      customerId: input.customerId,
      paymentMethod: input.paymentMethod,
      description: input.description,
    });

    return {
      clientSecret: result.clientSecret,
      payment: result.payment,
    };
  }

  @Mutation(() => Payment)
  async confirmPayment(
    @Arg("paymentIntentId") paymentIntentId: string
  ): Promise<Payment> {
    return this.paymentService.confirmPayment(paymentIntentId);
  }

  @Mutation(() => Payment)
  async refundPayment(
    @Arg("input") input: RefundPaymentInput
  ): Promise<Payment> {
    return this.paymentService.refundPayment(input.paymentId, input.reason);
  }
}
