export const prerender = false;

import type { APIRoute } from "astro";
import { randomUUID } from "crypto";
import { createRemoteJWKSet, jwtVerify } from "jose";

interface ArtistRow {
  id: string;
  name: string;
  wallet_address: string | null;
}

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

  const { accessToken, walletAddress: clientWallet } = body as {
    accessToken?: string;
    walletAddress?: string;
  };

  if (!accessToken || !clientWallet) {
    return new Response(JSON.stringify({ error: "Missing accessToken or walletAddress" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Verify Privy JWT via JWKS — no server SDK needed, keeps bundle under 3 MiB
  const appId = env.PRIVY_APP_ID;
  try {
    const jwks = createRemoteJWKSet(
      new URL(`https://auth.privy.io/api/v1/apps/${appId}/jwks.json`)
    );
    await jwtVerify(accessToken, jwks, { issuer: "privy.io", audience: appId });
  } catch {
    return new Response(JSON.stringify({ error: "Invalid Privy token" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const walletAddress = clientWallet.toLowerCase();

  const artist = await env.DB.prepare(
    "SELECT id, name, wallet_address FROM artists WHERE lower(wallet_address) = ?"
  )
    .bind(walletAddress)
    .first<ArtistRow>();

  if (!artist) {
    return new Response(
      JSON.stringify({ error: "Wallet not linked to any artist profile", walletAddress }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  const token = randomUUID();
  const session = { artistId: artist.id, walletAddress, name: artist.name };
  await env.SESSION.put(`artist:${token}`, JSON.stringify(session), {
    expirationTtl: 60 * 60 * 8,
  });

  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  // Set new cookie at Path=/ so it reaches /api/* routes
  headers.append("Set-Cookie", `artist_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=28800`);
  // Expire stale cookie at old Path=/artist
  headers.append("Set-Cookie", "artist_token=; Path=/artist; HttpOnly; SameSite=Lax; Max-Age=0");

  return new Response(JSON.stringify({ ok: true, artistId: artist.id }), {
    status: 200,
    headers,
  });
};
