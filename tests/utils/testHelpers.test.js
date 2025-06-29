describe("Test Utilities", () => {
  describe("createTestUser", () => {
    test("should create user with default values", async () => {
      const user = await testUtils.createTestUser();

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.email).toBe("test@example.com");
      expect(user.first_name).toBe("John");
      expect(user.last_name).toBe("Doe");
      expect(user.role).toBe("user");
    });

    test("should create user with overrides", async () => {
      const user = await testUtils.createTestUser({
        email: "custom@example.com",
        first_name: "Jane",
        role: "admin",
      });

      expect(user.email).toBe("custom@example.com");
      expect(user.first_name).toBe("Jane");
      expect(user.role).toBe("admin");
    });
  });

  describe("createTestCoverDesign", () => {
    test("should create cover design with default values", async () => {
      const user = await testUtils.createTestUser();
      const design = await testUtils.createTestCoverDesign({
        user_id: user.id,
      });

      expect(design).toBeDefined();
      expect(design.id).toBeDefined();
      expect(design.user_id).toBe(user.id);
      expect(design.title).toBe("Test Book Title");
      expect(design.status).toBe("pending");
    });

    test("should create cover design with overrides", async () => {
      const user = await testUtils.createTestUser();
      const design = await testUtils.createTestCoverDesign({
        user_id: user.id,
        title: "Custom Title",
        status: "completed",
      });

      expect(design.title).toBe("Custom Title");
      expect(design.status).toBe("completed");
    });
  });

  describe("createTestCoverDesignRequest", () => {
    test("should create request with default values", async () => {
      const user = await testUtils.createTestUser();
      const design = await testUtils.createTestCoverDesign({
        user_id: user.id,
      });
      const request = await testUtils.createTestCoverDesignRequest({
        user_id: user.id,
        cover_design_id: design.id,
      });

      expect(request).toBeDefined();
      expect(request.id).toBeDefined();
      expect(request.user_id).toBe(user.id);
      expect(request.cover_design_id).toBe(design.id);
      expect(request.request_type).toBe("new_design");
      expect(request.status).toBe("pending");
    });

    test("should create request with overrides", async () => {
      const user = await testUtils.createTestUser();
      const design = await testUtils.createTestCoverDesign({
        user_id: user.id,
      });
      const request = await testUtils.createTestCoverDesignRequest({
        user_id: user.id,
        cover_design_id: design.id,
        request_type: "revision",
        priority: "high",
      });

      expect(request.request_type).toBe("revision");
      expect(request.priority).toBe("high");
    });
  });
});
