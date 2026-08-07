/**
 * API error envelope — unit tests (TDD).
 *
 * Per ticket 06 of the .wayfinder map, all API error responses must use
 * `{ error: string }` with `Content-Type: application/json`. This test
 * targets the offenders previously caught returning raw strings.
 *
 * Seams under test:
 *   1. POST /api/admin/register-artist with invalid form data returns
 *      a JSON envelope (was: raw string).
 *
 * The other admin / earnings / chillpay endpoints already use the envelope;
 * this test pins the one that didn't.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/pages/api/admin/register-artist";

function mockContext(opts: { cookie?: string; formData: FormData; isAdminAuthed?: boolean }) {
  const cookie = opts.cookie ?? (opts.isAdminAuthed ? "admin_token=test" : "");
  return {
    request: new Request("http://localhost/api/admin/register-artist", {
      method: "POST",
      headers: { cookie },
      body: opts.formData,
    }),
    locals: {
      runtime: {
        env: {
          SESSION: {
            get: vi.fn().mockResolvedValue(opts.isAdminAuthed ? "1" : null),
            put: vi.fn(),
            delete: vi.fn(),
          },
          DB: {
            prepare: vi.fn().mockReturnValue({
              bind: vi.fn().mockReturnThis(),
              first: vi.fn().mockResolvedValue(null),
              run: vi.fn().mockResolvedValue({ success: true }),
            }),
          },
        },
      },
    },
  } as never;
}

describe("POST /api/admin/register-artist — error envelope", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 400 with a JSON { error: '...' } body when form data is missing", async () => {
    // No body — triggers the formData parse failure path.
    const ctx = {
      request: new Request("http://localhost/api/admin/register-artist", {
        method: "POST",
        headers: { "content-type": "multipart/form-data", cookie: "admin_token=test" },
      }),
      locals: {
        runtime: {
          env: {
            SESSION: {
              get: vi.fn().mockResolvedValue("1"),
              put: vi.fn(),
              delete: vi.fn(),
            },
          },
        },
      },
    } as never;
    const res = await POST(ctx);
    expect(res.status).toBe(400);
    expect(res.headers.get("content-type")).toMatch(/application\/json/);
    const body = (await res.json()) as { error?: string };
    expect(typeof body.error).toBe("string");
  });

  it("returns 400 with JSON envelope when 'name' field is missing", async () => {
    const form = new FormData();
    form.set("handle", "x");
    const ctx = mockContext({ formData: form, isAdminAuthed: true });
    const res = await POST(ctx);
    expect(res.status).toBe(400);
    expect(res.headers.get("content-type")).toMatch(/application\/json/);
    const body = (await res.json()) as { error?: string };
    expect(typeof body.error).toBe("string");
  });

  it("returns 400 with JSON envelope when wallet address is malformed", async () => {
    const form = new FormData();
    form.set("name", "Mara Vael");
    form.set("walletAddress", "not-a-wallet");
    const ctx = mockContext({ formData: form, isAdminAuthed: true });
    const res = await POST(ctx);
    expect(res.status).toBe(400);
    expect(res.headers.get("content-type")).toMatch(/application\/json/);
    const body = (await res.json()) as { error?: string };
    expect(typeof body.error).toBe("string");
  });
});
