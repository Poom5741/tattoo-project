export const prerender = false;

import type { APIRoute } from "astro";

/**
 * POST /api/wallet/backup
 * Store encrypted wallet backup, authed by Better Auth session.
 */
export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env as Env;

  // Extract Better Auth session from cookie
  const sessionCookie = request.headers.get("cookie")?.split(";")
    .find((c) => c.trim().startsWith("better-auth-session="));
  if (!sessionCookie) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { address, encryptedBlob, recoverySalt, prfSalt, credentialId } = body as {
    address: string;
    encryptedBlob: string;
    recoverySalt: string;
    prfSalt?: string;
    credentialId?: string;
  };

  if (!address || !encryptedBlob || !recoverySalt) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const now = Math.floor(Date.now() / 1000);
  const userId = `user_${address.toLowerCase()}`;

  await env.DB.prepare(
    `INSERT INTO wallet_backups (id, user_id, address, encrypted_blob, recovery_salt, prf_salt, credential_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       encrypted_blob = excluded.encrypted_blob,
       recovery_salt = excluded.recovery_salt,
       prf_salt = excluded.prf_salt,
       credential_id = excluded.credential_id,
       updated_at = excluded.updated_at`
  )
    .bind(userId, userId, address.toLowerCase(), encryptedBlob, recoverySalt, prfSalt ?? null, credentialId ?? null, now, now)
    .run();

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

/**
 * GET /api/wallet/backup
 * Retrieve encrypted wallet backup, authed by Better Auth session.
 */
export const GET: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env as Env;

  const sessionCookie = request.headers.get("cookie")?.split(";")
    .find((c) => c.trim().startsWith("better-auth-session="));
  if (!sessionCookie) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const url = new URL(request.url);
  const address = url.searchParams.get("address");

  if (!address) {
    return new Response(JSON.stringify({ error: "Missing address parameter" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  try {
    const row = await env.DB.prepare(
      "SELECT encrypted_blob, recovery_salt FROM wallet_backups WHERE lower(address) = ?"
    )
      .bind(address.toLowerCase())
      .first<{ encrypted_blob: string; recovery_salt: string }>();

    if (!row) {
      return new Response(JSON.stringify({ error: "No backup found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      encryptedBlob: row.encrypted_blob,
      recoverySalt: row.recovery_salt,
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Failed to read backup:", e);
    return new Response(JSON.stringify({ error: "Failed to read backup" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
