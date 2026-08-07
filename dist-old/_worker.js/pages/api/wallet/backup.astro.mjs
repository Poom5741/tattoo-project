globalThis.process ??= {};
globalThis.process.env ??= {};
import { H as HexAddress } from "../../../chunks/schemas_Dq2rX-Tk.mjs";
import { o as objectType, s as stringType } from "../../../chunks/astro/server_B1Q-Dpks.mjs";
import { a } from "../../../chunks/_@astro-renderers_B6-rS8YJ.mjs";
const prerender = false;
const BackupPayloadSchema = objectType({
  address: HexAddress,
  encryptedBlob: stringType().min(1),
  recoverySalt: stringType().min(1),
  prfSalt: stringType().optional(),
  credentialId: stringType().optional()
});
function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
const POST = async ({ request, locals }) => {
  const env = locals.runtime.env;
  const user = locals.user;
  const session = locals.session;
  if (!user || !session) {
    return json({ error: "Not authenticated" }, 401);
  }
  let body;
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
  const now = Math.floor(Date.now() / 1e3);
  await env.DB.prepare(
    `INSERT INTO wallet_backups (id, user_id, address, encrypted_blob, recovery_salt, prf_salt, credential_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       encrypted_blob = excluded.encrypted_blob,
       recovery_salt = excluded.recovery_salt,
       prf_salt = excluded.prf_salt,
       credential_id = excluded.credential_id,
       updated_at = excluded.updated_at`
  ).bind(user.id, user.id, address.toLowerCase(), encryptedBlob, recoverySalt, prfSalt ?? null, credentialId ?? null, now, now).run();
  return json({ ok: true });
};
const GET = async ({ locals }) => {
  const env = locals.runtime.env;
  const user = locals.user;
  const session = locals.session;
  if (!user || !session) {
    return json({ error: "Not authenticated" }, 401);
  }
  try {
    const row = await env.DB.prepare(
      "SELECT encrypted_blob, recovery_salt FROM wallet_backups WHERE user_id = ? LIMIT 1"
    ).bind(user.id).first();
    if (!row) {
      return json({ error: "No backup found" }, 404);
    }
    return json({
      encryptedBlob: row.encrypted_blob,
      recoverySalt: row.recovery_salt
    });
  } catch (e) {
    console.error("Failed to read backup:", e);
    return json({ error: "Failed to read backup" }, 500);
  }
};
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET,
  POST,
  prerender
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  a as renderers
};
