globalThis.process ??= {};
globalThis.process.env ??= {};
import { C as CHANNEL_CODES, g as getChillPayConfig, f as formatAmount, a as generateCheckSum, b as getApiUrl, c as CURRENCY_THB } from "../../../chunks/chillpay_cdMcqvel.mjs";
import { C as CreateOrderSchema } from "../../../chunks/schemas_Dq2rX-Tk.mjs";
import { a } from "../../../chunks/_@astro-renderers_B6-rS8YJ.mjs";
const prerender = false;
const POST = async ({ request, locals }) => {
  const env = locals.runtime.env;
  const db = env.DB;
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  const parsed = CreateOrderSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Validation failed", issues: parsed.error.issues }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  const { designId, customerId, customerEmail, customerPhone, channelCode = CHANNEL_CODES.QR_PAYMENT } = parsed.data;
  const design = await db.prepare("SELECT id, status, price, artist_id, title FROM designs WHERE id = ?").bind(designId).first();
  if (!design) {
    return new Response(JSON.stringify({ error: "Design not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" }
    });
  }
  if (design.status !== "available") {
    return new Response(JSON.stringify({ error: "Design is not available", status: design.status }), {
      status: 409,
      headers: { "Content-Type": "application/json" }
    });
  }
  if (!design.price) {
    return new Response(JSON.stringify({ error: "Design has no price" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  const config = getChillPayConfig(env);
  if (!config.merchantCode || !config.apiKey || !config.md5Secret || config.merchantCode === "PLACEHOLDER" || config.apiKey === "PLACEHOLDER") {
    return new Response(JSON.stringify({
      error: "Payment gateway not yet configured. Please contact the site administrator."
    }), {
      status: 503,
      headers: { "Content-Type": "application/json" }
    });
  }
  const orderNo = `ORD${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const clientIp = request.headers.get("x-forwarded-for") ?? request.headers.get("cf-connecting-ip") ?? "127.0.0.1";
  const orderParams = {
    MerchantCode: config.merchantCode,
    OrderNo: orderNo,
    CustomerId: customerId ?? `CUST${Date.now()}`,
    Amount: formatAmount(design.price),
    PhoneNumber: customerPhone ?? "",
    Description: `SAKNID - ${design.title}`,
    ChannelCode: channelCode,
    Currency: CURRENCY_THB,
    LangCode: "TH",
    RouteNo: config.routeNo,
    IPAddress: clientIp.split(",")[0].trim(),
    ApiKey: config.apiKey,
    TokenFlag: "",
    CreditToken: "",
    CreditMonth: "",
    ShopID: "",
    ProductImageUrl: "",
    CustEmail: customerEmail ?? "",
    CardType: ""
  };
  const checkSum = generateCheckSum(orderParams, config.md5Secret);
  orderParams.CheckSum = checkSum;
  const transactionId = `CHILL${Date.now()}`;
  await db.prepare(
    `INSERT INTO chillpay_transactions (
        id, order_no, design_id, amount, status, 
        channel_code, customer_id, customer_email, 
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    transactionId,
    orderNo,
    design.id,
    design.price,
    "pending",
    channelCode,
    orderParams.CustomerId,
    customerEmail ?? "",
    (/* @__PURE__ */ new Date()).toISOString(),
    (/* @__PURE__ */ new Date()).toISOString()
  ).run();
  const reservedUntil = new Date(Date.now() + 15 * 60 * 1e3).toISOString();
  await db.prepare("UPDATE designs SET status = 'reserved', reserved_until = ? WHERE id = ?").bind(reservedUntil, design.id).run();
  try {
    const apiUrl = getApiUrl(config.isSandbox);
    const formData = new URLSearchParams();
    for (const [key, value] of Object.entries(orderParams)) {
      if (value) formData.append(key, value);
    }
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: formData.toString()
    });
    if (!response.ok) {
      await db.prepare("UPDATE designs SET status = 'available', reserved_until = NULL WHERE id = ?").bind(design.id).run();
      return new Response(JSON.stringify({ error: "ChillPay API error", status: response.status }), {
        status: 502,
        headers: { "Content-Type": "application/json" }
      });
    }
    const chillPayResponse = await response.json();
    if (chillPayResponse.Status !== 1) {
      await db.prepare("UPDATE designs SET status = 'available', reserved_until = NULL WHERE id = ?").bind(design.id).run();
      return new Response(JSON.stringify({
        error: "ChillPay order creation failed",
        message: chillPayResponse.Message,
        code: chillPayResponse.Code
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (chillPayResponse.TransactionId) {
      await db.prepare("UPDATE chillpay_transactions SET chillpay_tx_id = ? WHERE id = ?").bind(chillPayResponse.TransactionId.toString(), transactionId).run();
    }
    return new Response(JSON.stringify({
      orderNo,
      transactionId,
      paymentUrl: chillPayResponse.PaymentUrl,
      returnUrl: chillPayResponse.ReturnUrl,
      chillPayTransactionId: chillPayResponse.TransactionId,
      amount: design.price,
      currency: "THB"
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    await db.prepare("UPDATE designs SET status = 'available', reserved_until = NULL WHERE id = ?").bind(design.id).run();
    console.error("ChillPay API error:", error);
    return new Response(JSON.stringify({ error: "Failed to create payment order" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  a as renderers
};
