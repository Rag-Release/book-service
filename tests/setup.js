const { newDb } = require("pg-mem");

let db;
let pool;

// Set up in-memory database before all tests
beforeAll(async () => {
  // Create in-memory PostgreSQL database
  db = newDb();

  // Enable UUID extension
  db.public.registerFunction({
    name: "uuid_generate_v4",
    returns: "uuid",
    implementation: () => require("crypto").randomUUID(),
  });

  // Create tables
  await db.public.none(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      first_name VARCHAR(100),
      last_name VARCHAR(100),
      role VARCHAR(50) DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cover_designs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      book_genre VARCHAR(100),
      target_audience VARCHAR(100),
      style_preferences TEXT,
      color_preferences VARCHAR(255),
      dimensions VARCHAR(50) DEFAULT '6x9',
      image_url VARCHAR(500),
      status VARCHAR(50) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cover_design_requests (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      cover_design_id INTEGER REFERENCES cover_designs(id) ON DELETE CASCADE,
      request_type VARCHAR(100) NOT NULL,
      priority VARCHAR(20) DEFAULT 'medium',
      budget DECIMAL(10,2),
      deadline DATE,
      additional_notes TEXT,
      status VARCHAR(50) DEFAULT 'pending',
      assigned_designer_id INTEGER,
      estimated_completion_date DATE,
      actual_completion_date DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cover_design_revisions (
      id SERIAL PRIMARY KEY,
      cover_design_request_id INTEGER REFERENCES cover_design_requests(id) ON DELETE CASCADE,
      revision_number INTEGER NOT NULL,
      image_url VARCHAR(500),
      feedback TEXT,
      status VARCHAR(50) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create PostgreSQL adapter
  pool = db.adapters.createPg().Pool;

  // Make pool available globally for tests
  global.testPool = pool;
});

// Clean up after all tests
afterAll(async () => {
  if (pool) {
    await pool.end();
  }
});

// Clean database before each test
beforeEach(async () => {
  if (pool) {
    await pool.query(
      "TRUNCATE TABLE cover_design_revisions RESTART IDENTITY CASCADE"
    );
    await pool.query(
      "TRUNCATE TABLE cover_design_requests RESTART IDENTITY CASCADE"
    );
    await pool.query("TRUNCATE TABLE cover_designs RESTART IDENTITY CASCADE");
    await pool.query("TRUNCATE TABLE users RESTART IDENTITY CASCADE");
  }
});

// Global test utilities
global.testUtils = {
  createTestUser: async (overrides = {}) => {
    const userData = {
      email: "test@example.com",
      password: "hashedpassword123",
      first_name: "John",
      last_name: "Doe",
      role: "user",
      ...overrides,
    };

    const result = await pool.query(
      `INSERT INTO users (email, password, first_name, last_name, role) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        userData.email,
        userData.password,
        userData.first_name,
        userData.last_name,
        userData.role,
      ]
    );

    return result.rows[0];
  },

  createTestCoverDesign: async (overrides = {}) => {
    const designData = {
      user_id: 1,
      title: "Test Book Title",
      description: "A compelling story about testing",
      book_genre: "Fiction",
      target_audience: "Young Adults",
      style_preferences: "Modern, minimalist",
      color_preferences: "Blue, white",
      dimensions: "6x9",
      status: "pending",
      ...overrides,
    };

    const result = await pool.query(
      `INSERT INTO cover_designs (user_id, title, description, book_genre, target_audience, style_preferences, color_preferences, dimensions, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        designData.user_id,
        designData.title,
        designData.description,
        designData.book_genre,
        designData.target_audience,
        designData.style_preferences,
        designData.color_preferences,
        designData.dimensions,
        designData.status,
      ]
    );

    return result.rows[0];
  },

  createTestCoverDesignRequest: async (overrides = {}) => {
    const requestData = {
      user_id: 1,
      cover_design_id: 1,
      request_type: "new_design",
      priority: "medium",
      budget: 299.99,
      deadline: "2024-12-31",
      additional_notes: "Please make it eye-catching",
      status: "pending",
      ...overrides,
    };

    const result = await pool.query(
      `INSERT INTO cover_design_requests (user_id, cover_design_id, request_type, priority, budget, deadline, additional_notes, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        requestData.user_id,
        requestData.cover_design_id,
        requestData.request_type,
        requestData.priority,
        requestData.budget,
        requestData.deadline,
        requestData.additional_notes,
        requestData.status,
      ]
    );

    return result.rows[0];
  },
};

// Set test environment variables
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-jwt-secret";
