globalThis.process ??= {};
globalThis.process.env ??= {};
import { g as getChillPayConfig, v as verifyWebhookCheckSum, P as PAYMENT_STATUS, p as parseAmount } from "../../../chunks/chillpay_cdMcqvel.mjs";
import { a } from "../../../chunks/_@astro-renderers_B6-rS8YJ.mjs";
const prerender = false;
const POST = async ({ request, locals }) => {
  const env = locals.runtime.env;
  const db = env.DB;
  const config = getChillPayConfig(env);
  if (!config.md5Secret) {
    return new Response(JSON.stringify({ error: "Not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  let payload = {};
  try {
    const formData = await request.text();
    const params = new URLSearchParams(formData);
    for (const [key, value] of params.entries()) {
      payload[key] = value;
    }
  } catch {
    return new Response(JSON.stringify({ error: "Invalid payload" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  const isValidCheckSum = verifyWebhookCheckSum(
    {
      TransactionId: payload.TransactionId ?? "",
      Amount: payload.Amount ?? "",
      OrderNo: payload.OrderNo ?? "",
      CustomerId: payload.CustomerId ?? "",
      BankCode: payload.BankCode ?? "",
      PaymentDate: payload.PaymentDate ?? "",
      PaymentStatus: payload.PaymentStatus ?? "",
      BankRefCode: payload.BankRefCode ?? "",
      CurrentDate: payload.CurrentDate ?? "",
      CurrentTime: payload.CurrentTime ?? "",
      PaymentDescription: payload.PaymentDescription ?? "",
      CreditCardToken: payload.CreditCardToken ?? "",
      Currency: payload.Currency ?? "",
      CustomerName: payload.CustomerName ?? "",
      CheckSum: payload.CheckSum ?? ""
    },
    config.md5Secret
  );
  if (!isValidCheckSum) {
    return new Response(JSON.stringify({ error: "Invalid checksum" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
  const orderNo = payload.OrderNo;
  const paymentStatus = payload.PaymentStatus;
  const transactionId = payload.TransactionId;
  const amount = parseAmount(payload.Amount);
  const transaction = await db.prepare("SELECT * FROM chillpay_transactions WHERE order_no = ?").bind(orderNo).first();
  if (!transaction) {
    return new Response(JSON.stringify({ error: "Transaction not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" }
    });
  }
  if (transaction.status !== "pending") {
    return new Response(JSON.stringify({ status: "already_processed" }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
  const design = await db.prepare("SELECT id, artist_id, price, status FROM designs WHERE id = ?").bind(transaction.design_id).first();
  if (!design) {
    return new Response(JSON.stringify({ error: "Design not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" }
    });
  }
  if (paymentStatus === PAYMENT_STATUS.SUCCESS) {
    const platformFee = amount * 0.03;
    const artistAmount = amount - platformFee;
    await db.prepare("UPDATE designs SET status = 'sold', token_id = ?, reserved_until = NULL WHERE id = ?").bind(transactionId, design.id).run();
    await db.prepare(
      `UPDATE chillpay_transactions SET 
          status = 'completed',
          chillpay_tx_id = ?,
          bank_ref_code = ?,
          payment_status = ?,
          payment_date = ?,
          updated_at = ?
        WHERE id = ?`
    ).bind(
      transactionId,
      payload.BankRefCode ?? "",
      paymentStatus,
      payload.PaymentDate ?? (/* @__PURE__ */ new Date()).toISOString(),
      (/* @__PURE__ */ new Date()).toISOString(),
      transaction.id
    ).run();
    if (design.artist_id) {
      await db.prepare(
        `INSERT INTO earnings(
            artist_id, design_id, type, amount, platform_fee, 
            tx_hash, payment_method, created_at
          ) VALUES (?, ?, 'primary_sale', ?, ?, ?, 'chillpay', ?)`
      ).bind(
        design.artist_id,
        design.id,
        artistAmount,
        platformFee,
        `chillpay:${transactionId}`,
        Math.floor(Date.now() / 1e3)
      ).run();
    }
    return new Response(JSON.stringify({ status: "success" }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } else if (paymentStatus === PAYMENT_STATUS.CANCEL || paymentStatus === PAYMENT_STATUS.FAIL) {
    await db.prepare(
      `UPDATE chillpay_transactions SET 
          status = 'failed',
          payment_status = ?,
          updated_at = ?
        WHERE id = ?`
    ).bind(paymentStatus, (/* @__PURE__ */ new Date()).toISOString(), transaction.id).run();
    await db.prepare("UPDATE designs SET status = 'available', reserved_until = NULL WHERE id = ?").bind(design.id).run();
    return new Response(JSON.stringify({ status: "failed" }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } else {
    await db.prepare(
      `UPDATE chillpay_transactions SET 
          payment_status = ?,
          updated_at = ?
        WHERE id = ?`
    ).bind(paymentStatus, (/* @__PURE__ */ new Date()).toISOString(), transaction.id).run();
    return new Response(JSON.stringify({ status: "received" }), {
      status: 200,
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
