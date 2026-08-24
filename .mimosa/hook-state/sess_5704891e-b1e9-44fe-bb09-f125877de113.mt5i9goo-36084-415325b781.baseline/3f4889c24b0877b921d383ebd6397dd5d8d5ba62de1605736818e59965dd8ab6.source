/**
 * ChillPay Server-Side Utilities
 * These functions use Node.js crypto and must only be used in API routes
 */

import { createHash } from "crypto";

interface CheckSumParams {
  MerchantCode: string;
  OrderNo: string;
  CustomerId: string;
  Amount: string;
  PhoneNumber?: string;
  Description?: string;
  ChannelCode: string;
  Currency: string;
  LangCode?: string;
  RouteNo: string;
  IPAddress: string;
  ApiKey: string;
  TokenFlag?: string;
  CreditToken?: string;
  CreditMonth?: string;
  ShopID?: string;
  ProductImageUrl?: string;
  CustEmail?: string;
  CardType?: string;
}

/**
 * Generate MD5 CheckSum for ChillPay API requests
 * Format: Concatenate all param values + MD5 Secret Key, then MD5 hash
 */
export function generateCheckSum(
  params: CheckSumParams,
  md5Secret: string
): string {
  // Order matters! Must match ChillPay spec
  const orderedKeys = [
    "MerchantCode",
    "OrderNo",
    "CustomerId",
    "Amount",
    "PhoneNumber",
    "Description",
    "ChannelCode",
    "Currency",
    "LangCode",
    "RouteNo",
    "IPAddress",
    "ApiKey",
    "TokenFlag",
    "CreditToken",
    "CreditMonth",
    "ShopID",
    "ProductImageUrl",
    "CustEmail",
    "CardType",
  ];

  let concatenated = "";
  for (const key of orderedKeys) {
    const value = params[key as keyof CheckSumParams] ?? "";
    concatenated += value;
  }
  concatenated += md5Secret;

  return createHash("md5").update(concatenated).digest("hex");
}

interface WebhookParams {
  TransactionId: string;
  Amount: string;
  OrderNo: string;
  CustomerId: string;
  BankCode: string;
  PaymentDate: string;
  PaymentStatus: string;
  BankRefCode: string;
  CurrentDate: string;
  CurrentTime: string;
  PaymentDescription: string;
  CreditCardToken: string;
  Currency: string;
  CustomerName: string;
  CheckSum: string;
}

/**
 * Verify webhook callback CheckSum from ChillPay
 */
export function verifyWebhookCheckSum(
  params: WebhookParams,
  md5Secret: string
): boolean {
  const concatenated =
    params.TransactionId +
    params.Amount +
    params.OrderNo +
    params.CustomerId +
    params.BankCode +
    params.PaymentDate +
    params.PaymentStatus +
    params.BankRefCode +
    params.CurrentDate +
    params.CurrentTime +
    params.PaymentDescription +
    params.CreditCardToken +
    params.Currency +
    params.CustomerName +
    md5Secret;

  const expectedCheckSum = createHash("md5").update(concatenated).digest("hex");
  return expectedCheckSum === params.CheckSum;
}

/**
 * Get ChillPay config from environment variables
 */
export function getChillPayConfig(env: Record<string, string | undefined>) {
  return {
    merchantCode: env.CHILLPAY_MERCHANT_CODE ?? "",
    apiKey: env.CHILLPAY_API_KEY ?? "",
    md5Secret: env.CHILLPAY_MD5_SECRET ?? "",
    routeNo: env.CHILLPAY_ROUTE_NO ?? "1",
    isSandbox: env.CHILLPAY_SANDBOX === "true",
  };
}
