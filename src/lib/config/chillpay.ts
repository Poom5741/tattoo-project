/**
 * ChillPay Payment Gateway Configuration - Client-Safe Constants
 * Docs: ChillPay Merchant Integration Manual v1.2.5
 */

// Sandbox URLs
export const SANDBOX_API_URL = "https://sandbox-appsrv2.chillpay.co/api/v2/Payment/";
export const SANDBOX_STATUS_URL = "https://sandbox-appsrv2.chillpay.co/api/v2/PaymentStatus/";
export const SANDBOX_CDN_URL = "https://sandbox-cdnv3.chillpay.co/Payment/";

// Production URLs
export const PROD_API_URL = "https://appsrv.chillpay.co/api/v2/Payment/";
export const PROD_STATUS_URL = "https://appsrv.chillpay.co/api/v2/PaymentStatus/";
export const PROD_CDN_URL = "https://cdn.chillpay.co/Payment/";

// Currency codes
export const CURRENCY_THB = "764";

// Payment channel codes
export const CHANNEL_CODES = {
  CREDIT_CARD: "creditcard",
  QR_PAYMENT: "qrpayment",
  INTERNET_BANK_BAY: "internetbank_bay", // Bank of Ayudhya
  INTERNET_BANK_BBL: "internetbank_bbl", // Bangkok Bank
  INTERNET_BANK_KBANK: "internetbank_kbank", // Kasikorn Bank
  INTERNET_BANK_SCB: "internetbank_scb", // SCB
  MOBILE_BANKING: "mobilebanking",
  BILL_PAYMENT: "billpayment",
  ALIPAY: "alipay",
  WECHAT_PAY: "wechatpay",
  TRUEMONEY: "truemoney",
  SHOPEEPAY: "shopeepay",
  PAOTANG: "paotang",
} as const;

export type ChannelCode = (typeof CHANNEL_CODES)[keyof typeof CHANNEL_CODES];

// Payment status codes
export const PAYMENT_STATUS = {
  SUCCESS: "0",
  FAIL: "1",
  CANCEL: "2",
  ERROR: "3",
  PENDING: "9",
} as const;

export interface ChillPayConfig {
  merchantCode: string;
  apiKey: string;
  md5Secret: string;
  routeNo: string;
  isSandbox: boolean;
}

export function getApiUrl(isSandbox: boolean): string {
  return isSandbox ? SANDBOX_API_URL : PROD_API_URL;
}

export function getCdnUrl(isSandbox: boolean): string {
  return isSandbox ? SANDBOX_CDN_URL : PROD_CDN_URL;
}

export function getStatusUrl(isSandbox: boolean): string {
  return isSandbox ? SANDBOX_STATUS_URL : PROD_STATUS_URL;
}

/**
 * Convert THB amount to ChillPay format (santang)
 * 550.25 THB -> "55025"
 */
export function formatAmount(thbAmount: number): string {
  return Math.round(thbAmount * 100).toString();
}

/**
 * Convert ChillPay amount to THB
 * "55025" -> 550.25
 */
export function parseAmount(amountStr: string): number {
  return parseInt(amountStr, 10) / 100;
}

/**
 * Get payment status description
 */
export function getPaymentStatusDesc(status: string): string {
  switch (status) {
    case PAYMENT_STATUS.SUCCESS:
      return "Success";
    case PAYMENT_STATUS.FAIL:
      return "Failed";
    case PAYMENT_STATUS.CANCEL:
      return "Cancelled";
    case PAYMENT_STATUS.ERROR:
      return "Error";
    case PAYMENT_STATUS.PENDING:
      return "Pending";
    default:
      return "Unknown";
  }
}

export interface ChillPayOrderRequest {
  MerchantCode: string;
  OrderNo: string;
  CustomerId: string;
  Amount: string; // in satang
  PhoneNumber?: string;
  Description?: string;
  ChannelCode: string;
  Currency: string; // "764" for THB
  LangCode?: string; // "TH" or "EN"
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
  CheckSum: string;
}

export interface ChillPayOrderResponse {
  Status: number;
  Code: number;
  Message: string;
  TransactionId: number;
  Amount: string;
  OrderNo: string;
  CustomerId: string;
  ChannelCode: string;
  ReturnUrl: string;
  PaymentUrl: string;
  IpAddress: string;
  Token: string;
  CreatedDate: string;
  ExpiredDate: string;
}

export interface ChillPayWebhookPayload {
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
