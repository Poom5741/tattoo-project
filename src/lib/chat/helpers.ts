import { getArtistSession } from "../artist/auth";
import { isAdminAuthed } from "../admin/auth";

export interface ResolvedSender {
  id: string;
  role: "client" | "artist" | "admin";
}

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function resolveSender(
  cookie: string,
  sessionKV: Env["SESSION"],
  user: { id: string } | null | undefined,
): Promise<ResolvedSender | null> {
  if (await isAdminAuthed(cookie, sessionKV)) {
    return { id: "admin", role: "admin" };
  }
  const artist = await getArtistSession(cookie, sessionKV);
  if (artist) {
    return { id: artist.artistId, role: "artist" };
  }
  if (user) {
    return { id: user.id, role: "client" };
  }
  return null;
}
