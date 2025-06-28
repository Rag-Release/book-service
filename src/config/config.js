require("dotenv").config();

const config = {
  // Server configuration
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || "development",

  // Database configuration
  database: {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || "bookservice_db",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "password",
    dialect: "postgres",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
  },

  // Logging configuration
  logging: {
    level:
      process.env.LOG_LEVEL ||
      (process.env.NODE_ENV === "production" ? "info" : "debug"),
    format: process.env.LOG_FORMAT || "json",
    datePattern: "YYYY-MM-DD",
    maxSize: "20m",
    maxFiles: "14d",
  },

  // JWT configuration
  jwtSecret: process.env.JWT_SECRET || "your-super-secret-jwt-key",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "24h",

  // AWS S3 configuration
  aws: {
    region: process.env.AWS_REGION || "us-east-1",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    s3: {
      bucketName: process.env.S3_BUCKET_NAME || "book-service-files",
      bucketCovers: process.env.S3_BUCKET_COVERS || "book-covers",
      bucketCertificates:
        process.env.S3_BUCKET_CERTIFICATES || "book-certificates",
    },
  },

  // Stripe configuration
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  },

  // External services
  authServiceUrl: process.env.AUTH_SERVICE_URL || "http://localhost:3000",

  // File upload limits
  fileUpload: {
    maxSizeCertificate: 10 * 1024 * 1024, // 10MB
    maxSizeCover: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: {
      certificate: ["application/pdf", "image/jpeg", "image/png", "image/tiff"],
      cover: ["image/jpeg", "image/png", "image/webp"],
    },
  },

  // Text processing
  textProcessing: {
    maxContentLength: process.env.MAX_CONTENT_LENGTH || 1000000,
    enableRichText: process.env.ENABLE_RICH_TEXT === "true",
  },

  // Rate limiting
  rateLimiting: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: process.env.NODE_ENV === "production" ? 100 : 1000,
  },
};

module.exports = config;
