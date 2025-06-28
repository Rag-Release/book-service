# 📚 Book Service - Enterprise Publishing Platform

A comprehensive book management service built with Node.js, Express.js, Sequelize ORM, and modern cloud architecture that handles the complete lifecycle of book publishing, from text-based content entry to sales and distribution. This service provides file upload capabilities for covers and certificates, implements AWS S3 for file storage, and provides a complete publishing workflow solution.

## 🎯 Project Overview

Book Service is designed as a sophisticated microservice that streamlines the entire book publishing process. Built with enterprise-grade architecture patterns using Express.js and Sequelize ORM, it supports authors, publishers, designers, reviewers, and readers through a comprehensive platform that handles text-based book content management, file uploads for covers and certificates, publishing workflows, and e-commerce operations.

### Key Features & Capabilities

- **📝 Text-Based Book Content Management**: Direct text input from frontend with rich formatting and structured storage
- **🔖 ISBN Certificate Upload**: Upload and manage ISBN certificates and related documentation
- **🎨 Cover Design Upload**: Upload cover designs with detailed information and metadata
- **🏭 Multi-Channel Publishing**: Support for both traditional print and digital self-publishing
- **💰 E-commerce Integration**: Secure payment processing via Stripe with comprehensive order management
- **⭐ Reader Engagement Platform**: Review and rating system with purchase verification
- **🔐 Role-Based Access Control**: Author, Reviewer, Designer, Publisher, Reader permissions
- **☁️ AWS S3 Integration**: Scalable file storage for covers, certificates, and digital assets

## 🏗️ Architecture & Technology Stack

### Core Technologies

- **Runtime**: Node.js 16+ with Express.js framework
- **Database**: PostgreSQL with Sequelize ORM for robust data management
- **File Storage**: AWS S3 for covers, certificates, and digital assets
- **Payments**: Stripe integration with webhook processing
- **Authentication**: JWT-based auth with User Auth Service integration
- **Text Processing**: Rich text handling and formatting capabilities
- **Logging**: Winston-based structured logging system

### External Integrations

- **Stripe API**: Secure payment processing and webhook handling
- **AWS S3**: Scalable file storage for covers and certificates
- **User Auth Service**: Centralized authentication and authorization

## 📦 Project Structure

```
book-service/
├── logs/                      # Application logs with date-based error tracking
├── src/
│   ├── config/               # Environment and service configurations
│   │   ├── config.js         # Main application configuration
│   │   └── database.js       # Database connection configuration
│   ├── controllers/          # HTTP request handlers for each domain
│   │   ├── book.controller.js        # Book management operations
│   │   ├── review.controller.js      # Review workflow operations
│   │   ├── order.controller.js       # Purchase and order management
│   │   └── isbn.controller.js        # ISBN certificate management
│   ├── data-access/          # Database abstraction layer
│   │   └── sequelize/        # Sequelize ORM implementation
│   │       ├── migrations/   # Database schema migrations
│   │       ├── models/       # Sequelize models (Book, Review, PaymentRecord)
│   │       └── seeders/      # Database seed data
│   ├── middlewares/          # Express middleware components
│   │   ├── auth.middleware.js        # JWT authentication
│   │   ├── role.middleware.js        # Role-based access control
│   │   └── validate.middleware.js    # Request validation
│   ├── repositories/         # Data access layer
│   │   ├── book.repository.js        # Book data operations
│   │   ├── review.repository.js      # Review data operations
│   │   └── paymentRecord.repository.js # Payment data operations
│   ├── services/             # Business logic services
│   │   ├── payment.service.js        # Stripe payment processing
│   │   ├── storage.service.js        # AWS S3 file management
│   │   └── textProcessing.service.js # Text formatting and processing
│   ├── use-cases/           # Application business rules
│   │   ├── book/            # Book management use cases
│   │   ├── review/          # Review workflow use cases
│   │   └── purchase/        # Purchase and certificate use cases
│   ├── validators/          # Input validation schemas
│   ├── webserver/          # Express application setup
│   │   └── routes/         # API route definitions
│   └── server.js           # Application entry point
├── tests/                  # Comprehensive test suite
└── package.json           # Dependencies and scripts
```

## 🚀 Quick Start

### Prerequisites

- Node.js 16+, PostgreSQL 13+, Redis (optional)
- AWS account with S3 access
- Stripe account for payment processing

