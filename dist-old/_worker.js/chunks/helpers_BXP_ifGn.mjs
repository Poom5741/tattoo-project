globalThis.process ??= {};
globalThis.process.env ??= {};
import { g as getArtistSession } from "./auth_CBLJGIc-.mjs";
import { i as isAdminAuthed } from "./auth_DbftzjD7.mjs";
function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
async function resolveSender(cookie, sessionKV, user) {
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
export {
  json as j,
  resolveSender as r
};
