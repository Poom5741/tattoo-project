import type { KVNamespace } from "@cloudflare/workers-types";

export async function isAdminAuthed(
  cookieHeader: string,
  kv: KVNamespace
): Promise<boolean> {
  const token = cookieHeader.match(/admin_token=([^;]+)/)?.[1];
  if (!token) return false;
  try {
    const val = await kv.get(`admin:${token}`);
    return val === "1";
  } catch {
    return false;
  }
}
