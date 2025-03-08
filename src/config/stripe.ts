import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY environment variable is required");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-08-16",
  typescript: true,
});

// Verify Stripe connection on startup
export const verifyStripeConnection = async (): Promise<void> => {
  try {
    await stripe.balance.retrieve();
    console.log("Stripe connection verified successfully");
  } catch (error) {
    console.error("Stripe connection failed:", error);
    throw error;
  }
};

// Common Stripe webhook handling
export const handleStripeWebhook = async (
  signature: string,
  payload: Buffer
): Promise<Stripe.Event> => {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error("STRIPE_WEBHOOK_SECRET environment variable is required");
  }

  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );
};