### Local Development

```bash
# Setup
git clone <repository-url> && cd book-service
npm install
cp .env.example .env  # Configure environment variables

# Database
# Ensure PostgreSQL is running
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all  # Optional: load sample data

# Development
npm run dev  # Starts server with hot-reload on port 4000
npm test     # Run comprehensive test suite
npm run lint # Code quality checks
```

### Environment Configuration

```bash
# Core Configuration
PORT=4000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bookservice_db
DB_USER=postgres
DB_PASSWORD=yourpassword

# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_COVERS=book-covers
S3_BUCKET_CERTIFICATES=book-certificates

# Payment Processing
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Authentication
JWT_SECRET=your_jwt_secret
AUTH_SERVICE_URL=http://localhost:3000
```

## 📖 API Reference

### Core Endpoints

```bash
# Health Check
GET /api/health

# Book Management (Role-Based Access)
POST /api/books                    # Create book with text content (Author)
GET /api/books                     # List published books (Public)
GET /api/books/{id}                # Get book details
PUT /api/books/{id}                # Update book metadata and content (Author/Admin)
DELETE /api/books/{id}             # Delete book (Author/Admin)

# Content Management
PUT /api/books/{id}/content        # Update book text content
GET /api/books/{id}/content        # Get book text content

# File Upload Management
POST /api/books/{id}/cover         # Upload cover design (Designer/Author)
GET /api/books/{id}/cover          # Get cover image
POST /api/books/{id}/isbn-certificate # Upload ISBN certificate (Author/Admin)
GET /api/books/{id}/isbn-certificate  # Get ISBN certificate

# Publishing Workflow
POST /api/books/{id}/publish       # Publish book (Author/Admin)
GET /api/books/{id}/status         # Check publishing status

# Review & Editorial System
POST /api/books/{id}/assign-reviewer     # Assign reviewer (Admin)
POST /api/books/{id}/reviews/editorial   # Submit editorial review (Reviewer)
POST /api/books/{id}/reviews             # Submit reader review (Reader)
GET /api/books/{id}/reviews              # Get book reviews (Public)

# E-commerce & Orders
POST /api/books/{id}/purchase       # Purchase book (Reader)
GET /api/users/me/purchases         # Get user's library (Reader)
GET /api/books/{id}/download        # Download purchased content (Reader)
```

### Complete Book Creation Workflow Example

```bash
# 1. Author creates book with text content
curl -X POST "http://localhost:4000/api/books" \
  -H "Authorization: Bearer <author_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Amazing Novel",
    "genre": "Fiction",
    "synopsis": "A compelling story about...",
    "content": "Chapter 1: It was a dark and stormy night...",
    "price": 15.99
  }'

# Response: {"bookId": "123", "status": "Draft", "message": "Book created successfully"}

# 2. Upload cover design
curl -X POST "http://localhost:4000/api/books/123/cover" \
  -H "Authorization: Bearer <designer_token>" \
  -F "cover=@book_cover.jpg" \
  -F "description=Professional cover design" \
  -F "designerNotes=Modern minimalist approach"

# 3. Upload ISBN certificate
curl -X POST "http://localhost:4000/api/books/123/isbn-certificate" \
  -H "Authorization: Bearer <author_token>" \
  -F "certificate=@isbn_certificate.pdf" \
  -F "isbn=978-1234567890" \
  -F "issueDate=2025-01-15"

# 4. Admin assigns reviewer
curl -X POST "http://localhost:4000/api/books/123/assign-reviewer" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"reviewerId": 456}'

# 5. Reviewer approves content
curl -X POST "http://localhost:4000/api/books/123/reviews/editorial" \
  -H "Authorization: Bearer <reviewer_token>" \
  -H "Content-Type: application/json" \
  -d '{"decision": "approved", "feedback": "Excellent work!"}'

# 6. Publish book
curl -X POST "http://localhost:4000/api/books/123/publish" \
  -H "Authorization: Bearer <author_token>" \
  -H "Content-Type: application/json" \
  -d '{"publishingMethod": "DIGITAL"}'

# 7. Reader purchases book
curl -X POST "http://localhost:4000/api/books/123/purchase" \
  -H "Authorization: Bearer <reader_token>" \
  -H "Content-Type: application/json" \
  -d '{"format": "digital", "paymentMethod": "stripe"}'
```

## 🔒 Security & Compliance

