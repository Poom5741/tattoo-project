export const prerender = false;

import type { APIRoute } from "astro";
import { randomUUID } from "crypto";
import { verifyMessage } from "viem";

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { address, signature, nonce } = body as {
    address?: string;
    signature?: string;
    nonce?: string;
  };

  if (!address || !signature || !nonce) {
    return new Response(JSON.stringify({ error: "Missing address, signature, or nonce" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Retrieve the challenge message from KV
  const storedMessage = await env.SESSION.get(`challenge:${nonce}`);
  if (!storedMessage) {
    return new Response(JSON.stringify({ error: "Invalid or expired nonce" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Delete nonce to prevent replay
  await env.SESSION.delete(`challenge:${nonce}`);

  // Verify the signature using viem
  let valid: boolean;
  try {
    valid = await verifyMessage({
      address: address as `0x${string}`,
      message: storedMessage,
      signature: signature as `0x${string}`,
    });
  } catch (e) {
    console.error("verifyMessage error:", e);
    return new Response(JSON.stringify({ error: "Signature verification failed" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!valid) {
    return new Response(JSON.stringify({ error: "Signature does not match" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Create client session
  const token = randomUUID();
  const session = { address: address.toLowerCase() };
  await env.SESSION.put(`client:${token}`, JSON.stringify(session), {
    expirationTtl: 60 * 60 * 24 * 30, // 30 day TTL
  });

  const isSecure = request.url.startsWith("https://");
  const secureFlag = isSecure ? "Secure; " : "";

  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.append("Set-Cookie", `client_token=${token}; Path=/; HttpOnly; ${secureFlag}SameSite=Lax; Max-Age=2592000`);

  return new Response(JSON.stringify({ ok: true, address: address.toLowerCase() }), {
    status: 200,
    headers,
  });
};
