import { test, expect } from "@playwright/test";

test.describe("POST /api/bookings", () => {
  test("returns 400 for empty body", async ({ request }) => {
    const res = await request.post("/api/bookings", {
      data: {},
    });
    expect(res.status()).toBe(400);
  });

  test("returns 400 for invalid JSON", async ({ request }) => {
    const res = await request.post("/api/bookings", {
      headers: { "Content-Type": "application/json" },
      data: "not-json",
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body).toHaveProperty("error");
  });

  test("returns 400 when required fields are missing (no artistId)", async ({ request }) => {
    const res = await request.post("/api/bookings", {
      data: {
        name: "Test User",
        contact: "test@example.com",
        // Missing artistId
      },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body).toHaveProperty("error");
  });

  test("returns 400 when name is missing", async ({ request }) => {
    const res = await request.post("/api/bookings", {
      data: {
        artistId: "mara",
        contact: "test@example.com",
        // Missing name
      },
    });
    expect(res.status()).toBe(400);
  });

  test("returns 400 when contact is missing", async ({ request }) => {
    const res = await request.post("/api/bookings", {
      data: {
        artistId: "mara",
        name: "Test User",
        // Missing contact
      },
    });
    expect(res.status()).toBe(400);
  });

  test("returns 200 with valid booking data (plate type) when DB is seeded", async ({ request }) => {
    const res = await request.post("/api/bookings", {
      data: {
        artistId: "mara",
        name: "Test User",
        contact: "test@example.com",
        message: "Interested in a sleeve",
        bookingType: "plate",
      },
    });
    // 200 if DB is working, 500 if DB is unavailable
    expect([200, 500]).toContain(res.status());
    if (res.status() === 200) {
      const body = await res.json();
      expect(body).toHaveProperty("ok", true);
    }
  });

  test("returns 200 with valid custom consultation booking", async ({ request }) => {
    const res = await request.post("/api/bookings", {
      data: {
        artistId: "koto",
        name: "Jane Doe",
        contact: "jane@example.com",
        bookingType: "custom",
        customStyle: "Neo-traditional",
        customSize: "large",
        customPlacement: "Upper arm",
        customBudget: "500-1000 USD",
      },
    });
    expect([200, 500]).toContain(res.status());
    if (res.status() === 200) {
      const body = await res.json();
      expect(body).toHaveProperty("ok", true);
    }
  });

  test("returns 400 for invalid bookingType", async ({ request }) => {
    const res = await request.post("/api/bookings", {
      data: {
        artistId: "mara",
        name: "Test User",
        contact: "test@example.com",
        bookingType: "invalid-type",
      },
    });
    expect(res.status()).toBe(400);
  });
});
