globalThis.process ??= {};
globalThis.process.env ??= {};
import { randomUUID } from "crypto";
import { g as getArtistSession } from "../../chunks/auth_CBLJGIc-.mjs";
import { a } from "../../chunks/_@astro-renderers_B6-rS8YJ.mjs";
const prerender = false;
const ALLOWED_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp"
};
const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const POST = async ({ request, locals }) => {
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
  let formData;
  try {
    formData = await request.formData();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid multipart form data" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return new Response(JSON.stringify({ error: "Missing file field" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return new Response(
      JSON.stringify({ error: "Invalid file type. Only JPEG, PNG, and WebP are allowed." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
  if (file.size > MAX_SIZE_BYTES) {
    return new Response(
      JSON.stringify({ error: "File too large. Maximum size is 10MB." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
  const key = `designs/${session.artistId}/${randomUUID()}.${ext}`;
  try {
    const arrayBuffer = await file.arrayBuffer();
    await env.MEDIA.put(key, arrayBuffer, {
      httpMetadata: { contentType: file.type }
    });
  } catch (err) {
    console.log(
      JSON.stringify({
        request_id: requestId,
        route: "/api/upload",
        status: 500,
        duration_ms: Date.now() - start,
        error: String(err)
      })
    );
    return new Response(JSON.stringify({ error: "Upload failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  const r2PublicUrl = env.R2_PUBLIC_URL ?? "";
  const url = `${r2PublicUrl}/${key}`;
  console.log(
    JSON.stringify({
      request_id: requestId,
      route: "/api/upload",
      status: 200,
      duration_ms: Date.now() - start,
      key
    })
  );
  return new Response(JSON.stringify({ url, key }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  a as renderers
};
