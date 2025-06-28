const winston = require("winston");
const path = require("path");

// Try to load config, fallback to defaults if not available
let config;
try {
  config = require("../config/config");
} catch (error) {
  config = {
    nodeEnv: process.env.NODE_ENV || "development",
    logging: {
      level: process.env.LOG_LEVEL || "info",
      format: "json",
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "14d",
    },
  };
}

// Define log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log colors
const logColors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "blue",
};

winston.addColors(logColors);

// Create logs directory if it doesn't exist
const fs = require("fs");
const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Error logs directory
const errorLogsDir = path.join(logsDir, "errors");
if (!fs.existsSync(errorLogsDir)) {
  fs.mkdirSync(errorLogsDir, { recursive: true });
}

// Get current date for daily error files
const getCurrentDateString = () => {
  const now = new Date();
  return now.toISOString().split("T")[0]; // YYYY-MM-DD format
};

// Create winston logger instance
const logger = winston.createLogger({
  level: config.logging?.level || "info",
  levels: logLevels,
  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: "book-service",
  },
  transports: [
    // Combined log file
    new winston.transports.File({
      filename: path.join(logsDir, "combined.log"),
      maxsize: 20 * 1024 * 1024, // 20MB
      maxFiles: 5,
      tailable: true,
    }),

    // Error log file
    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
      maxsize: 20 * 1024 * 1024, // 20MB
      maxFiles: 5,
      tailable: true,
    }),

    // Daily error file (using current date)
    new winston.transports.File({
      filename: path.join(errorLogsDir, `error-${getCurrentDateString()}.log`),
      level: "error",
      maxsize: 20 * 1024 * 1024, // 20MB
    }),
  ],
});

// Add console transport for development
if (config.nodeEnv !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.simple()
      ),
    })
  );
}

// Handle uncaught exceptions and unhandled rejections
logger.exceptions.handle(
  new winston.transports.File({
    filename: path.join(logsDir, "exceptions.log"),
  })
);

logger.rejections.handle(
  new winston.transports.File({
    filename: path.join(logsDir, "rejections.log"),
  })
);

module.exports = logger;
