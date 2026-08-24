export const prerender = false;

import type { APIRoute } from "astro";
import { z } from "zod";
import { getApiUrl, formatAmount, CURRENCY_THB, CHANNEL_CODES } from "../../../lib/config/chillpay";
import { getChillPayConfig, generateCheckSum } from "../../../lib/server/chillpay";
import { CreateOrderSchema } from "../../../lib/api/schemas";

// POST /api/chillpay/create-order
// Creates a ChillPay payment order and returns the PaymentUrl for redirect
export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;
  const db = env.DB;

  // Parse request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const parsed = CreateOrderSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Validation failed", issues: parsed.error.issues }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { designId, customerId, customerEmail, customerPhone, channelCode = CHANNEL_CODES.QR_PAYMENT } = parsed.data;

  // Verify design exists and is available
  const design = await db
    .prepare("SELECT id, status, price, artist_id, title FROM designs WHERE id = ?")
    .bind(designId)
    .first<{ id: string; status: string; price: number | null; artist_id: string; title: string }>();

  if (!design) {
    return new Response(JSON.stringify({ error: "Design not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (design.status !== "available") {
    return new Response(JSON.stringify({ error: "Design is not available", status: design.status }), {
      status: 409,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!design.price) {
    return new Response(JSON.stringify({ error: "Design has no price" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Get ChillPay config
  const config = getChillPayConfig(env);
  if (!config.merchantCode || !config.apiKey || !config.md5Secret || 
      config.merchantCode === "PLACEHOLDER" || config.apiKey === "PLACEHOLDER") {
    return new Response(JSON.stringify({ 
      error: "Payment gateway not yet configured. Please contact the site administrator." 
    }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Generate order number
  const orderNo = `ORD${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  
  // Get client IP
  const clientIp = request.headers.get("x-forwarded-for") ?? 
                   request.headers.get("cf-connecting-ip") ?? 
                   "127.0.0.1";

  // Build ChillPay order request
  const orderParams: Record<string, string> = {
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
    CardType: "",
  };

  // Generate CheckSum
  const checkSum = generateCheckSum(orderParams, config.md5Secret);
  orderParams.CheckSum = checkSum;

  // Create pending transaction record
  const transactionId = `CHILL${Date.now()}`;
  await db
    .prepare(
      `INSERT INTO chillpay_transactions (
        id, order_no, design_id, amount, status, 
        channel_code, customer_id, customer_email, 
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      transactionId,
      orderNo,
      design.id,
      design.price,
      "pending",
      channelCode,
      orderParams.CustomerId,
      customerEmail ?? "",
      new Date().toISOString(),
      new Date().toISOString()
    )
    .run();

  // Reserve design
  const reservedUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 min
  await db
    .prepare("UPDATE designs SET status = 'reserved', reserved_until = ? WHERE id = ?")
    .bind(reservedUntil, design.id)
    .run();

  try {
    // Call ChillPay API
    const apiUrl = getApiUrl(config.isSandbox);
    
    // Build form data
    const formData = new URLSearchParams();
    for (const [key, value] of Object.entries(orderParams)) {
      if (value) formData.append(key, value);
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      // Release reservation on failure
      await db
        .prepare("UPDATE designs SET status = 'available', reserved_until = NULL WHERE id = ?")
        .bind(design.id)
        .run();
      
      return new Response(JSON.stringify({ error: "ChillPay API error", status: response.status }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    const chillPayResponse = await response.json() as {
      Status: number;
      Code: number;
      Message: string;
      TransactionId?: number;
      PaymentUrl?: string;
      ReturnUrl?: string;
    };

    if (chillPayResponse.Status !== 1) {
      // Release reservation on failure
      await db
        .prepare("UPDATE designs SET status = 'available', reserved_until = NULL WHERE id = ?")
        .bind(design.id)
        .run();

      return new Response(JSON.stringify({ 
        error: "ChillPay order creation failed", 
        message: chillPayResponse.Message,
        code: chillPayResponse.Code 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Update transaction with ChillPay TransactionId
    if (chillPayResponse.TransactionId) {
      await db
        .prepare("UPDATE chillpay_transactions SET chillpay_tx_id = ? WHERE id = ?")
        .bind(chillPayResponse.TransactionId.toString(), transactionId)
        .run();
    }

    return new Response(JSON.stringify({
      orderNo,
      transactionId,
      paymentUrl: chillPayResponse.PaymentUrl,
      returnUrl: chillPayResponse.ReturnUrl,
      chillPayTransactionId: chillPayResponse.TransactionId,
      amount: design.price,
      currency: "THB",
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    // Release reservation on error
    await db
      .prepare("UPDATE designs SET status = 'available', reserved_until = NULL WHERE id = ?")
      .bind(design.id)
      .run();

    console.error("ChillPay API error:", error);
    return new Response(JSON.stringify({ error: "Failed to create payment order" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
