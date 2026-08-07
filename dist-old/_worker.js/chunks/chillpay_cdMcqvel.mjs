globalThis.process ??= {};
globalThis.process.env ??= {};
import { createHash } from "crypto";
const SANDBOX_API_URL = "https://sandbox-appsrv2.chillpay.co/api/v2/Payment/";
const PROD_API_URL = "https://appsrv.chillpay.co/api/v2/Payment/";
const CURRENCY_THB = "764";
const CHANNEL_CODES = {
  QR_PAYMENT: "qrpayment"
};
const PAYMENT_STATUS = {
  SUCCESS: "0",
  FAIL: "1",
  CANCEL: "2"
};
function getApiUrl(isSandbox) {
  return isSandbox ? SANDBOX_API_URL : PROD_API_URL;
}
function formatAmount(thbAmount) {
  return Math.round(thbAmount * 100).toString();
}
function parseAmount(amountStr) {
  return parseInt(amountStr, 10) / 100;
}
function generateCheckSum(params, md5Secret) {
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
    "CardType"
  ];
  let concatenated = "";
  for (const key of orderedKeys) {
    const value = params[key] ?? "";
    concatenated += value;
  }
  concatenated += md5Secret;
  return createHash("md5").update(concatenated).digest("hex");
}
function verifyWebhookCheckSum(params, md5Secret) {
  const concatenated = params.TransactionId + params.Amount + params.OrderNo + params.CustomerId + params.BankCode + params.PaymentDate + params.PaymentStatus + params.BankRefCode + params.CurrentDate + params.CurrentTime + params.PaymentDescription + params.CreditCardToken + params.Currency + params.CustomerName + md5Secret;
  const expectedCheckSum = createHash("md5").update(concatenated).digest("hex");
  return expectedCheckSum === params.CheckSum;
}
function getChillPayConfig(env) {
  return {
    merchantCode: env.CHILLPAY_MERCHANT_CODE ?? "",
    apiKey: env.CHILLPAY_API_KEY ?? "",
    md5Secret: env.CHILLPAY_MD5_SECRET ?? "",
    routeNo: env.CHILLPAY_ROUTE_NO ?? "1",
    isSandbox: env.CHILLPAY_SANDBOX === "true"
  };
}
export {
  CHANNEL_CODES as C,
  PAYMENT_STATUS as P,
  generateCheckSum as a,
  getApiUrl as b,
  CURRENCY_THB as c,
  formatAmount as f,
  getChillPayConfig as g,
  parseAmount as p,
  verifyWebhookCheckSum as v
};
