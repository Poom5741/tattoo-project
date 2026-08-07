globalThis.process ??= {};
globalThis.process.env ??= {};
import { randomUUID } from "crypto";
import { g as getArtistSession } from "../../../../chunks/auth_CBLJGIc-.mjs";
import { o as objectType, s as stringType, n as numberType } from "../../../../chunks/astro/server_B1Q-Dpks.mjs";
import { a } from "../../../../chunks/_@astro-renderers_B6-rS8YJ.mjs";
const prerender = false;
const EditDesignSchema = objectType({
  title: stringType().min(1).max(200).optional(),
  style: stringType().min(1).max(100).optional(),
  price_usdt: numberType().positive().optional(),
  placement: stringType().min(1).max(200).optional(),
  medium: stringType().min(1).max(200).optional(),
  royalty_pct: numberType().min(5).max(15).optional(),
  image_key: stringType().min(1).optional()
  // selling_mode is intentionally excluded — it cannot be changed after creation
});
const PUT = async ({ request, params, locals }) => {
  const start = Date.now();
  const requestId = randomUUID();
  const env = locals.runtime.env;
  const session = await getArtistSession(
    request.headers.get("cookie") ?? "",
    env.SESSION
  );
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
  const designId = params.id;
  if (!designId) {
    return new Response(JSON.stringify({ error: "Missing design ID" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  const parsed = EditDesignSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Validation failed", issues: parsed.error.issues }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  const db = env.DB;
  try {
    const design = await db.prepare("SELECT id, artist_id, status FROM designs WHERE id = ?").bind(designId).first();
    if (!design) {
      return new Response(JSON.stringify({ error: "Design not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (design.artist_id !== session.artistId) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (design.status !== "rejected") {
      return new Response(JSON.stringify({ error: "Only rejected designs can be edited" }), {
        status: 422,
        headers: { "Content-Type": "application/json" }
      });
    }
    const updates = ["status = 'pending'"];
    const binds = [];
    const { title, style, price_usdt, placement, medium, royalty_pct, image_key } = parsed.data;
    if (title !== void 0) {
      updates.push("title = ?");
      binds.push(title);
    }
    if (style !== void 0) {
      updates.push("style = ?");
      binds.push(style);
    }
    if (price_usdt !== void 0) {
      updates.push("price = ?");
      binds.push(price_usdt);
    }
    if (placement !== void 0) {
      updates.push("placement = ?");
      binds.push(placement);
    }
    if (medium !== void 0) {
      updates.push("medium = ?");
      binds.push(medium);
    }
    if (royalty_pct !== void 0) {
      updates.push("royalty_pct = ?");
      binds.push(royalty_pct);
    }
    if (image_key !== void 0) {
      const r2PublicUrl = env.R2_PUBLIC_URL ?? "";
      updates.push("image_url = ?");
      binds.push(`${r2PublicUrl}/${image_key}`);
    }
    binds.push(designId);
    await db.prepare(`UPDATE designs SET ${updates.join(", ")} WHERE id = ?`).bind(...binds).run();
    console.log(
      JSON.stringify({
        request_id: requestId,
        route: `/api/designs/${designId}/edit`,
        status: 200,
        duration_ms: Date.now() - start
      })
    );
    return new Response(JSON.stringify({ id: designId, status: "pending" }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.log(
      JSON.stringify({
        request_id: requestId,
        route: `/api/designs/${designId}/edit`,
        status: 500,
        duration_ms: Date.now() - start,
        error: String(err)
      })
    );
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  PUT,
  prerender
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  a as renderers
};
