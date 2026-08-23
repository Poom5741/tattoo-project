export const prerender = false;

import type { APIRoute } from "astro";
import { randomUUID } from "crypto";
import { getArtistSession } from "../../lib/artist/auth";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export const POST: APIRoute = async ({ request, locals }) => {
  const start = Date.now();
  const requestId = randomUUID();
  const env = locals.runtime.env;

  // Verify artist session
  const session = await getArtistSession(
    request.headers.get("cookie") ?? "",
    env.SESSION
  );
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid multipart form data" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return new Response(JSON.stringify({ error: "Missing file field" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Validate file type
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return new Response(
      JSON.stringify({ error: "Invalid file type. Only JPEG, PNG, and WebP are allowed." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Validate file size
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
      httpMetadata: { contentType: file.type },
    });
  } catch (err) {
    console.log(
      JSON.stringify({
        request_id: requestId,
        route: "/api/upload",
        status: 500,
        duration_ms: Date.now() - start,
        error: String(err),
      })
    );
    return new Response(JSON.stringify({ error: "Upload failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const r2PublicUrl = (env.R2_PUBLIC_URL as string | undefined) ?? "";
  const url = `${r2PublicUrl}/${key}`;

  console.log(
    JSON.stringify({
      request_id: requestId,
      route: "/api/upload",
      status: 200,
      duration_ms: Date.now() - start,
      key,
    })
  );

  return new Response(JSON.stringify({ url, key }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
