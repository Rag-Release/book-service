require("dotenv").config();

// Handle uncaught exceptions first
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Add detailed error logging
try {
  console.log("Starting Book Service...");

  // Try to load config first
  console.log("Loading configuration...");
  const config = require("./config/config");
  console.log("Configuration loaded successfully");

  // Try to load logger
  console.log("Loading logger...");
  const logger = require("./logger/logger");
  console.log("Logger loaded successfully");

  // Try to load database
  console.log("Loading database module...");
  const database = require("./database/database");
  console.log("Database module loaded successfully");

  // Try to load express app
  console.log("Loading Express app...");
  const createExpressApp = require("./webserver/express-app");
  console.log("Express app module loaded successfully");

  async function startServer() {
    try {
      console.log("Connecting to database...");
      logger.info("Connecting to database...");

      // Test database connection (but don't fail if it's not available)
      try {
        await database.authenticate();
        logger.info("Database connected successfully");
      } catch (dbError) {
        logger.warn(
          "Database connection failed, continuing without DB:",
          dbError.message
        );
        console.warn(
          "Database connection failed, continuing without DB:",
          dbError.message
        );
      }

      // Create Express app
      console.log("Creating Express application...");
      const app = createExpressApp();
      console.log("Express application created successfully");

      // Start server
      console.log(`Starting server on port ${config.port}...`);
      const server = app.listen(config.port, () => {
        const message = `Book Service started successfully on port ${config.port} in ${config.nodeEnv} mode`;
        console.log(message);
        logger.info(message, {
          port: config.port,
          environment: config.nodeEnv,
          processId: process.pid,
        });
      });

      // Graceful shutdown
      const gracefulShutdown = () => {
        console.log("Received shutdown signal, closing server...");
        logger.info("Received shutdown signal, closing server...");

        server.close(() => {
          console.log("HTTP server closed");
          logger.info("HTTP server closed");

          database
            .close()
            .then(() => {
              console.log("Database connection closed");
              logger.info("Database connection closed");
              process.exit(0);
            })
            .catch((err) => {
              console.error("Error closing database:", err);
              process.exit(1);
            });
        });
      };

      process.on("SIGTERM", gracefulShutdown);
      process.on("SIGINT", gracefulShutdown);
    } catch (error) {
      console.error("Failed to start server:", error);
      if (typeof logger !== "undefined") {
        logger.error("Failed to start server:", error);
      }
      process.exit(1);
    }
  }

  // Start the server
  startServer().catch((error) => {
    console.error("Error in startServer:", error);
    process.exit(1);
  });
} catch (error) {
  console.error("Error during startup:", error);
  console.error("Stack trace:", error.stack);
  process.exit(1);
}
