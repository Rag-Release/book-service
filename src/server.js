require('dotenv').config();
const createExpressApp = require('./webserver/express-app');
const logger = require('./logger/logger');
const config = require('./config/config');

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception! Shutting down...', {
    message: err.message,
    stack: err.stack
  });
  process.exit(1);
});

// Create Express app
const app = createExpressApp();

// Start server
const server = app.listen(config.port, () => {
  logger.info('Book Service started successfully', {
    port: config.port,
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
    pid: process.pid
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection! Shutting down...', {
    message: err.message,
    stack: err.stack
  });
  server.close(() => {
    process.exit(1);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

module.exports = app;
