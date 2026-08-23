export const prerender = false;

import type { APIRoute } from "astro";
import { z } from "zod";
import { HexAddress } from "@/lib/api/schemas";

const BackupPayloadSchema = z.object({
  address: HexAddress,
  encryptedBlob: z.string().min(1),
  recoverySalt: z.string().min(1),
  prfSalt: z.string().optional(),
  credentialId: z.string().optional(),
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * POST /api/wallet/backup
 * Store encrypted wallet backup, authed by Better Auth session.
 */
export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env as Env;
  const user = locals.user;
  const session = locals.session;

  if (!user || !session) {
    return json({ error: "Not authenticated" }, 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const parsed = BackupPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: "Invalid request", issues: parsed.error.issues }, 400);
  }

  const { address, encryptedBlob, recoverySalt, prfSalt, credentialId } = parsed.data;
  const now = Math.floor(Date.now() / 1000);

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
    .bind(user.id, user.id, address.toLowerCase(), encryptedBlob, recoverySalt, prfSalt ?? null, credentialId ?? null, now, now)
    .run();

  return json({ ok: true });
};

/**
 * GET /api/wallet/backup
 * Retrieve encrypted wallet backup, authed by Better Auth session.
 * Returns the authenticated user's backup; one backup per user.
 */
export const GET: APIRoute = async ({ locals }) => {
  const env = locals.runtime.env as Env;
  const user = locals.user;
  const session = locals.session;

  if (!user || !session) {
    return json({ error: "Not authenticated" }, 401);
  }

  try {
    const row = await env.DB.prepare(
      "SELECT encrypted_blob, recovery_salt FROM wallet_backups WHERE user_id = ? LIMIT 1"
    )
      .bind(user.id)
      .first<{ encrypted_blob: string; recovery_salt: string }>();

    if (!row) {
      return json({ error: "No backup found" }, 404);
    }

    return json({
      encryptedBlob: row.encrypted_blob,
      recoverySalt: row.recovery_salt,
    });
  } catch (e) {
    console.error("Failed to read backup:", e);
    return json({ error: "Failed to read backup" }, 500);
  }
};
