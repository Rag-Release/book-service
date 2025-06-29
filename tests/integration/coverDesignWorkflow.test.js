const request = require("supertest");
const app = require("../../src/app");
const jwt = require("jsonwebtoken");

describe("Cover Design Workflow Integration", () => {
  let testUser, authToken;

  beforeEach(async () => {
    testUser = await testUtils.createTestUser();
    authToken = jwt.sign({ userId: testUser.id }, process.env.JWT_SECRET);
  });

  test("complete cover design workflow", async () => {
    // Step 1: Create a cover design
    const designData = {
      title: "My Amazing Book",
      description: "A story about testing",
      book_genre: "Technology",
      target_audience: "Developers",
    };

    const createResponse = await request(app)
      .post("/api/cover-designs")
      .set("Authorization", `Bearer ${authToken}`)
      .send(designData)
      .expect(201);

    const coverDesignId = createResponse.body.data.id;

    // Step 2: Create a design request
    const requestData = {
      cover_design_id: coverDesignId,
      request_type: "new_design",
      priority: "high",
      budget: 299.99,
      deadline: "2024-12-31",
    };

    const requestResponse = await request(app)
      .post("/api/cover-design-requests")
      .set("Authorization", `Bearer ${authToken}`)
      .send(requestData)
      .expect(201);

    const requestId = requestResponse.body.data.id;

    // Step 3: Update request status
    await request(app)
      .put(`/api/cover-design-requests/${requestId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ status: "in_progress", assigned_designer_id: 123 })
      .expect(200);

    // Step 4: Complete the design
    await request(app)
      .put(`/api/cover-designs/${coverDesignId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        status: "completed",
        image_url: "https://example.com/design.jpg",
      })
      .expect(200);

    // Step 5: Mark request as completed
    const finalResponse = await request(app)
      .put(`/api/cover-design-requests/${requestId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ status: "completed", actual_completion_date: "2024-01-15" })
      .expect(200);

    expect(finalResponse.body.data.status).toBe("completed");

    // Step 6: Verify final state
    const finalDesignResponse = await request(app)
      .get(`/api/cover-designs/${coverDesignId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);

    expect(finalDesignResponse.body.data.status).toBe("completed");
    expect(finalDesignResponse.body.data.image_url).toBe(
      "https://example.com/design.jpg"
    );
  });

  test("should handle request cancellation workflow", async () => {
    // Create design and request
    const design = await testUtils.createTestCoverDesign({
      user_id: testUser.id,
    });
    const request = await testUtils.createTestCoverDesignRequest({
      user_id: testUser.id,
      cover_design_id: design.id,
    });

    // Cancel the request
    const cancelResponse = await request(app)
      .put(`/api/cover-design-requests/${request.id}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ status: "cancelled" })
      .expect(200);

    expect(cancelResponse.body.data.status).toBe("cancelled");

    // Verify design can still be updated independently
    await request(app)
      .put(`/api/cover-designs/${design.id}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ title: "Updated After Cancellation" })
      .expect(200);
  });
});
