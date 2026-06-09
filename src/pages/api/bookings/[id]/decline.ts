export const prerender = false;

import type { APIRoute } from "astro";
import { getArtistSession } from "../../../../lib/artist/auth";

export const PUT: APIRoute = async ({ request, params, locals }) => {
  const env = locals.runtime.env;

  const session = await getArtistSession(
    request.headers.get("cookie") ?? "",
    env.SESSION
  );

  if (!session) {
    return new Response(null, { status: 401 });
  }

  const { id } = params;
  if (!id) {
    return new Response(JSON.stringify({ error: "Missing booking id" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const db = env.DB;

  // Verify booking belongs to this artist and is pending
  const booking = await db
    .prepare("SELECT id, status, artist_id FROM booking_inquiries WHERE id = ?")
    .bind(Number(id))
    .first<{ id: number; status: string | null; artist_id: string }>();

  if (!booking) {
    return new Response(JSON.stringify({ error: "Booking not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (booking.artist_id !== session.artistId) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const currentStatus = booking.status ?? "pending";
  if (currentStatus !== "pending") {
    return new Response(JSON.stringify({ error: "Only pending bookings can be declined" }), {
      status: 422,
      headers: { "Content-Type": "application/json" },
    });
  }

  await db
    .prepare("UPDATE booking_inquiries SET status = 'declined' WHERE id = ?")
    .bind(Number(id))
    .run();

  return new Response(JSON.stringify({ id: Number(id), status: "declined" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
