export const prerender = false;

import type { APIRoute } from "astro";
import { randomUUID } from "crypto";
import { isAdminAuthed } from "../../../lib/admin/auth";
import { ReviewDesignSchema } from "../../../lib/api/schemas";

export const POST: APIRoute = async ({ request, locals }) => {
  const start = Date.now();
  const requestId = randomUUID();
  const env = locals.runtime.env;

  const authed = await isAdminAuthed(
    request.headers.get("cookie") ?? "",
    env.SESSION
  );
  if (!authed) {
    return new Response(null, { status: 401 });
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

  const parsed = ReviewDesignSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Validation failed", issues: parsed.error.issues }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { designId, action } = parsed.data;
  const db = env.DB;

  try {
    const design = await db
      .prepare("SELECT id, status FROM designs WHERE id = ?")
      .bind(designId)
      .first<{ id: string; status: string }>();

    if (!design) {
      return new Response(JSON.stringify({ error: "Design not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (design.status !== "pending") {
      return new Response(JSON.stringify({ error: "Only pending designs can be reviewed" }), {
        status: 422,
        headers: { "Content-Type": "application/json" },
      });
    }

    const newStatus = action === "approve" ? "available" : "rejected";

    await db
      .prepare("UPDATE designs SET status = ? WHERE id = ?")
      .bind(newStatus, designId)
      .run();

    console.log(
      JSON.stringify({
        request_id: requestId,
        route: "/api/admin/review-design",
        status: 200,
        duration_ms: Date.now() - start,
        design_id: designId,
        action,
        new_status: newStatus,
      })
    );

    return new Response(JSON.stringify({ designId, newStatus }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.log(
      JSON.stringify({
        request_id: requestId,
        route: "/api/admin/review-design",
        status: 500,
        duration_ms: Date.now() - start,
        error: String(err),
      })
    );
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
