const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const logger = require('../logger/logger');
const config = require('../config/config');

// Import middlewares
const globalErrorMiddleware = require('../middlewares/globalError.middleware');

// Import routes
const routes = require('./routes');

function createExpressApp() {
  const app = express();

  // Security middleware
  app.use(helmet());
  
  // CORS configuration
  app.use(cors({
    origin: config.nodeEnv === 'production' ? ['https://yourdomain.com'] : true,
    credentials: true
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: config.nodeEnv === 'production' ? 100 : 1000, // limit each IP
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false
  });
  app.use(limiter);

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logging
  app.use((req, res, next) => {
    logger.info('Incoming request', {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    next();
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    const healthCheck = {
      status: 'OK',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      service: 'Book Service',
      version: process.env.npm_package_version || '1.0.0',
      environment: config.nodeEnv,
      memory: process.memoryUsage(),
      pid: process.pid
    };

    logger.info('Health check requested', { status: 'OK', uptime: process.uptime() });
    res.status(200).json(healthCheck);
  });

  // API routes
  app.use('/api', routes);

  // 404 handler
  app.use('*', (req, res) => {
    logger.warn('Route not found', { method: req.method, url: req.originalUrl });
    res.status(404).json({
      success: false,
      message: 'Route not found',
      timestamp: new Date().toISOString()
    });
  });

  // Global error handler
  app.use(globalErrorMiddleware);

  return app;
}

module.exports = createExpressApp;
