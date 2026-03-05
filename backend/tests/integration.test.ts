import { describe, test, expect } from "bun:test";
import { api, authenticatedApi, signUpTestUser, expectStatus, connectWebSocket, connectAuthenticatedWebSocket, waitForMessage } from "./helpers";

describe("API Integration Tests", () => {
  let authToken: string;

  test("Sign up test user", async () => {
    const { token } = await signUpTestUser();
    authToken = token;
    expect(authToken).toBeDefined();
  });

  test("Get current authenticated user", async () => {
    const res = await authenticatedApi("/api/users/me", authToken);
    await expectStatus(res, 200);
    const data = await res.json();
    expect(data.id).toBeDefined();
    expect(data.email).toBeDefined();
  });

  test("Get current user without auth returns 401", async () => {
    const res = await api("/api/users/me");
    await expectStatus(res, 401);
  });

  test("Update club ranking without auth returns 401", async () => {
    const res = await api("/api/club/rankings/user123?clubId=00000000-0000-0000-0000-000000000000", {
      method: "PUT",
      body: JSON.stringify({ eloRating: 1600, points: 50 }),
      headers: { "Content-Type": "application/json" },
    });
    await expectStatus(res, 401);
  });

  test("Update club ranking with invalid clubId format returns 400", async () => {
    const res = await authenticatedApi("/api/club/rankings/user123?clubId=invalid-uuid", authToken, {
      method: "PUT",
      body: JSON.stringify({ eloRating: 1600, points: 50 }),
      headers: { "Content-Type": "application/json" },
    });
    await expectStatus(res, 400);
  });

  test("Update club ranking with nonexistent club returns 404 or 403", async () => {
    const res = await authenticatedApi("/api/club/rankings/user123?clubId=00000000-0000-0000-0000-000000000000", authToken, {
      method: "PUT",
      body: JSON.stringify({ eloRating: 1600, points: 50 }),
      headers: { "Content-Type": "application/json" },
    });
    await expectStatus(res, 403, 404);
  });
});
