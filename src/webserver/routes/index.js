const express = require("express");

// Import route modules
// const bookRoutes = require("./book.routes");
// const reviewRoutes = require("./review.routes");
// const orderRoutes = require("./order.routes");
const isbnRoutes = require("./isbn.routes");

const router = express.Router();

// Mount routes
// router.use("/books", bookRoutes);
// router.use("/reviews", reviewRoutes);
// router.use("/orders", orderRoutes);
router.use("/isbn", isbnRoutes);

// API documentation route
router.get("/", (req, res) => {
  res.json({
    message: "Book Service API",
    version: "1.0.0",
    endpoints: {
      books: "/api/books",
      reviews: "/api/reviews",
      orders: "/api/orders",
      isbn: "/api/isbn",
    },
    documentation: "/api/docs",
  });
});

module.exports = router;
