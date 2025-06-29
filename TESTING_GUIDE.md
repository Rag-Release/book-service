# Complete Testing Guide for Node.js Backend with Express & PostgreSQL

## Table of Contents

1. [Testing Fundamentals](#testing-fundamentals)
2. [Types of Testing](#types-of-testing)
3. [Testing Tools & Setup](#testing-tools--setup)
4. [Writing Your First Test](#writing-your-first-test)
5. [Database Testing](#database-testing)
6. [API Testing](#api-testing)
7. [Test Coverage](#test-coverage)
8. [Best Practices](#best-practices)
9. [Running Tests](#running-tests)

## Testing Fundamentals

### What is Testing?

Testing is the process of verifying that your code works as expected. It helps you:

- **Catch bugs early** before they reach production
- **Ensure code reliability** and maintainability
- **Document expected behavior** of your functions
- **Enable safe refactoring** without breaking existing functionality
- **Build confidence** in your codebase

### Why Test?

```
Without Tests: Code → Deploy → Hope it works → Fix bugs in production
With Tests: Code → Test → Fix issues → Deploy with confidence
```

## Types of Testing

### 1. Unit Tests

- **What**: Test individual functions or components in isolation
- **When**: Test pure functions, utility functions, business logic
- **Example**: Testing a function that calculates book price with discount

```javascript
// Example unit test
function calculateDiscountedPrice(originalPrice, discountPercent) {
  return originalPrice * (1 - discountPercent / 100);
}

test("should calculate discounted price correctly", () => {
  expect(calculateDiscountedPrice(100, 20)).toBe(80);
});
```

### 2. Integration Tests

- **What**: Test how different parts of your application work together
- **When**: Test database operations, API endpoints, service interactions
- **Example**: Testing if creating a cover design saves correctly to database

### 3. End-to-End (E2E) Tests

- **What**: Test complete user workflows from start to finish
- **When**: Test critical user journeys
- **Example**: User creates account → uploads book → requests cover design → receives design

## Testing Tools & Setup

### Primary Tools

1. **Jest**: Testing framework (test runner, assertions, mocking)
2. **Supertest**: HTTP testing library for Express apps
3. **pg-mem**: In-memory PostgreSQL for testing
4. **@faker-js/faker**: Generate fake test data

### Installation

```bash
npm install --save-dev jest supertest @faker-js/faker pg-mem
npm install --save-dev @types/jest @types/supertest  # If using TypeScript
```

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  testEnvironment: "node",
  coverageDirectory: "coverage",
  collectCoverageFrom: ["src/**/*.js", "!src/server.js", "!src/config/**"],
  testMatch: ["**/__tests__/**/*.test.js"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
};
```

## Writing Your First Test

### Basic Test Structure

```javascript
// tests/example.test.js
describe("Calculator Functions", () => {
  // Setup before all tests in this describe block
  beforeAll(() => {
    console.log("Setting up calculator tests");
  });

  // Setup before each test
  beforeEach(() => {
    // Reset any state
  });

  // Cleanup after each test
  afterEach(() => {
    // Clean up
  });

  // Cleanup after all tests
  afterAll(() => {
    // Final cleanup
  });

  test("should add two numbers correctly", () => {
    // Arrange: Set up test data
    const a = 5;
    const b = 3;

    // Act: Execute the function
    const result = add(a, b);

    // Assert: Check the result
    expect(result).toBe(8);
  });

  test("should handle negative numbers", () => {
    expect(add(-5, 3)).toBe(-2);
  });
});
```

### Common Jest Matchers

```javascript
// Equality
expect(value).toBe(4); // Exact equality (===)
expect(value).toEqual({ name: "John" }); // Deep equality

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();

// Numbers
expect(value).toBeGreaterThan(3);
expect(value).toBeCloseTo(3.14159, 2);

// Strings
expect(value).toMatch(/pattern/);
expect(value).toContain("substring");

// Arrays
expect(array).toContain("item");
expect(array).toHaveLength(3);

// Exceptions
expect(() => {
  throw new Error("Wrong!");
}).toThrow("Wrong!");

// Async
await expect(promise).resolves.toBe("success");
await expect(promise).rejects.toThrow("error");
```

## Database Testing

### Strategy 1: In-Memory Database (Recommended)

```javascript
// tests/setup.js
const { newDb } = require("pg-mem");

let db;
let pool;

beforeAll(async () => {
  // Create in-memory database
  db = newDb();

  // Create tables
  await db.public.none(`
    CREATE TABLE IF NOT EXISTS cover_designs (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Get connection pool
  pool = db.adapters.createPg().Pool;
});

afterAll(async () => {
  await pool.end();
});

module.exports = { getPool: () => pool };
```

### Strategy 2: Test Database

```javascript
// Alternative approach using separate test database
const { Pool } = require("pg");

const testPool = new Pool({
  host: process.env.TEST_DB_HOST || "localhost",
  port: process.env.TEST_DB_PORT || 5432,
  database: process.env.TEST_DB_NAME || "test_bookservice",
  user: process.env.TEST_DB_USER || "test_user",
  password: process.env.TEST_DB_PASSWORD || "test_password",
});

beforeEach(async () => {
  // Clean database before each test
  await testPool.query("TRUNCATE TABLE cover_designs RESTART IDENTITY CASCADE");
});
```

## API Testing

### Testing Express Routes

```javascript
// tests/coverDesign.test.js
const request = require("supertest");
const app = require("../src/app");

describe("Cover Design API", () => {
  describe("POST /api/cover-designs", () => {
    test("should create a new cover design", async () => {
      const newDesign = {
        title: "Test Book",
        description: "Test description",
        authorId: 1,
      };

      const response = await request(app)
        .post("/api/cover-designs")
        .send(newDesign)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(newDesign.title);
    });

    test("should return 400 for invalid data", async () => {
      const invalidDesign = {
        title: "", // Empty title should be invalid
      };

      const response = await request(app)
        .post("/api/cover-designs")
        .send(invalidDesign)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("validation");
    });
  });

  describe("GET /api/cover-designs", () => {
    test("should return all cover designs", async () => {
      // First, create some test data
      await createTestCoverDesign({ title: "Design 1" });
      await createTestCoverDesign({ title: "Design 2" });

      const response = await request(app).get("/api/cover-designs").expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });
  });
});
```

### Testing with Authentication

```javascript
describe("Protected Routes", () => {
  let authToken;

  beforeEach(async () => {
    // Create test user and get token
    const user = await createTestUser();
    authToken = generateToken(user.id);
  });

  test("should require authentication", async () => {
    await request(app)
      .post("/api/cover-designs")
      .send({ title: "Test" })
      .expect(401);
  });

  test("should work with valid token", async () => {
    await request(app)
      .post("/api/cover-designs")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ title: "Test" })
      .expect(201);
  });
});
```

## Test Coverage

### What is Test Coverage?

Test coverage measures how much of your code is executed during tests:

- **Line Coverage**: Percentage of code lines executed
- **Function Coverage**: Percentage of functions called
- **Branch Coverage**: Percentage of code branches taken
- **Statement Coverage**: Percentage of statements executed

### Achieving 100% Coverage

```javascript
// Example function to test
function processPayment(amount, paymentMethod) {
  // Line 1: Input validation
  if (amount <= 0) {
    throw new Error("Amount must be positive");
  }

  // Line 2: Payment method check
  if (!["card", "paypal"].includes(paymentMethod)) {
    throw new Error("Invalid payment method");
  }

  // Line 3: Processing logic
  if (paymentMethod === "card") {
    return processCardPayment(amount);
  } else {
    return processPayPalPayment(amount);
  }
}

// Tests for 100% coverage
describe("processPayment", () => {
  test("should throw error for negative amount", () => {
    expect(() => processPayment(-10, "card")).toThrow(
      "Amount must be positive"
    );
  });

  test("should throw error for invalid payment method", () => {
    expect(() => processPayment(100, "bitcoin")).toThrow(
      "Invalid payment method"
    );
  });

  test("should process card payment", () => {
    // Mock the card payment function
    jest.spyOn(paymentService, "processCardPayment").mockReturnValue("success");
    expect(processPayment(100, "card")).toBe("success");
  });

  test("should process PayPal payment", () => {
    jest
      .spyOn(paymentService, "processPayPalPayment")
      .mockReturnValue("success");
    expect(processPayment(100, "paypal")).toBe("success");
  });
});
```

### Running Coverage Reports

```bash
# Run tests with coverage
npm run test:coverage

# Generate HTML coverage report
npm run test:coverage -- --coverage --coverageReporters=html

# View coverage report
open coverage/lcov-report/index.html
```

## Best Practices

### 1. Test Naming

```javascript
// ❌ Bad
test("user test", () => {});

// ✅ Good
test("should create user with valid data", () => {});
test("should return 400 when email is missing", () => {});
```

### 2. Test Organization

```javascript
describe("UserService", () => {
  describe("createUser", () => {
    test("should create user with valid data", () => {});
    test("should hash password before saving", () => {});
    test("should throw error if email exists", () => {});
  });

  describe("getUserById", () => {
    test("should return user when found", () => {});
    test("should return null when not found", () => {});
  });
});
```

### 3. AAA Pattern (Arrange, Act, Assert)

```javascript
test("should calculate total price with tax", () => {
  // Arrange
  const price = 100;
  const taxRate = 0.1;

  // Act
  const total = calculateTotalWithTax(price, taxRate);

  // Assert
  expect(total).toBe(110);
});
```

### 4. Test Data Management

```javascript
// Create helper functions for test data
function createTestCoverDesign(overrides = {}) {
  return {
    title: "Test Book Title",
    description: "Test description",
    authorId: 1,
    dimensions: "6x9",
    ...overrides,
  };
}

// Use in tests
test("should create cover design", async () => {
  const designData = createTestCoverDesign({ title: "Specific Title" });
  // ... rest of test
});
```

### 5. Mocking External Dependencies

```javascript
// Mock external API calls
jest.mock("../services/paymentService", () => ({
  processPayment: jest.fn().mockResolvedValue({ success: true }),
  refundPayment: jest.fn().mockResolvedValue({ refunded: true }),
}));

// Mock database operations
jest.mock("../models/User", () => ({
  findById: jest.fn(),
  create: jest.fn(),
}));
```

## Running Tests

### Package.json Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:verbose": "jest --verbose",
    "test:silent": "jest --silent"
  }
}
```

### Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run specific test file
npm test -- coverDesign.test.js

# Run tests matching pattern
npm test -- --testNamePattern="should create"

# Run with coverage
npm run test:coverage

# Run tests for specific coverage threshold
npm test -- --coverage --coverageThreshold='{"global":{"lines":100}}'
```

## Debugging Tests

### Common Issues and Solutions

1. **Tests pass individually but fail together**
   - Problem: Shared state between tests
   - Solution: Proper cleanup in `afterEach`

2. **Database tests are slow**
   - Problem: Using real database
   - Solution: Use in-memory database or better cleanup

3. **Async tests hang**
   - Problem: Promises not properly awaited
   - Solution: Always `await` async operations

4. **Mock functions not working**
   - Problem: Mocks not properly reset
   - Solution: Use `jest.clearAllMocks()` in `beforeEach`

### Debug Test

```javascript
test("debug example", async () => {
  console.log("Debug info:", testData);

  const result = await functionUnderTest(testData);

  // Use debugger in Node.js
  debugger;

  expect(result).toBeDefined();
});
```

## Conclusion

Testing is essential for building reliable applications. Start with:

1. **Unit tests** for business logic
2. **Integration tests** for database operations
3. **API tests** for endpoints
4. **Gradually increase coverage** to 100%

Remember: **Good tests are your safety net that allows you to code with confidence!**
