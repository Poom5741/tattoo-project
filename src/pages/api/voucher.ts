export const prerender = false;

import type { APIRoute } from "astro";
import { randomUUID } from "crypto";
import { createPublicClient, createWalletClient, http, fallback, keccak256, toBytes, parseEther, zeroAddress } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "wagmi/chains";
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
         RETURNING token_id, price, artist_id, ipfs_cid`
      )
      .bind(expiry, designId, now)
      .first<{ token_id: number; price: number; artist_id: string; ipfs_cid: string | null }>();

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

    const { token_id: tokenId, price, ipfs_cid } = reserveResult;

    const transport = fallback([
      http(env.BASE_RPC_PRIMARY),
      http(env.BASE_RPC_FALLBACK),
    ]);

    const publicClient = createPublicClient({
      chain: baseSepolia,
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

    const artistTreasury = (env.ARTIST_TREASURY_ADDR as string | undefined) ?? zeroAddress;

    const voucher = {
      tokenId: BigInt(tokenId),
      designId,
      price: parseEther(String(price)),
      artistTreasury: artistTreasury as `0x${string}`,
      expiry: BigInt(expiry),
      buyer: buyer as `0x${string}`,
      cidHash: cidHash as `0x${string}`,
    };

    const signerPrivKey = env.SIGNER_PRIVATE_KEY as string;
    const account = privateKeyToAccount(
      (signerPrivKey.startsWith("0x") ? signerPrivKey : `0x${signerPrivKey}`) as `0x${string}`
    );

    const walletClient = createWalletClient({
      account,
      chain: baseSepolia,
      transport: http(env.BASE_RPC_PRIMARY),
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
