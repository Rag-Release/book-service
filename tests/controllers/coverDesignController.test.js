const request = require("supertest");
const app = require("../../src/app");
const jwt = require("jsonwebtoken");

describe("Cover Design Controller", () => {
  let testUser, authToken;

  beforeEach(async () => {
    testUser = await testUtils.createTestUser();
    authToken = jwt.sign({ userId: testUser.id }, process.env.JWT_SECRET);
  });

  describe("POST /api/cover-designs", () => {
    test("should create a new cover design with valid data", async () => {
      const designData = {
        title: "Amazing Book Title",
        description: "A compelling story about adventures",
        book_genre: "Adventure",
        target_audience: "Young Adults",
        style_preferences: "Modern, colorful",
        color_preferences: "Blue, green, white",
        dimensions: "6x9",
      };

      const response = await request(app)
        .post("/api/cover-designs")
        .set("Authorization", `Bearer ${authToken}`)
        .send(designData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Cover design created successfully");
      expect(response.body.data.title).toBe(designData.title);
      expect(response.body.data.user_id).toBe(testUser.id);
      expect(response.body.data.status).toBe("pending");
    });

    test("should return 400 for missing title", async () => {
      const designData = { description: "Missing title" };

      const response = await request(app)
        .post("/api/cover-designs")
        .set("Authorization", `Bearer ${authToken}`)
        .send(designData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("title is required");
    });

    test("should return 401 without authentication", async () => {
      const response = await request(app)
        .post("/api/cover-designs")
        .send({ title: "Test Book" })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/cover-designs", () => {
    test("should return all cover designs for authenticated user", async () => {
      await testUtils.createTestCoverDesign({
        user_id: testUser.id,
        title: "Design 1",
      });
      await testUtils.createTestCoverDesign({
        user_id: testUser.id,
        title: "Design 2",
      });

      const response = await request(app)
        .get("/api/cover-designs")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    test("should return empty array when no designs exist", async () => {
      const response = await request(app)
        .get("/api/cover-designs")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });
  });

  describe("GET /api/cover-designs/:id", () => {
    test("should return specific cover design", async () => {
      const design = await testUtils.createTestCoverDesign({
        user_id: testUser.id,
      });

      const response = await request(app)
        .get(`/api/cover-designs/${design.id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(design.id);
    });

    test("should return 404 for non-existent design", async () => {
      const response = await request(app)
        .get("/api/cover-designs/99999")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe("PUT /api/cover-designs/:id", () => {
    test("should update cover design successfully", async () => {
      const design = await testUtils.createTestCoverDesign({
        user_id: testUser.id,
      });
      const updateData = { title: "Updated Title", status: "completed" };

      const response = await request(app)
        .put(`/api/cover-designs/${design.id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe("Updated Title");
      expect(response.body.data.status).toBe("completed");
    });

    test("should return 404 for non-existent design", async () => {
      const response = await request(app)
        .put("/api/cover-designs/99999")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ title: "Updated" })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe("DELETE /api/cover-designs/:id", () => {
    test("should delete cover design successfully", async () => {
      const design = await testUtils.createTestCoverDesign({
        user_id: testUser.id,
      });

      const response = await request(app)
        .delete(`/api/cover-designs/${design.id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Cover design deleted successfully");
    });

    test("should return 404 for non-existent design", async () => {
      const response = await request(app)
        .delete("/api/cover-designs/99999")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
