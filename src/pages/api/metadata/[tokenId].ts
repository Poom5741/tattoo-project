export const prerender = false;

import type { APIRoute } from "astro";
import { randomUUID } from "crypto";

export const GET: APIRoute = async ({ params, locals }) => {
  const start = Date.now();
  const requestId = randomUUID();
  const tokenId = Number(params.tokenId);
  const db = locals.runtime.env.DB;
  const R2_PUBLIC_URL = locals.runtime.env.R2_PUBLIC_URL ?? "";

  if (!Number.isInteger(tokenId) || tokenId < 1) {
    return new Response(JSON.stringify({ error: "Invalid tokenId" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  let d1Ms = 0;

  try {
    const d1Start = Date.now();
    const row = await db
      .prepare(
        `SELECT d.*, a.name AS artist_name, a.bio, a.city, a.style AS artist_style
         FROM designs d
         JOIN artists a ON a.id = d.artist_id
         WHERE d.token_id = ?`
      )
      .bind(tokenId)
      .first<{
        id: string;
        title: string;
        style: string;
        placement: string;
        medium: string;
        sessions: number;
        n: string;
        price: number;
        ipfs_cid: string | null;
        image_override_url: string | null;
        artist_name: string;
        artist_style: string;
        bio: string;
        city: string;
      }>();
    d1Ms = Date.now() - d1Start;

    if (!row) {
      console.log(
        JSON.stringify({ request_id: requestId, route: `/api/metadata/${tokenId}`, status: 404, duration_ms: Date.now() - start, d1_query_ms: d1Ms })
      );
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    let image: string;
    if (row.ipfs_cid) {
      image = `ipfs://${row.ipfs_cid}`;
    } else if (row.image_override_url) {
      image = row.image_override_url;
    } else {
      image = `${R2_PUBLIC_URL}/metadata/${tokenId}.json`;
    }

    const metadata = {
      name: `SUKNID — ${row.title}`,
      description: `${row.title} by ${row.artist_name}. ${row.bio}`,
      image,
      external_url: `https://suknid.pages.dev/design/${row.id}`,
      attributes: [
        { trait_type: "Artist", value: row.artist_name },
        { trait_type: "Style", value: row.style },
        { trait_type: "Placement", value: row.placement },
        { trait_type: "Medium", value: row.medium },
        { trait_type: "Sessions", value: row.sessions },
        { trait_type: "Edition", value: row.n },
        { trait_type: "Price (ETH)", value: row.price },
        { trait_type: "City", value: row.city },
      ],
    };

    console.log(
      JSON.stringify({ request_id: requestId, route: `/api/metadata/${tokenId}`, status: 200, duration_ms: Date.now() - start, d1_query_ms: d1Ms })
    );

    return new Response(JSON.stringify(metadata), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.log(
      JSON.stringify({ request_id: requestId, route: `/api/metadata/${tokenId}`, status: 500, duration_ms: Date.now() - start, d1_query_ms: d1Ms, error: String(err) })
    );
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
