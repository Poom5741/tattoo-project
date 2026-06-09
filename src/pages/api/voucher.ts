export const prerender = false;

import type { APIRoute } from "astro";
import { randomUUID } from "crypto";
import { createPublicClient, createWalletClient, http, fallback, keccak256, toBytes, parseUnits, zeroAddress } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { bscTestnet } from "wagmi/chains";
import { VoucherRequestSchema } from "../../lib/api/schemas";
import { CONTRACT_ADDRESS, CHAIN_ID, CONTRACT_ABI } from "../../lib/config/contract";

export const POST: APIRoute = async ({ request, locals }) => {
  const start = Date.now();
  const requestId = randomUUID();

  const env = locals.runtime.env;
  const db = env.DB;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const parsed = VoucherRequestSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "validation_error", issues: parsed.error.issues }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { designId, buyer } = parsed.data;

  const now = Math.floor(Date.now() / 1000);
  const expiry = now + 900;

  let chainMs = 0;

  try {
    const reserveResult = await db
      .prepare(
        `UPDATE designs
         SET status = 'reserved', reserved_until = ?
         WHERE id = ?
           AND (status = 'available' OR (status = 'reserved' AND reserved_until < ?))
         RETURNING token_id, price, artist_id, ipfs_cid, selling_mode, royalty_pct`
      )
      .bind(expiry, designId, now)
      .first<{ token_id: number; price: number; artist_id: string; ipfs_cid: string | null; selling_mode: string; royalty_pct: number | null }>();

    const meta = await db
      .prepare("SELECT changes() as c")
      .first<{ c: number }>();

    if (!reserveResult || (meta && meta.c === 0)) {
      console.log(
        JSON.stringify({
          request_id: requestId,
          route: "/api/voucher",
          status: 409,
          duration_ms: Date.now() - start,
          reason: "not_available",
        })
      );
      return new Response(JSON.stringify({ error: "not_available" }), {
        status: 409,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { token_id: tokenId, price, ipfs_cid, artist_id: artistId, selling_mode, royalty_pct } = reserveResult;

    // Look up artist's wallet address for per-artist treasury
    const artistRow = await db
      .prepare("SELECT wallet_address FROM artists WHERE id = ?")
      .bind(artistId)
      .first<{ wallet_address: string | null }>();

    if (!artistRow?.wallet_address) {
      console.log(
        JSON.stringify({
          request_id: requestId,
          route: "/api/voucher",
          status: 500,
          duration_ms: Date.now() - start,
          reason: "artist_has_no_wallet",
          artist_id: artistId,
        })
      );
      // Un-reserve the design
      await db
        .prepare("UPDATE designs SET status = 'available', reserved_until = NULL WHERE id = ?")
        .bind(designId)
        .run();
      return new Response(JSON.stringify({ error: "artist_has_no_wallet" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const transport = fallback([
      http(env.BSC_RPC_PRIMARY),
      http(env.BSC_RPC_FALLBACK),
    ]);

    const publicClient = createPublicClient({
      chain: bscTestnet,
      transport,
    });

    if (CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000") {
      try {
        const chainStart = Date.now();
        const owner = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "ownerOf",
          args: [BigInt(tokenId)],
        });
        chainMs = Date.now() - chainStart;

        if (owner && owner !== zeroAddress) {
          await db
            .prepare("UPDATE designs SET status = 'sold' WHERE id = ?")
            .bind(designId)
            .run();

          console.log(
            JSON.stringify({
              request_id: requestId,
              route: "/api/voucher",
              status: 409,
              duration_ms: Date.now() - start,
              chain_call_ms: chainMs,
              reason: "already_minted_on_chain",
            })
          );
          return new Response(JSON.stringify({ error: "not_available" }), {
            status: 409,
            headers: { "Content-Type": "application/json" },
          });
        }
      } catch {
        // ownerOf reverts for non-existent tokens — this is the happy path
      }
    }

    const cid = ipfs_cid ?? "";
    const cidHash = keccak256(toBytes(cid));

    const artistTreasury = artistRow.wallet_address as `0x${string}`;

    // Determine soulbound flag and royalty bps from selling_mode
    const isSoulbound = selling_mode === "one-time";
    // royaltyBps: royalty_pct * 100 (e.g. 10% -> 1000 bps). 0 for soulbound/one-time.
    const royaltyBps = !isSoulbound && royalty_pct ? Math.round(royalty_pct * 100) : 0;

    // BSC USDT uses 18 decimals (unlike Ethereum/Tron USDT which uses 6)
    const voucher = {
      tokenId: BigInt(tokenId),
      designId,
      price: parseUnits(String(price), 18),
      artistTreasury,
      expiry: BigInt(expiry),
      buyer: buyer as `0x${string}`,
      cidHash: cidHash as `0x${string}`,
      soulbound: isSoulbound,
      royaltyBps: royaltyBps,
    };

    const signerPrivKey = env.SIGNER_PRIVATE_KEY as string;
    const account = privateKeyToAccount(
      (signerPrivKey.startsWith("0x") ? signerPrivKey : `0x${signerPrivKey}`) as `0x${string}`
    );

    const walletClient = createWalletClient({
      account,
      chain: bscTestnet,
      transport: http(env.BSC_RPC_PRIMARY),
    });

    const signature = await walletClient.signTypedData({
      domain: {
        name: "INKNOIR",
        version: "1",
        chainId: CHAIN_ID,
        verifyingContract: CONTRACT_ADDRESS,
      },
      types: {
        LazyMintVoucher: [
          { name: "tokenId", type: "uint256" },
          { name: "designId", type: "string" },
          { name: "price", type: "uint256" },
          { name: "artistTreasury", type: "address" },
          { name: "expiry", type: "uint256" },
          { name: "buyer", type: "address" },
          { name: "cidHash", type: "bytes32" },
          { name: "soulbound", type: "bool" },
          { name: "royaltyBps", type: "uint96" },
        ],
      },
      primaryType: "LazyMintVoucher",
      message: voucher,
    });

    const responseVoucher = {
      tokenId: voucher.tokenId.toString(),
      designId: voucher.designId,
      price: voucher.price.toString(),
      artistTreasury: voucher.artistTreasury,
      expiry: voucher.expiry.toString(),
      buyer: voucher.buyer,
      cidHash: voucher.cidHash,
      soulbound: voucher.soulbound,
      royaltyBps: voucher.royaltyBps,
    };

    console.log(
      JSON.stringify({
        request_id: requestId,
        route: "/api/voucher",
        status: 200,
        duration_ms: Date.now() - start,
        chain_call_ms: chainMs,
        d1_query_ms: 0,
      })
    );

    return new Response(JSON.stringify({ voucher: responseVoucher, signature, cid }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.log(
      JSON.stringify({
        request_id: requestId,
        route: "/api/voucher",
        status: 500,
        duration_ms: Date.now() - start,
        error: String(err),
      })
    );
    return new Response(JSON.stringify({ error: "internal_server_error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