### Security Features

- **Authentication**: JWT-based auth with User Auth Service integration
- **Authorization**: Role-based access control (Author, Reviewer, Designer, Publisher, Reader)
- **File Security**: AWS S3 private buckets with pre-signed URLs for secure access
- **Payment Security**: PCI DSS compliance via Stripe integration
- **Content Protection**: Text content encryption and secure storage
- **Input Validation**: Comprehensive sanitization and validation middleware

### Role-Based Permissions

- **Author**: Create books, input text content, upload certificates, publish own books
- **Reviewer**: Access assigned content, submit editorial reviews
- **Designer**: Upload cover designs for assigned books
- **Publisher/Admin**: Assign reviewers, moderate content, approve publications
- **Reader**: Purchase books, submit reviews (purchase-verified), access owned content

## 📊 Monitoring & Performance

### Comprehensive Logging System

- **Error Logs**: Date-based error tracking in `logs/errors/`
- **Combined Logs**: All application events in `logs/combined.log`
- **Content Operations**: Text processing and file upload tracking
- **Performance Metrics**: API response times and database query performance

### Key Metrics Tracked

- **Content Operations**: Text submissions, cover uploads, certificate uploads
- **Payment Metrics**: Successful payments, failed transactions, refund rates
- **User Engagement**: Review submissions, rating distributions, purchase patterns
- **File Operations**: S3 upload/download metrics, storage usage
- **API Performance**: Response times, error rates, throughput

### Performance Characteristics

- **Response Time**: <200ms for text operations, <500ms for file uploads
- **File Upload**: Supports covers and certificates up to 10MB with progress tracking
- **Text Processing**: Rich text formatting with instant preview
- **Concurrent Users**: Designed to handle 1000+ concurrent operations

## 🚀 Deployment

### Production Deployment

```bash
# Build for production
npm run build

# Database migrations
NODE_ENV=production npx sequelize-cli db:migrate

# Start production server
NODE_ENV=production npm start
```

### Docker Deployment

```dockerfile
# Example Dockerfile
FROM node:16-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN mkdir -p logs
EXPOSE 4000
CMD ["npm", "start"]
```

### Infrastructure Requirements

- **Database**: PostgreSQL with connection pooling
- **File Storage**: AWS S3 buckets for covers and certificates
- **Payment Processing**: Stripe account with webhook endpoints
- **Text Processing**: Rich text formatting capabilities
- **Logging**: Log aggregation service for production monitoring

## 🛠️ Development & Contributing

### Development Workflow

```bash
npm run dev         # Development server with hot-reload
npm run test        # Full test suite including integration tests
npm run test:unit   # Unit tests only
npm run lint        # ESLint code quality checks
npm run migrate     # Run database migrations
npm run seed        # Populate database with sample data
```

### Adding New Features

#### Example: Adding Text Formatting Feature

1. **Create Use Case** (`src/use-cases/book/`)

```javascript
// format-text.use-case.js
class FormatTextUseCase {
  constructor(textProcessingService, bookRepository) {
    this.textProcessingService = textProcessingService;
    this.bookRepository = bookRepository;
  }

  async execute(bookId, content, formatting) {
    const formattedContent = await this.textProcessingService.format(
      content,
      formatting
    );
    return this.bookRepository.updateContent(bookId, formattedContent);
  }
}
```

2. **Add Controller Method** (`src/controllers/book.controller.js`)

```javascript
async formatContent(req, res) {
  try {
    const result = await this.formatTextUseCase.execute(
      req.params.id,
      req.body.content,
      req.body.formatting
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
```

3. **Add Route** (`src/webserver/routes/book.routes.js`)

```javascript
router.put(
  "/:id/format-content",
  authMiddleware,
  roleMiddleware(["author", "admin"]),
  bookController.formatContent
);
```

### Code Quality Standards

- **Architecture**: Follow established patterns (Use Cases, Repositories, Services)
- **Testing**: >90% code coverage with unit, integration, and E2E tests
- **Security**: Always implement proper authentication and authorization
- **Documentation**: Update API docs and inline comments
- **Performance**: Monitor text processing and file operations

## 📈 Future Enhancements

### Planned Features

- **Rich Text Editor**: Advanced WYSIWYG editor for content creation
- **Version Control**: Track changes in text content with diff visualization
- **Collaborative Editing**: Real-time collaborative text editing
- **Export Formats**: Multiple export formats (PDF, EPUB, MOBI)
- **Advanced Search**: Full-text search across book content
- **Content Analytics**: Reading patterns and engagement metrics

