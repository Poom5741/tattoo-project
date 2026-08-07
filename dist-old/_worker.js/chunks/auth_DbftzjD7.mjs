globalThis.process ??= {};
globalThis.process.env ??= {};
async function isAdminAuthed(cookieHeader, kv) {
  const token = cookieHeader.match(/admin_token=([^;]+)/)?.[1];
  if (!token) return false;
  try {
    const val = await kv.get(`admin:${token}`);
    return val === "1";
  } catch {
    return false;
  }
}
export {
  isAdminAuthed as i
};
