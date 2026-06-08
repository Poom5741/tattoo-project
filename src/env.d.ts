/// <reference types="astro/client" />

type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {}
}

interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  BASE_RPC_PRIMARY: string;
  BASE_RPC_FALLBACK: string;
  PUBLIC_CONTRACT_ADDRESS: string;
  PUBLIC_CHAIN_ID: string;
  SIGNER_PRIVATE_KEY: string;
  NFT_STORAGE_KEY: string;
  RESEND_API_KEY: string;
  R2_PUBLIC_URL: string;
}