### Architecture Evolution

- **Content Microservice**: Separate service for text processing and formatting
- **File Processing Service**: Dedicated service for cover and certificate handling
- **Real-time Service**: WebSocket-based real-time collaboration
- **Search Service**: Elasticsearch integration for content search

## 📞 Support & Documentation

- **Comprehensive Guide**: See [UserGuide.md](./UserGuide.md) for detailed technical documentation
- **API Documentation**: Detailed endpoint documentation with examples
- **Issue Tracking**: GitHub Issues for bug reports and feature requests
- **Development Setup**: Step-by-step setup instructions in this README

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## **Enterprise Publishing Platform** | Built with ❤️ using Node.js, Express.js, Sequelize, and AWS

**Enterprise Publishing Platform** | Built with ❤️ using Node.js, Express.js, Sequelize, and AWS
// src/use-cases/sign-in.use-case.js
class SignInUseCase {
// Implementation as shown above
}

````

3. **Add Repository Method** (if needed)

```javascript
// src/interfaces/repositories/user.repository.js
class UserRepository {
  async findByCredentials(email, password) {
    // Implementation
  }
}
````

4. **Add Controller Method**

```javascript
// src/interfaces/controllers/user.controller.js
class UserController {
  async signIn(req, res) {
    // Implementation as shown above
  }
}
```

5. **Add Route**

```javascript
// src/frameworks/webserver/routes/user.routes.js
router.post("/sign-in", userController.signIn.bind(userController));
```

## API Endpoints

### Authentication

- `POST /api/auth/sign-up` - User registration
- `POST /api/auth/sign-in` - User login
- `POST /api/auth/refresh-token` - Refresh JWT token
- `POST /api/auth/logout` - User logout

### User Management

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/password` - Change password
- `POST /api/users/verify-email` - Verify email address

## Database Migrations

Run migrations:

```bash
npm run migrate
```

Create new migration:

```bash
npx sequelize-cli migration:generate --name migration-name
```

## Environment Variables

```
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=user_auth_db
DB_USER=postgres
DB_PASSWORD=yourpassword
JWT_SECRET=your-jwt-secret
```

## Docker Deployment

Build the image:

```bash
docker build -t user-auth-service .
```

Run the container:

```bash
docker run -p 3000:3000 user-auth-service
```

## Running Tests

```bash
npm run test
```

## Best Practices

1. **Error Handling**

   - Use custom error classes
   - Implement global error middleware
   - Return consistent error responses

2. **Security**

   - Implement rate limiting
   - Use CORS
   - Validate all inputs
   - Implement proper password hashing
   - Use secure session management

3. **Logging**

   - Use structured logging
   - Implement request tracking
   - Log all critical operations

4. **Code Organization**
   - Follow Clean Architecture principles
   - Keep concerns separated
   - Use dependency injection
   - Maintain consistent naming conventions

## Common Tasks

### Adding New Endpoints

1. Create necessary entity methods
2. Implement use case
3. Add repository methods
4. Create controller method
5. Add route
6. Add validation middleware
7. Update documentation

### Database Changes

1. Create migration
2. Update model
3. Update repository
4. Update entity
5. Test changes
6. Update documentation

## Troubleshooting

Common issues and solutions:

1. **Database Connection Issues**

   - Check connection string
   - Verify database credentials
   - Ensure database service is running

2. **Authentication Failures**

   - Verify JWT secret
   - Check token expiration
   - Validate request headers

3. **Migration Issues**
   - Check migration order
   - Verify database permissions
   - Review migration logs

## Contributing

1. Follow the established architecture
2. Write tests for new features
3. Update documentation
4. Follow coding standards
5. Submit detailed pull requests

```dockerfile
# Base image
FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 3000

# Start command
CMD ["npm", "start"]

```

This documentation provides a comprehensive guide for the user authentication microservice. Here are some key points to keep in mind when implementing new features:

1. Follow the Clean Architecture pattern - keep business logic separate from framework code
2. Implement proper validation and error handling
3. Maintain security best practices
4. Keep documentation updated

Would you like me to:

1. Provide more detailed code examples for any specific component?
2. Explain the implementation of a specific feature?
3. Add more details about any particular section?
