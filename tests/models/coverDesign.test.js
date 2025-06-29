const CoverDesign = require("../../src/models/coverDesign");
const { faker } = require("@faker-js/faker");

describe("CoverDesign Model", () => {
  let testUser;

  beforeEach(async () => {
    testUser = await testUtils.createTestUser();
  });

  describe("create", () => {
    test("should create a new cover design with valid data", async () => {
      const designData = {
        user_id: testUser.id,
        title: "Test Book Title",
        description: "A test book description",
        book_genre: "Fiction",
        target_audience: "Young Adults",
        style_preferences: "Modern, clean",
        color_preferences: "Blue, white",
        dimensions: "6x9",
      };

      const result = await CoverDesign.create(designData);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.title).toBe(designData.title);
      expect(result.user_id).toBe(testUser.id);
      expect(result.status).toBe("pending");
      expect(result.created_at).toBeDefined();
    });

    test("should create cover design with minimal required fields", async () => {
      const designData = {
        user_id: testUser.id,
        title: "Minimal Test Book",
      };

      const result = await CoverDesign.create(designData);

      expect(result).toBeDefined();
      expect(result.title).toBe(designData.title);
      expect(result.dimensions).toBe("6x9"); // default value
      expect(result.status).toBe("pending"); // default value
    });

    test("should throw error when user_id is missing", async () => {
      const designData = {
        title: "Test Book Title",
      };

      await expect(CoverDesign.create(designData)).rejects.toThrow();
    });

    test("should throw error when title is missing", async () => {
      const designData = {
        user_id: testUser.id,
      };

      await expect(CoverDesign.create(designData)).rejects.toThrow();
    });

    test("should throw error when user_id does not exist", async () => {
      const designData = {
        user_id: 99999,
        title: "Test Book Title",
      };

      await expect(CoverDesign.create(designData)).rejects.toThrow();
    });
  });

  describe("findById", () => {
    test("should return cover design when found", async () => {
      const createdDesign = await testUtils.createTestCoverDesign({
        user_id: testUser.id,
      });

      const result = await CoverDesign.findById(createdDesign.id);

      expect(result).toBeDefined();
      expect(result.id).toBe(createdDesign.id);
      expect(result.title).toBe(createdDesign.title);
    });

    test("should return null when cover design not found", async () => {
      const result = await CoverDesign.findById(99999);

      expect(result).toBeNull();
    });

    test("should throw error for invalid id format", async () => {
      await expect(CoverDesign.findById("invalid")).rejects.toThrow();
    });

    test("should throw error for null id", async () => {
      await expect(CoverDesign.findById(null)).rejects.toThrow();
    });
  });

  describe("findAll", () => {
    test("should return empty array when no cover designs exist", async () => {
      const result = await CoverDesign.findAll();

      expect(result).toEqual([]);
    });

    test("should return all cover designs", async () => {
      await testUtils.createTestCoverDesign({
        user_id: testUser.id,
        title: "Design 1",
      });
      await testUtils.createTestCoverDesign({
        user_id: testUser.id,
        title: "Design 2",
      });

      const result = await CoverDesign.findAll();

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe("Design 1");
      expect(result[1].title).toBe("Design 2");
    });

    test("should return cover designs with pagination", async () => {
      // Create 5 designs
      for (let i = 1; i <= 5; i++) {
        await testUtils.createTestCoverDesign({
          user_id: testUser.id,
          title: `Design ${i}`,
        });
      }

      const result = await CoverDesign.findAll({ limit: 2, offset: 1 });

      expect(result).toHaveLength(2);
    });
  });

  describe("findByUserId", () => {
    test("should return user cover designs", async () => {
      const user2 = await testUtils.createTestUser({
        email: "user2@example.com",
      });

      await testUtils.createTestCoverDesign({
        user_id: testUser.id,
        title: "User 1 Design",
      });
      await testUtils.createTestCoverDesign({
        user_id: user2.id,
        title: "User 2 Design",
      });

      const result = await CoverDesign.findByUserId(testUser.id);

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("User 1 Design");
      expect(result[0].user_id).toBe(testUser.id);
    });

    test("should return empty array when user has no designs", async () => {
      const result = await CoverDesign.findByUserId(testUser.id);

      expect(result).toEqual([]);
    });

    test("should throw error for invalid user id", async () => {
      await expect(CoverDesign.findByUserId("invalid")).rejects.toThrow();
    });
  });

  describe("update", () => {
    test("should update cover design successfully", async () => {
      const design = await testUtils.createTestCoverDesign({
        user_id: testUser.id,
      });
      const updateData = {
        title: "Updated Title",
        description: "Updated description",
        status: "completed",
      };

      const result = await CoverDesign.update(design.id, updateData);

      expect(result).toBeDefined();
      expect(result.title).toBe(updateData.title);
      expect(result.description).toBe(updateData.description);
      expect(result.status).toBe(updateData.status);
      expect(result.updated_at).toBeDefined();
    });

    test("should update only provided fields", async () => {
      const design = await testUtils.createTestCoverDesign({
        user_id: testUser.id,
        title: "Original Title",
        description: "Original description",
      });

      const result = await CoverDesign.update(design.id, {
        title: "New Title",
      });

      expect(result.title).toBe("New Title");
      expect(result.description).toBe("Original description"); // unchanged
    });

    test("should return null when cover design not found", async () => {
      const result = await CoverDesign.update(99999, { title: "Updated" });

      expect(result).toBeNull();
    });

    test("should throw error for invalid id", async () => {
      await expect(
        CoverDesign.update("invalid", { title: "Updated" })
      ).rejects.toThrow();
    });
  });

  describe("delete", () => {
    test("should delete cover design successfully", async () => {
      const design = await testUtils.createTestCoverDesign({
        user_id: testUser.id,
      });

      const result = await CoverDesign.delete(design.id);

      expect(result).toBe(true);

      // Verify deletion
      const deletedDesign = await CoverDesign.findById(design.id);
      expect(deletedDesign).toBeNull();
    });

    test("should return false when cover design not found", async () => {
      const result = await CoverDesign.delete(99999);

      expect(result).toBe(false);
    });

    test("should throw error for invalid id", async () => {
      await expect(CoverDesign.delete("invalid")).rejects.toThrow();
    });
  });

  describe("findByStatus", () => {
    test("should return designs with specified status", async () => {
      await testUtils.createTestCoverDesign({
        user_id: testUser.id,
        status: "pending",
        title: "Pending Design",
      });
      await testUtils.createTestCoverDesign({
        user_id: testUser.id,
        status: "completed",
        title: "Completed Design",
      });

      const pendingDesigns = await CoverDesign.findByStatus("pending");
      const completedDesigns = await CoverDesign.findByStatus("completed");

      expect(pendingDesigns).toHaveLength(1);
      expect(pendingDesigns[0].status).toBe("pending");
      expect(completedDesigns).toHaveLength(1);
      expect(completedDesigns[0].status).toBe("completed");
    });

    test("should return empty array when no designs match status", async () => {
      const result = await CoverDesign.findByStatus("in_progress");

      expect(result).toEqual([]);
    });
  });

  describe("validateDesignData", () => {
    test("should validate required fields", () => {
      const validData = {
        user_id: testUser.id,
        title: "Valid Title",
      };

      expect(() => CoverDesign.validateDesignData(validData)).not.toThrow();
    });

    test("should throw error for missing user_id", () => {
      const invalidData = {
        title: "Valid Title",
      };

      expect(() => CoverDesign.validateDesignData(invalidData)).toThrow(
        "user_id is required"
      );
    });

    test("should throw error for missing title", () => {
      const invalidData = {
        user_id: testUser.id,
      };

      expect(() => CoverDesign.validateDesignData(invalidData)).toThrow(
        "title is required"
      );
    });

    test("should throw error for empty title", () => {
      const invalidData = {
        user_id: testUser.id,
        title: "",
      };

      expect(() => CoverDesign.validateDesignData(invalidData)).toThrow(
        "title cannot be empty"
      );
    });

    test("should throw error for invalid status", () => {
      const invalidData = {
        user_id: testUser.id,
        title: "Valid Title",
        status: "invalid_status",
      };

      expect(() => CoverDesign.validateDesignData(invalidData)).toThrow(
        "Invalid status"
      );
    });
  });
});
