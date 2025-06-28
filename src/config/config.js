require('dotenv').config();

module.exports = {
  // Server Configuration
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database Configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || 'bookservice_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    dialect: process.env.DB_DIALECT || 'postgres'
  },

  // AWS Configuration
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    s3: {
      bucketCovers: process.env.S3_BUCKET_COVERS || 'book-covers',
      bucketCertificates: process.env.S3_BUCKET_CERTIFICATES || 'book-certificates'
    }
  },

  // Payment Configuration
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
  },

  // Authentication Configuration
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'your-jwt-secret',
    serviceUrl: process.env.AUTH_SERVICE_URL || 'http://localhost:3000'
  },

  // Text Processing Configuration
  textProcessing: {
    maxContentLength: parseInt(process.env.MAX_CONTENT_LENGTH) || 1000000,
    enableRichText: process.env.ENABLE_RICH_TEXT === 'true'
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    fileMaxSize: process.env.LOG_FILE_MAX_SIZE || '20m',
    maxFiles: process.env.LOG_MAX_FILES || '14d'
  }
};
