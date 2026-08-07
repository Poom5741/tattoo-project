globalThis.process ??= {};
globalThis.process.env ??= {};
import { randomUUID } from "crypto";
import { g as getAddress } from "../../../chunks/isAddress_CvPYbxIx.mjs";
import { i as isAddressEqual } from "../../../chunks/isAddressEqual_cc58LofG.mjs";
import { h as hashMessage } from "../../../chunks/hashMessage_Bn4YmYfL.mjs";
import { r as recoverAddress } from "../../../chunks/recoverAddress_DCfK7WXD.mjs";
import { a } from "../../../chunks/_@astro-renderers_B6-rS8YJ.mjs";
async function recoverMessageAddress({ message, signature }) {
  return recoverAddress({ hash: hashMessage(message), signature });
}
async function verifyMessage({ address, message, signature }) {
  return isAddressEqual(getAddress(address), await recoverMessageAddress({ message, signature }));
}
const prerender = false;
const POST = async ({ request, locals }) => {
  const env = locals.runtime.env;
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  const { address, signature, nonce } = body;
  if (!address || !signature || !nonce) {
    return new Response(JSON.stringify({ error: "Missing address, signature, or nonce" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  const storedMessage = await env.SESSION.get(`challenge:${nonce}`);
  if (!storedMessage) {
    return new Response(JSON.stringify({ error: "Invalid or expired nonce" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
  await env.SESSION.delete(`challenge:${nonce}`);
  let valid;
  try {
    valid = await verifyMessage({
      address,
      message: storedMessage,
      signature
    });
  } catch (e) {
    console.error("verifyMessage error:", e);
    return new Response(JSON.stringify({ error: "Signature verification failed" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
  if (!valid) {
    return new Response(JSON.stringify({ error: "Signature does not match" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
  const artist = await env.DB.prepare(
    "SELECT id, name, wallet_address FROM artists WHERE lower(wallet_address) = ?"
  ).bind(address.toLowerCase()).first();
  if (!artist) {
    return new Response(
      JSON.stringify({ error: "Wallet not linked to any artist profile", walletAddress: address }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }
  const token = randomUUID();
  const session = { artistId: artist.id, walletAddress: address.toLowerCase(), name: artist.name };
  await env.SESSION.put(`artist:${token}`, JSON.stringify(session), {
    expirationTtl: 60 * 60 * 8
  });
  const isSecure = request.url.startsWith("https://");
  const secureFlag = isSecure ? "Secure; " : "";
  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.append("Set-Cookie", `artist_token=${token}; Path=/; HttpOnly; ${secureFlag}SameSite=Lax; Max-Age=28800`);
  return new Response(JSON.stringify({ ok: true, artistId: artist.id }), {
    status: 200,
    headers
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
