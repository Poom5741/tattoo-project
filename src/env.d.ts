/// <reference types="astro/client" />

type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {
    locale: string;
  }
}

// Build-time public vars, inlined by Vite via `import.meta.env.*`.
// NOTE: this is a different mechanism from the Cloudflare `Env` runtime
// bindings below (those are read via `Astro.locals.runtime.env`).
interface ImportMetaEnv {
  readonly PUBLIC_TAWK_PROPERTY_ID: string;
  readonly PUBLIC_TAWK_WIDGET_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  MEDIA: R2Bucket;
  SESSION: KVNamespace;
  BASE_RPC_PRIMARY: string;
  BASE_RPC_FALLBACK: string;
  PUBLIC_CONTRACT_ADDRESS: string;
  PUBLIC_CHAIN_ID: string;
  SIGNER_PRIVATE_KEY: string;
  NFT_STORAGE_KEY: string;
  RESEND_API_KEY: string;
  ADMIN_PASSWORD: string;
  R2_PUBLIC_URL: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  
  // ChillPay Payment Gateway
  CHILLPAY_MERCHANT_CODE: string;
  CHILLPAY_API_KEY: string;
  CHILLPAY_MD5_SECRET: string;
  CHILLPAY_ROUTE_NO: string;
  CHILLPAY_SANDBOX: string;
}
