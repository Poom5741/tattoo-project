/**
 * dev_role cookie environment gate — regression tests for C1.
 *
 * The dev_role cookie is attacker-controllable via curl/devtools, so the
 * server MUST reject it in production. Hiding the UI is not sufficient.
 *
 * These tests cover both development (DEV=true) and production (DEV=false)
 * behavior to ensure the gate is enforced at the auth-function level.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { isAdminAuthed } from "@/lib/admin/auth";
import { getArtistSession } from "@/lib/artist/auth";

interface MockKv {
	get: ReturnType<typeof vi.fn>;
	put: ReturnType<typeof vi.fn>;
	delete: ReturnType<typeof vi.fn>;
	list: ReturnType<typeof vi.fn>;
}

function mockKv(): MockKv {
	return {
		get: vi.fn<() => Promise<string | null>>().mockResolvedValue(null),
		put: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
		delete: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
		list: vi.fn(),
	};
}

describe("dev_role cookie in development environment (C1)", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		vi.stubEnv("DEV", true);
	});

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	describe("isAdminAuthed", () => {
		it("returns true in development when dev_role=admin cookie is set", async () => {
			const kv = mockKv();
			const cookie = "dev_role=admin";

			const result = await isAdminAuthed(cookie, kv as never);

			expect(result).toBe(true);
		});

		it("falls through to token auth when dev_role is not admin", async () => {
			const kv = mockKv();
			kv.get.mockResolvedValue("1");
			const cookie = "dev_role=artist; admin_token=valid-token";

			const result = await isAdminAuthed(cookie, kv as never);

			expect(result).toBe(true);
			expect(kv.get).toHaveBeenCalledWith("admin:valid-token");
		});

		it("returns false when no auth is provided", async () => {
			const kv = mockKv();
			const cookie = "";

			const result = await isAdminAuthed(cookie, kv as never);

			expect(result).toBe(false);
		});
	});

	describe("getArtistSession", () => {
		it("returns dev session in development when dev_role=artist cookie is set", async () => {
			const kv = mockKv();
			const cookie = "dev_role=artist";

			const result = await getArtistSession(cookie, kv as never);

			expect(result).not.toBeNull();
			expect(result?.artistId).toBe("mara");
			expect(result?.name).toBe("Dev Artist (Mara)");
		});

		it("returns dev session in development when dev_role=admin cookie is set", async () => {
			const kv = mockKv();
			const cookie = "dev_role=admin";

			const result = await getArtistSession(cookie, kv as never);

			expect(result).not.toBeNull();
			expect(result?.artistId).toBe("mara");
		});

		it("falls through to token auth when dev_role is not set", async () => {
			const kv = mockKv();
			const session = { artistId: "real-artist", name: "Real", walletAddress: "0xabc" };
			kv.get.mockResolvedValue(JSON.stringify(session));
			const cookie = "artist_token=valid-token";

			const result = await getArtistSession(cookie, kv as never);

			expect(result).toEqual(session);
			expect(kv.get).toHaveBeenCalledWith("artist:valid-token");
		});

		it("returns null when no auth is provided", async () => {
			const kv = mockKv();
			const cookie = "";

			const result = await getArtistSession(cookie, kv as never);

			expect(result).toBeNull();
		});
	});
});

describe("dev_role cookie in production environment (C1 security gate)", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		vi.stubEnv("DEV", false);
	});

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	describe("isAdminAuthed", () => {
		it("returns false in production when dev_role=admin cookie is set", async () => {
			const kv = mockKv();
			const cookie = "dev_role=admin";

			const result = await isAdminAuthed(cookie, kv as never);

			expect(result).toBe(false);
		});

		it("ignores dev_role and falls through to token auth in production", async () => {
			const kv = mockKv();
			kv.get.mockResolvedValue("1");
			const cookie = "dev_role=admin; admin_token=valid-token";

			const result = await isAdminAuthed(cookie, kv as never);

			expect(result).toBe(true);
			expect(kv.get).toHaveBeenCalledWith("admin:valid-token");
		});

		it("returns false when dev_role=admin and no valid token in production", async () => {
			const kv = mockKv();
			const cookie = "dev_role=admin; admin_token=invalid-token";

			const result = await isAdminAuthed(cookie, kv as never);

			expect(result).toBe(false);
		});
	});

	describe("getArtistSession", () => {
		it("returns null in production when dev_role=artist cookie is set", async () => {
			const kv = mockKv();
			const cookie = "dev_role=artist";

			const result = await getArtistSession(cookie, kv as never);

			expect(result).toBeNull();
		});

		it("returns null in production when dev_role=admin cookie is set", async () => {
			const kv = mockKv();
			const cookie = "dev_role=admin";

			const result = await getArtistSession(cookie, kv as never);

			expect(result).toBeNull();
		});

		it("ignores dev_role and falls through to token auth in production", async () => {
			const kv = mockKv();
			const session = { artistId: "real-artist", name: "Real", walletAddress: "0xabc" };
			kv.get.mockResolvedValue(JSON.stringify(session));
			const cookie = "dev_role=artist; artist_token=valid-token";

			const result = await getArtistSession(cookie, kv as never);

			expect(result).toEqual(session);
			expect(kv.get).toHaveBeenCalledWith("artist:valid-token");
		});

		it("returns null when dev_role=artist and no valid token in production", async () => {
			const kv = mockKv();
			const cookie = "dev_role=artist; artist_token=invalid-token";

			const result = await getArtistSession(cookie, kv as never);

			expect(result).toBeNull();
		});
	});
});
