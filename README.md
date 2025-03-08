# Book-Service

A comprehensive book management service built with Node.js and TypeScript that handles the complete lifecycle of book publishing, from manuscript upload to sales. This service implements a GraphQL API using TypeGraphQL and integrates with Stripe for payment processing.

## Overview

Book-Service is designed to provide a unified platform for authors, publishers, and readers, streamlining the entire book publishing process. The system follows a domain-driven design approach with clear separation of concerns and GraphQL principles.

## Features

- **Manuscript Management**
  - Upload and version control for book manuscripts
  - Format validation and conversion (supports PDF, DOCX, EPUB)
  - Collaborative editing workflow with revision history
- **Publishing Pipeline**
  - ISBN registration and certificate management
  - Cover image upload with thumbnail generation
  - Metadata management (title, author, description, genre, etc.)
  - Publishing status tracking (draft, review, published)
- **Book Production**
  - Print-on-demand integration
  - Digital format generation (EPUB, MOBI, PDF)
  - Quality assurance workflow
- **Sales & Distribution**
  - Storefront integration with product catalog
  - Secure payment processing via Stripe
  - Digital rights management
  - Download/shipment tracking
- **Reader Engagement**
  - Rating and review system
  - Social sharing capabilities
  - Analytics on reader engagement
  - Personalized recommendations

## Tech Stack

- **Backend Framework**: Node.js with TypeScript for type safety
- **API**: GraphQL with TypeGraphQL for declarative schema definition
- **Database**: PostgreSQL with TypeORM for object-relational mapping
- **Authentication**: JWT-based auth with role-based access control
- **File Storage**: AWS S3 for manuscript and cover storage
- **Payments**: Stripe API integration with webhook handling
- **Caching**: Redis for performance optimization
- **Search**: Elasticsearch for full-text book search
- **Testing**: Jest for unit and integration tests
- **CI/CD**: GitHub Actions for continuous integration and deployment
- **Monitoring**: Prometheus and Grafana for system metrics

## Architecture

The service follows a modular architecture with:

- GraphQL API layer (resolvers and types)
- Service layer for business logic
- Repository layer for data access
- Domain entities representing the business model
- Infrastructure services for external integrations

## Project Structure

```
book-service/
├── src/
│   ├── config/           # Application configuration
│   │   ├── database.ts   # Database connection config
│   │   └── stripe.ts     # Stripe API configuration
│   ├── entities/         # TypeORM entity definitions
│   │   ├── Book.ts       # Book entity
│   │   ├── Author.ts     # Author entity
│   │   └── Payment.ts    # Payment entity
│   ├── resolvers/        # GraphQL resolvers
│   │   ├── BookResolver.ts
│   │   ├── AuthorResolver.ts
│   │   └── PaymentResolver.ts
│   ├── services/         # Business logic services
│   │   ├── BookService.ts
│   │   ├── PaymentService.ts
│   │   └── StorageService.ts
│   ├── types/            # GraphQL schema types
│   │   ├── inputs/       # Input types
│   │   └── objects/      # Object types
│   ├── utils/            # Utility functions
│   │   ├── fileUpload.ts
│   │   └── validation.ts
│   ├── middleware/       # GraphQL/Express middleware
│   ├── migrations/       # Database migrations
│   └── index.ts          # Application entry point
├── tests/                # Test suite
├── .env                  # Environment variables
├── docker-compose.yml    # Docker configuration
└── package.json          # Project dependencies
```

## Setup Instructions

1. **Prerequisites**

   - Node.js (v14+)
   - PostgreSQL
   - Redis (optional, for caching)
   - AWS account (for S3 storage)
   - Stripe account

2. **Installation**

   ```bash
   # Clone the repository
   git clone https://github.com/your-organization/book-service.git
   cd book-service

   # Install dependencies
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file with the following variables:

   ```
   # Application
   PORT=4000
   NODE_ENV=development

   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=bookservice
   DB_USER=postgres
   DB_PASSWORD=yourpassword

   # Stripe
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...

   # AWS
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_S3_BUCKET=book-service-files
   ```

4. **Database Setup**

   ```bash
   # Run migrations
   npm run migration:run
   ```

5. **Start the Service**

   ```bash
   # Development mode
   npm run dev

   # Production build
   npm run build
   npm start
   ```

## API Documentation

The GraphQL API is available at `/graphql` when the server is running. Key operations include:

- **Queries**

  - `books`: List all books with filtering and pagination
  - `book`: Get single book by ID or ISBN
  - `authorBooks`: Get books by author ID

- **Mutations**
  - `createBook`: Create new book entry
  - `updateBook`: Update book details
  - `uploadManuscript`: Upload book manuscript
  - `createPaymentIntent`: Initialize payment process

Access the GraphQL playground at `/graphql` for interactive documentation and query testing.

## Payment Flow

1. **Client-side:**

   - User selects book(s) to purchase
   - Client calls `createPaymentIntent` mutation
   - Client uses Stripe Elements to collect payment details
   - Payment confirmation redirects to success page

2. **Server-side:**
   - Payment intent creation with book details
   - Webhook handling for payment events
   - Order fulfillment after successful payment
   - Invoice generation and delivery

## Deployment

The service can be deployed using:

- Docker containers
- AWS ECS/EKS
- Kubernetes
- Heroku

Refer to the deployment guide for environment-specific instructions.

## Performance Considerations

- Database indexing on frequently queried fields
- Response caching for popular books
- Pagination for large result sets
- Optimized file uploads with streaming

## Testing

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- --testPathPattern=book

# Generate coverage report
npm test -- --coverage
```
