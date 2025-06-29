const CoverDesignService = require("../../src/services/coverDesignService");
const CoverDesign = require("../../src/models/coverDesign");

// Mock the model
jest.mock("../../src/models/coverDesign");

describe("CoverDesignService", () => {
  let testUser;

  beforeEach(async () => {
    testUser = await testUtils.createTestUser();
    jest.clearAllMocks();
  });

  describe("createCoverDesign", () => {
    test("should create cover design successfully", async () => {
      const designData = {
        title: "Test Book",
        description: "Test description",
        book_genre: "Fiction",
      };

      const mockCreatedDesign = { id: 1, ...designData, user_id: testUser.id };
      CoverDesign.create.mockResolvedValue(mockCreatedDesign);

      const result = await CoverDesignService.createCoverDesign(
        testUser.id,
        designData
      );

      expect(CoverDesign.create).toHaveBeenCalledWith({
        user_id: testUser.id,
        ...designData,
      });
      expect(result).toEqual(mockCreatedDesign);
    });

    test("should throw error for invalid data", async () => {
      CoverDesign.create.mockRejectedValue(new Error("Validation failed"));

      await expect(
        CoverDesignService.createCoverDesign(testUser.id, {})
      ).rejects.toThrow("Validation failed");
    });
  });

  describe("getCoverDesignsByUser", () => {
    test("should return user cover designs", async () => {
      const mockDesigns = [
        { id: 1, title: "Design 1", user_id: testUser.id },
        { id: 2, title: "Design 2", user_id: testUser.id },
      ];
      CoverDesign.findByUserId.mockResolvedValue(mockDesigns);

      const result = await CoverDesignService.getCoverDesignsByUser(
        testUser.id
      );

      expect(CoverDesign.findByUserId).toHaveBeenCalledWith(testUser.id);
      expect(result).toEqual(mockDesigns);
    });

    test("should return empty array when no designs found", async () => {
      CoverDesign.findByUserId.mockResolvedValue([]);

      const result = await CoverDesignService.getCoverDesignsByUser(
        testUser.id
      );

      expect(result).toEqual([]);
    });
  });

  describe("getCoverDesignById", () => {
    test("should return cover design when found", async () => {
      const mockDesign = { id: 1, title: "Test Design", user_id: testUser.id };
      CoverDesign.findById.mockResolvedValue(mockDesign);

      const result = await CoverDesignService.getCoverDesignById(1);

      expect(CoverDesign.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockDesign);
    });

    test("should return null when not found", async () => {
      CoverDesign.findById.mockResolvedValue(null);

      const result = await CoverDesignService.getCoverDesignById(99999);

      expect(result).toBeNull();
    });
  });

  describe("updateCoverDesign", () => {
    test("should update cover design successfully", async () => {
      const updateData = { title: "Updated Title", status: "completed" };
      const mockUpdatedDesign = { id: 1, ...updateData, user_id: testUser.id };
      CoverDesign.update.mockResolvedValue(mockUpdatedDesign);

      const result = await CoverDesignService.updateCoverDesign(1, updateData);

      expect(CoverDesign.update).toHaveBeenCalledWith(1, updateData);
      expect(result).toEqual(mockUpdatedDesign);
    });

    test("should return null when design not found", async () => {
      CoverDesign.update.mockResolvedValue(null);

      const result = await CoverDesignService.updateCoverDesign(99999, {
        title: "Updated",
      });

      expect(result).toBeNull();
    });
  });

  describe("deleteCoverDesign", () => {
    test("should delete cover design successfully", async () => {
      CoverDesign.delete.mockResolvedValue(true);

      const result = await CoverDesignService.deleteCoverDesign(1);

      expect(CoverDesign.delete).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    test("should return false when design not found", async () => {
      CoverDesign.delete.mockResolvedValue(false);

      const result = await CoverDesignService.deleteCoverDesign(99999);

      expect(result).toBe(false);
    });
  });

  describe("getCoverDesignsByStatus", () => {
    test("should return designs with specified status", async () => {
      const mockDesigns = [
        { id: 1, title: "Design 1", status: "pending" },
        { id: 2, title: "Design 2", status: "pending" },
      ];
      CoverDesign.findByStatus.mockResolvedValue(mockDesigns);

      const result =
        await CoverDesignService.getCoverDesignsByStatus("pending");

      expect(CoverDesign.findByStatus).toHaveBeenCalledWith("pending");
      expect(result).toEqual(mockDesigns);
    });
  });

  describe("getAllCoverDesigns", () => {
    test("should return all cover designs with options", async () => {
      const mockDesigns = [
        { id: 1, title: "Design 1" },
        { id: 2, title: "Design 2" },
      ];
      CoverDesign.findAll.mockResolvedValue(mockDesigns);

      const result = await CoverDesignService.getAllCoverDesigns({
        limit: 10,
        offset: 0,
      });

      expect(CoverDesign.findAll).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
      });
      expect(result).toEqual(mockDesigns);
    });

    test("should return all cover designs without options", async () => {
      const mockDesigns = [];
      CoverDesign.findAll.mockResolvedValue(mockDesigns);

      const result = await CoverDesignService.getAllCoverDesigns();

      expect(CoverDesign.findAll).toHaveBeenCalledWith({});
      expect(result).toEqual(mockDesigns);
    });

    test("should throw error when database fails", async () => {
      CoverDesign.findAll.mockRejectedValue(new Error("Database error"));

      await expect(CoverDesignService.getAllCoverDesigns()).rejects.toThrow(
        "Failed to get all cover designs"
      );
    });
  });

  describe("validateUserOwnership", () => {
    test("should validate ownership successfully", async () => {
      const mockDesign = { id: 1, title: "Test Design", user_id: testUser.id };
      CoverDesign.findById.mockResolvedValue(mockDesign);

      const result = await CoverDesignService.validateUserOwnership(
        testUser.id,
        1
      );

      expect(result.valid).toBe(true);
      expect(result.design).toEqual(mockDesign);
    });

    test("should return invalid when design not found", async () => {
      CoverDesign.findById.mockResolvedValue(null);

      const result = await CoverDesignService.validateUserOwnership(
        testUser.id,
        99999
      );

      expect(result.valid).toBe(false);
      expect(result.message).toBe("Cover design not found");
    });

    test("should return invalid when user doesn't own design", async () => {
      const mockDesign = { id: 1, title: "Test Design", user_id: 999 };
      CoverDesign.findById.mockResolvedValue(mockDesign);

      const result = await CoverDesignService.validateUserOwnership(
        testUser.id,
        1
      );

      expect(result.valid).toBe(false);
      expect(result.message).toBe(
        "Access denied: You do not own this cover design"
      );
    });

    test("should throw error when database fails", async () => {
      CoverDesign.findById.mockRejectedValue(new Error("Database error"));

      await expect(
        CoverDesignService.validateUserOwnership(testUser.id, 1)
      ).rejects.toThrow("Failed to validate ownership");
    });
  });

  // Add error handling tests for existing methods
  describe("error handling", () => {
    test("should handle createCoverDesign service errors", async () => {
      CoverDesign.create.mockRejectedValue(
        new Error("Database connection failed")
      );

      await expect(
        CoverDesignService.createCoverDesign(testUser.id, { title: "Test" })
      ).rejects.toThrow(
        "Failed to create cover design: Database connection failed"
      );
    });

    test("should handle getCoverDesignsByUser service errors", async () => {
      CoverDesign.findByUserId.mockRejectedValue(new Error("Query failed"));

      await expect(
        CoverDesignService.getCoverDesignsByUser(testUser.id)
      ).rejects.toThrow("Failed to get user cover designs: Query failed");
    });

    test("should handle getCoverDesignById service errors", async () => {
      CoverDesign.findById.mockRejectedValue(new Error("Invalid query"));

      await expect(CoverDesignService.getCoverDesignById(1)).rejects.toThrow(
        "Failed to get cover design: Invalid query"
      );
    });

    test("should handle updateCoverDesign service errors", async () => {
      CoverDesign.update.mockRejectedValue(new Error("Update failed"));

      await expect(
        CoverDesignService.updateCoverDesign(1, { title: "Updated" })
      ).rejects.toThrow("Failed to update cover design: Update failed");
    });

    test("should handle deleteCoverDesign service errors", async () => {
      CoverDesign.delete.mockRejectedValue(new Error("Delete failed"));

      await expect(CoverDesignService.deleteCoverDesign(1)).rejects.toThrow(
        "Failed to delete cover design: Delete failed"
      );
    });

    test("should handle getCoverDesignsByStatus service errors", async () => {
      CoverDesign.findByStatus.mockRejectedValue(
        new Error("Status query failed")
      );

      await expect(
        CoverDesignService.getCoverDesignsByStatus("pending")
      ).rejects.toThrow(
        "Failed to get cover designs by status: Status query failed"
      );
    });
  });
});
