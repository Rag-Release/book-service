const express = require('express');
const router = express.Router();

// Import route modules
// const bookRoutes = require('./book.routes');
// const reviewRoutes = require('./review.routes');
// const orderRoutes = require('./order.routes');
// const isbnRoutes = require('./isbn.routes');

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    service: 'Book Service API',
    version: '1.0.0',
    description: 'Enterprise Publishing Platform - Book Management Service',
    endpoints: {
      health: '/api/health',
      books: '/api/books',
      reviews: '/api/reviews',
      orders: '/api/orders',
      isbn: '/api/isbn'
    },
    documentation: '/api/docs',
    timestamp: new Date().toISOString()
  });
});

// Mount route modules
// router.use('/books', bookRoutes);
// router.use('/reviews', reviewRoutes);
// router.use('/orders', orderRoutes);
// router.use('/isbn', isbnRoutes);

module.exports = router;
