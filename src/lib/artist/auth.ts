import type { KVNamespace } from "@cloudflare/workers-types";

export interface ArtistSession {
  artistId: string;
  walletAddress: string;
  name: string;
}

export async function getArtistSession(
  cookieHeader: string,
  kv: KVNamespace
): Promise<ArtistSession | null> {
  const token = cookieHeader.match(/artist_token=([^;]+)/)?.[1];
  if (!token) return null;
  try {
    const val = await kv.get(`artist:${token}`);
    if (!val) return null;
    return JSON.parse(val) as ArtistSession;
  } catch {
    return null;
  }
}
