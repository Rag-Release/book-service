import { stripe } from "../config/stripe";
import { AppDataSource } from "../config/database";
import { Payment, PaymentStatus, PaymentMethod } from "../entities/Payment";
import { Book } from "../entities/Book";

interface CreatePaymentIntentParams {
  amount: number;
  currency: string;
  bookId: number;
  customerId?: string;
  paymentMethod: PaymentMethod;
  description?: string;
}

export class PaymentService {
  private paymentRepository = AppDataSource.getRepository(Payment);
  private bookRepository = AppDataSource.getRepository(Book);

  /**
   * Create a payment intent with Stripe and save payment record
   */
  async createPaymentIntent({
    amount,
    currency,
    bookId,
    customerId,
    paymentMethod,
    description,
  }: CreatePaymentIntentParams): Promise<{
    payment: Payment;
    clientSecret: string;
  }> {
    // Validate book exists
    const book = await this.bookRepository.findOneBy({ id: bookId });
    if (!book) {
      throw new Error(`Book with id ${bookId} not found`);
    }

    // Create or use existing customer
    let stripeCustomerId = customerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        description: `Customer for book ${book.title}`,
      });
      stripeCustomerId = customer.id;
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe requires cents
      currency,
      customer: stripeCustomerId,
      description: description || `Payment for book: ${book.title}`,
      metadata: {
        bookId,
        bookTitle: book.title,
      },
    });

    // Create payment record
    const payment = this.paymentRepository.create({
      amount,
      currency,
      bookId,
      stripePaymentIntentId: paymentIntent.id,
      stripeCustomerId,
      status: PaymentStatus.PENDING,
      paymentMethod,
      paymentDescription: description || `Payment for book: ${book.title}`,
    });

    await this.paymentRepository.save(payment);

    return {
      payment,
      clientSecret: paymentIntent.client_secret as string,
    };
  }

  /**
   * Confirm payment success and update payment record
   */
  async confirmPayment(paymentIntentId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOneBy({
      stripePaymentIntentId: paymentIntentId,
    });

    if (!payment) {
      throw new Error(`Payment with intent ID ${paymentIntentId} not found`);
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === "succeeded") {
      payment.status = PaymentStatus.COMPLETED;

      // If receipt URL is available, save it
      const charge = await stripe.charges.retrieve(
        paymentIntent.latest_charge as string
      );
      if (charge.receipt_url) {
        payment.receiptUrl = charge.receipt_url;
      }

      await this.paymentRepository.save(payment);
    } else if (paymentIntent.status === "processing") {
      payment.status = PaymentStatus.PROCESSING;
      await this.paymentRepository.save(payment);
    } else {
      payment.status = PaymentStatus.FAILED;
      await this.paymentRepository.save(payment);
      throw new Error(`Payment failed with status: ${paymentIntent.status}`);
    }

    return payment;
  }
  /**
   * Process refund for a payment
   */
  async refundPayment(paymentId: number, reason?: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOneBy({ id: paymentId });

    if (!payment) {
      throw new Error(`Payment with id ${paymentId} not found`);
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new Error(
        `Cannot refund payment with status ${payment.status}. Only completed payments can be refunded.`
      );
    }

    await stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
      reason:
        (reason as "duplicate" | "fraudulent" | "requested_by_customer") ||
        "requested_by_customer",
    });

    payment.status = PaymentStatus.REFUNDED;
    await this.paymentRepository.save(payment);

    return payment;
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(id: number): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ["book"],
    });

    if (!payment) {
      throw new Error(`Payment with id ${id} not found`);
    }

    return payment;
  }

  /**
   * Get payments by book ID
   */
  async getPaymentsByBookId(bookId: number): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { bookId },
      order: { createdAt: "DESC" },
    });
  }
}
