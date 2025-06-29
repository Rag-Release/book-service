const request = require("supertest");
const app = require("../../src/app");
const jwt = require("jsonwebtoken");

describe("Cover Design Request Controller", () => {
  let testUser, testCoverDesign, authToken;

  beforeEach(async () => {
    testUser = await testUtils.createTestUser();
    testCoverDesign = await testUtils.createTestCoverDesign({
      user_id: testUser.id,
    });
    authToken = jwt.sign({ userId: testUser.id }, process.env.JWT_SECRET);
  });

  describe("POST /api/cover-design-requests", () => {
    test("should create a new cover design request with valid data", async () => {
      const requestData = {
        cover_design_id: testCoverDesign.id,
        request_type: "new_design",
        priority: "high",
        budget: 299.99,
        deadline: "2024-12-31",
        additional_notes: "Please make it professional",
      };

      const response = await request(app)
        .post("/api/cover-design-requests")
        .set("Authorization", `Bearer ${authToken}`)
        .send(requestData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.cover_design_id).toBe(testCoverDesign.id);
      expect(response.body.data.request_type).toBe("new_design");
      expect(response.body.data.priority).toBe("high");
      expect(response.body.data.status).toBe("pending");
    });

    test("should create request with minimal data", async () => {
      const requestData = {
        cover_design_id: testCoverDesign.id,
        request_type: "revision",
      };

      const response = await request(app)
        .post("/api/cover-design-requests")
        .set("Authorization", `Bearer ${authToken}`)
        .send(requestData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.priority).toBe("medium"); // default
    });

    test("should return 400 for missing cover_design_id", async () => {
      const requestData = { request_type: "new_design" };

      const response = await request(app)
        .post("/api/cover-design-requests")
        .set("Authorization", `Bearer ${authToken}`)
        .send(requestData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("cover_design_id is required");
    });

    test("should return 400 for invalid request_type", async () => {
      const requestData = {
        cover_design_id: testCoverDesign.id,
        request_type: "invalid_type",
      };

      const response = await request(app)
        .post("/api/cover-design-requests")
        .set("Authorization", `Bearer ${authToken}`)
        .send(requestData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test("should return 401 without authentication", async () => {
      const response = await request(app)
        .post("/api/cover-design-requests")
        .send({
          cover_design_id: testCoverDesign.id,
          request_type: "new_design",
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/cover-design-requests", () => {
    test("should return all requests for authenticated user", async () => {
      await testUtils.createTestCoverDesignRequest({
        user_id: testUser.id,
        cover_design_id: testCoverDesign.id,
        request_type: "new_design",
      });
      await testUtils.createTestCoverDesignRequest({
        user_id: testUser.id,
        cover_design_id: testCoverDesign.id,
        request_type: "revision",
      });

      const response = await request(app)
        .get("/api/cover-design-requests")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    test("should filter by status", async () => {
      await testUtils.createTestCoverDesignRequest({
        user_id: testUser.id,
        cover_design_id: testCoverDesign.id,
        status: "pending",
      });
      await testUtils.createTestCoverDesignRequest({
        user_id: testUser.id,
        cover_design_id: testCoverDesign.id,
        status: "completed",
      });

      const response = await request(app)
        .get("/api/cover-design-requests?status=pending")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].status).toBe("pending");
    });
  });

  describe("GET /api/cover-design-requests/:id", () => {
    test("should return specific request", async () => {
      const createdRequest = await testUtils.createTestCoverDesignRequest({
        user_id: testUser.id,
        cover_design_id: testCoverDesign.id,
      });

      const response = await request(app)
        .get(`/api/cover-design-requests/${createdRequest.id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(createdRequest.id);
    });

    test("should return 404 for non-existent request", async () => {
      const response = await request(app)
        .get("/api/cover-design-requests/99999")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe("PUT /api/cover-design-requests/:id", () => {
    test("should update request successfully", async () => {
      const createdRequest = await testUtils.createTestCoverDesignRequest({
        user_id: testUser.id,
        cover_design_id: testCoverDesign.id,
      });

      const updateData = {
        status: "in_progress",
        priority: "high",
        assigned_designer_id: 123,
      };

      const response = await request(app)
        .put(`/api/cover-design-requests/${createdRequest.id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe("in_progress");
      expect(response.body.data.priority).toBe("high");
    });

    test("should return 404 for non-existent request", async () => {
      const response = await request(app)
        .put("/api/cover-design-requests/99999")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ status: "completed" })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe("DELETE /api/cover-design-requests/:id", () => {
    test("should delete request successfully", async () => {
      const createdRequest = await testUtils.createTestCoverDesignRequest({
        user_id: testUser.id,
        cover_design_id: testCoverDesign.id,
      });

      const response = await request(app)
        .delete(`/api/cover-design-requests/${createdRequest.id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe(
        "Cover design request deleted successfully"
      );
    });

    test("should return 404 for non-existent request", async () => {
      const response = await request(app)
        .delete("/api/cover-design-requests/99999")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
