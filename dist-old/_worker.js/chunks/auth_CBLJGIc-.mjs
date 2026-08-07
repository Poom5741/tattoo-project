globalThis.process ??= {};
globalThis.process.env ??= {};
async function getArtistSession(cookieHeader, kv) {
  const token = cookieHeader.match(/artist_token=([^;]+)/)?.[1];
  if (!token) return null;
  try {
    const val = await kv.get(`artist:${token}`);
    if (!val) return null;
    return JSON.parse(val);
  } catch {
    return null;
  }
}
export {
  getArtistSession as g
};
