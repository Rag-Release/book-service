import "reflect-metadata";
import dotenv from "dotenv";
import { ApolloServer } from "apollo-server";
import { buildSchema } from "type-graphql";
import { initializeDatabase } from "./config/database";
import { verifyStripeConnection } from "./config/stripe";
import { PaymentResolver } from "./resolvers/PaymentResolver";
import { AuthorResolver } from "./resolvers/AuthorResolver";
import { BookResolver } from "./resolvers/BookResolver";
import { FeedbackResolver } from "./resolvers/FeedbackResolver";

// Load environment variables
dotenv.config();

async function bootstrap() {
  try {
    // Initialize database connection
    await initializeDatabase();

    // Verify Stripe connection
    await verifyStripeConnection();

    // Build TypeGraphQL schema
    const schema = await buildSchema({
      resolvers: [
        PaymentResolver,
        AuthorResolver,
        BookResolver,
        FeedbackResolver,
      ], // Add all resolvers here
      validate: false,
    });

    // Create Apollo Server
    const server = new ApolloServer({
      schema,
      context: ({ req }) => ({ req }),
      introspection: process.env.NODE_ENV !== "production",
    });

    // Start the server
    const { url } = await server.listen(process.env.PORT || 4000);
    console.log(`🚀 Server ready at ${url}`);
    console.log(`📚 Book Service with Payment Gateway Integration`);
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

bootstrap().catch(console.error);
