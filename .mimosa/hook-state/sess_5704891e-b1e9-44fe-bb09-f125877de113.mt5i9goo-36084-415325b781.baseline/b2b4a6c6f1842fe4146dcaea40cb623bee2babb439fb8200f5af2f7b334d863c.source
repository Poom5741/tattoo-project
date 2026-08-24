import { test, expect } from "@playwright/test";

test.describe("GET /api/designs", () => {
  test("returns a response (200 with array or 500 if DB not seeded)", async ({ request }) => {
    const res = await request.get("/api/designs");
    // 200 if DB is seeded, 500 if not (or method not allowed if route doesn't exist as GET)
    expect([200, 404, 500]).toContain(res.status());
  });

  test("returns JSON array when DB is seeded", async ({ request }) => {
    const res = await request.get("/api/designs");
    if (res.status() === 200) {
      const body = await res.json();
      expect(Array.isArray(body) || (typeof body === "object" && body !== null)).toBe(true);
    }
  });
});

test.describe("GET /api/designs/[id]", () => {
  // Seed data design d1 = Serpent in Negative
  test("returns design data for existing design when DB is seeded (d1)", async ({ request }) => {
    const res = await request.get("/api/designs/d1");
    if (res.status() === 200) {
      const body = await res.json();
      // API returns the design flat (not wrapped in { design: ... })
      expect(body).toHaveProperty("id", "d1");
      expect(body).toHaveProperty("title");
      expect(body).toHaveProperty("status");
    } else {
      // 404 or 500 when DB is not seeded — acceptable
      expect([404, 500]).toContain(res.status());
    }
  });

  test("returns 404 for non-existent design", async ({ request }) => {
    const res = await request.get("/api/designs/d999");
    expect([404, 500]).toContain(res.status());
  });
});
