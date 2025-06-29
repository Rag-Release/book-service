const CoverDesignRequest = require("../../src/models/coverDesignRequest");
const { faker } = require("@faker-js/faker");

describe("CoverDesignRequest Model", () => {
  let testUser, testCoverDesign;

  beforeEach(async () => {
    testUser = await testUtils.createTestUser();
    testCoverDesign = await testUtils.createTestCoverDesign({
      user_id: testUser.id,
    });
  });

  describe("create", () => {
    test("should create a new cover design request with valid data", async () => {
      const requestData = {
        user_id: testUser.id,
        cover_design_id: testCoverDesign.id,
        request_type: "new_design",
        priority: "high",
        budget: 499.99,
        deadline: "2024-12-31",
        additional_notes: "Make it eye-catching",
      };

      const result = await CoverDesignRequest.create(requestData);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.user_id).toBe(testUser.id);
      expect(result.cover_design_id).toBe(testCoverDesign.id);
      expect(result.request_type).toBe(requestData.request_type);
      expect(result.priority).toBe(requestData.priority);
      expect(result.budget).toBe("499.99");
      expect(result.status).toBe("pending");
      expect(result.created_at).toBeDefined();
    });

    test("should create request with minimal required fields", async () => {
      const requestData = {
        user_id: testUser.id,
        cover_design_id: testCoverDesign.id,
        request_type: "revision",
      };

      const result = await CoverDesignRequest.create(requestData);

      expect(result).toBeDefined();
      expect(result.request_type).toBe("revision");
      expect(result.priority).toBe("medium"); // default value
      expect(result.status).toBe("pending"); // default value
    });

    test("should throw error when user_id is missing", async () => {
      const requestData = {
        cover_design_id: testCoverDesign.id,
        request_type: "new_design",
      };

      await expect(CoverDesignRequest.create(requestData)).rejects.toThrow();
    });

    test("should throw error when cover_design_id is missing", async () => {
      const requestData = {
        user_id: testUser.id,
        request_type: "new_design",
      };

      await expect(CoverDesignRequest.create(requestData)).rejects.toThrow();
    });

    test("should throw error when request_type is missing", async () => {
      const requestData = {
        user_id: testUser.id,
        cover_design_id: testCoverDesign.id,
      };

      await expect(CoverDesignRequest.create(requestData)).rejects.toThrow();
    });

    test("should throw error when user does not exist", async () => {
      const requestData = {
        user_id: 99999,
        cover_design_id: testCoverDesign.id,
        request_type: "new_design",
      };

      await expect(CoverDesignRequest.create(requestData)).rejects.toThrow();
    });

    test("should throw error when cover design does not exist", async () => {
      const requestData = {
        user_id: testUser.id,
        cover_design_id: 99999,
        request_type: "new_design",
      };

      await expect(CoverDesignRequest.create(requestData)).rejects.toThrow();
    });
  });

  describe("findById", () => {
    test("should return cover design request when found", async () => {
      const createdRequest = await testUtils.createTestCoverDesignRequest({
        user_id: testUser.id,
        cover_design_id: testCoverDesign.id,
      });

      const result = await CoverDesignRequest.findById(createdRequest.id);

      expect(result).toBeDefined();
      expect(result.id).toBe(createdRequest.id);
      expect(result.user_id).toBe(testUser.id);
    });

    test("should return null when request not found", async () => {
      const result = await CoverDesignRequest.findById(99999);

      expect(result).toBeNull();
    });

    test("should throw error for invalid id format", async () => {
      await expect(CoverDesignRequest.findById("invalid")).rejects.toThrow();
    });
  });

  describe("findAll", () => {
    test("should return empty array when no requests exist", async () => {
      const result = await CoverDesignRequest.findAll();

      expect(result).toEqual([]);
    });

    test("should return all requests", async () => {
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

      const result = await CoverDesignRequest.findAll();

      expect(result).toHaveLength(2);
    });

    test("should return requests with pagination", async () => {
      // Create 5 requests
      for (let i = 1; i <= 5; i++) {
        await testUtils.createTestCoverDesignRequest({
          user_id: testUser.id,
          cover_design_id: testCoverDesign.id,
          request_type: "new_design",
        });
      }

      const result = await CoverDesignRequest.findAll({ limit: 2, offset: 1 });

      expect(result).toHaveLength(2);
    });
  });

  describe("findByUserId", () => {
    test("should return user requests", async () => {
      const user2 = await testUtils.createTestUser({
        email: "user2@example.com",
      });
      const design2 = await testUtils.createTestCoverDesign({
        user_id: user2.id,
      });

      await testUtils.createTestCoverDesignRequest({
        user_id: testUser.id,
        cover_design_id: testCoverDesign.id,
      });
      await testUtils.createTestCoverDesignRequest({
        user_id: user2.id,
        cover_design_id: design2.id,
      });

      const result = await CoverDesignRequest.findByUserId(testUser.id);

      expect(result).toHaveLength(1);
      expect(result[0].user_id).toBe(testUser.id);
    });

    test("should return empty array when user has no requests", async () => {
      const result = await CoverDesignRequest.findByUserId(testUser.id);

      expect(result).toEqual([]);
    });

    test("should throw error for invalid user id", async () => {
      await expect(
        CoverDesignRequest.findByUserId("invalid")
      ).rejects.toThrow();
    });
  });

  describe("findByCoverDesignId", () => {
    test("should return requests for specific cover design", async () => {
      const design2 = await testUtils.createTestCoverDesign({
        user_id: testUser.id,
      });

      await testUtils.createTestCoverDesignRequest({
        user_id: testUser.id,
        cover_design_id: testCoverDesign.id,
        request_type: "new_design",
      });
      await testUtils.createTestCoverDesignRequest({
        user_id: testUser.id,
        cover_design_id: design2.id,
        request_type: "revision",
      });

      const result = await CoverDesignRequest.findByCoverDesignId(
        testCoverDesign.id
      );

      expect(result).toHaveLength(1);
      expect(result[0].cover_design_id).toBe(testCoverDesign.id);
      expect(result[0].request_type).toBe("new_design");
    });

    test("should return empty array when no requests exist for design", async () => {
      const result = await CoverDesignRequest.findByCoverDesignId(
        testCoverDesign.id
      );

      expect(result).toEqual([]);
    });
  });

  describe("update", () => {
    test("should update request successfully", async () => {
      const request = await testUtils.createTestCoverDesignRequest({
        user_id: testUser.id,
        cover_design_id: testCoverDesign.id,
      });

      const updateData = {
        status: "in_progress",
        priority: "high",
        assigned_designer_id: 123,
        estimated_completion_date: "2024-12-15",
      };

      const result = await CoverDesignRequest.update(request.id, updateData);

      expect(result).toBeDefined();
      expect(result.status).toBe("in_progress");
      expect(result.priority).toBe("high");
      expect(result.assigned_designer_id).toBe(123);
      expect(result.updated_at).toBeDefined();
    });

    test("should update only provided fields", async () => {
      const request = await testUtils.createTestCoverDesignRequest({
        user_id: testUser.id,
        cover_design_id: testCoverDesign.id,
        priority: "low",
      });

      const result = await CoverDesignRequest.update(request.id, {
        status: "completed",
      });

      expect(result.status).toBe("completed");
      expect(result.priority).toBe("low"); // unchanged
    });

    test("should return null when request not found", async () => {
      const result = await CoverDesignRequest.update(99999, {
        status: "completed",
      });

      expect(result).toBeNull();
    });

    test("should throw error for invalid id", async () => {
      await expect(
        CoverDesignRequest.update("invalid", { status: "completed" })
      ).rejects.toThrow();
    });
  });

  describe("delete", () => {
    test("should delete request successfully", async () => {
      const request = await testUtils.createTestCoverDesignRequest({
        user_id: testUser.id,
        cover_design_id: testCoverDesign.id,
      });

      const result = await CoverDesignRequest.delete(request.id);

      expect(result).toBe(true);

      // Verify deletion
      const deletedRequest = await CoverDesignRequest.findById(request.id);
      expect(deletedRequest).toBeNull();
    });

    test("should return false when request not found", async () => {
      const result = await CoverDesignRequest.delete(99999);

      expect(result).toBe(false);
    });

    test("should throw error for invalid id", async () => {
      await expect(CoverDesignRequest.delete("invalid")).rejects.toThrow();
    });
  });

  describe("findByStatus", () => {
    test("should return requests with specified status", async () => {
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

      const pendingRequests = await CoverDesignRequest.findByStatus("pending");
      const completedRequests =
        await CoverDesignRequest.findByStatus("completed");

      expect(pendingRequests).toHaveLength(1);
      expect(pendingRequests[0].status).toBe("pending");
      expect(completedRequests).toHaveLength(1);
      expect(completedRequests[0].status).toBe("completed");
    });

    test("should return empty array when no requests match status", async () => {
      const result = await CoverDesignRequest.findByStatus("cancelled");

      expect(result).toEqual([]);
    });
  });

  describe("findByPriority", () => {
    test("should return requests with specified priority", async () => {
      await testUtils.createTestCoverDesignRequest({
        user_id: testUser.id,
        cover_design_id: testCoverDesign.id,
        priority: "high",
      });
      await testUtils.createTestCoverDesignRequest({
        user_id: testUser.id,
        cover_design_id: testCoverDesign.id,
        priority: "low",
      });

      const highPriorityRequests =
        await CoverDesignRequest.findByPriority("high");
      const lowPriorityRequests =
        await CoverDesignRequest.findByPriority("low");

      expect(highPriorityRequests).toHaveLength(1);
      expect(highPriorityRequests[0].priority).toBe("high");
      expect(lowPriorityRequests).toHaveLength(1);
      expect(lowPriorityRequests[0].priority).toBe("low");
    });
  });

  describe("validateRequestData", () => {
    test("should validate required fields", () => {
      const validData = {
        user_id: testUser.id,
        cover_design_id: testCoverDesign.id,
        request_type: "new_design",
      };

      expect(() =>
        CoverDesignRequest.validateRequestData(validData)
      ).not.toThrow();
    });

    test("should throw error for missing user_id", () => {
      const invalidData = {
        cover_design_id: testCoverDesign.id,
        request_type: "new_design",
      };

      expect(() => CoverDesignRequest.validateRequestData(invalidData)).toThrow(
        "user_id is required"
      );
    });

    test("should throw error for missing cover_design_id", () => {
      const invalidData = {
        user_id: testUser.id,
        request_type: "new_design",
      };

      expect(() => CoverDesignRequest.validateRequestData(invalidData)).toThrow(
        "cover_design_id is required"
      );
    });

    test("should throw error for missing request_type", () => {
      const invalidData = {
        user_id: testUser.id,
        cover_design_id: testCoverDesign.id,
      };

      expect(() => CoverDesignRequest.validateRequestData(invalidData)).toThrow(
        "request_type is required"
      );
    });

    test("should throw error for invalid request_type", () => {
      const invalidData = {
        user_id: testUser.id,
        cover_design_id: testCoverDesign.id,
        request_type: "invalid_type",
      };

      expect(() => CoverDesignRequest.validateRequestData(invalidData)).toThrow(
        "Invalid request_type"
      );
    });

    test("should throw error for invalid priority", () => {
      const invalidData = {
        user_id: testUser.id,
        cover_design_id: testCoverDesign.id,
        request_type: "new_design",
        priority: "invalid_priority",
      };

      expect(() => CoverDesignRequest.validateRequestData(invalidData)).toThrow(
        "Invalid priority"
      );
    });

    test("should throw error for invalid status", () => {
      const invalidData = {
        user_id: testUser.id,
        cover_design_id: testCoverDesign.id,
        request_type: "new_design",
        status: "invalid_status",
      };

      expect(() => CoverDesignRequest.validateRequestData(invalidData)).toThrow(
        "Invalid status"
      );
    });

    test("should throw error for negative budget", () => {
      const invalidData = {
        user_id: testUser.id,
        cover_design_id: testCoverDesign.id,
        request_type: "new_design",
        budget: -100,
      };

      expect(() => CoverDesignRequest.validateRequestData(invalidData)).toThrow(
        "Budget must be positive"
      );
    });

    test("should throw error for past deadline", () => {
      const invalidData = {
        user_id: testUser.id,
        cover_design_id: testCoverDesign.id,
        request_type: "new_design",
        deadline: "2020-01-01",
      };

      expect(() => CoverDesignRequest.validateRequestData(invalidData)).toThrow(
        "Deadline cannot be in the past"
      );
    });
  });
});
