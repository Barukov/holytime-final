import { Resend } from "resend";
import crypto from "crypto";

export const runtime = "nodejs";

const resend = new Resend(process.env.RESEND_API_KEY!);

const PRODUCT_LINKS: Record<string, string> = {
  starter: "https://drive.google.com/drive/folders/1gJW0fFRcY1O1JlnePnqUp2gTm8XUU9kh?usp=sharing",
  advanced: "https://drive.google.com/file/d/102z289XsEfuHbrOvPazAhWjE1VE4HgfK/view?usp=sharing",
  premium: "https://drive.google.com/drive/folders/1RqTD_vuq2LvYWH-vpQBAk2d73X6-W4ny?usp=sharing",
  product159: "https://drive.google.com/drive/folders/1elClIcBLP3FE5gtuHUFwBBWBoFfN5o6l?usp=sharing",
  product161: "https://drive.google.com/drive/folders/1baNo2BVX6oY5mYoqahy0hmbXu1wkzGbK?usp=sharing",
  product199: "https://drive.google.com/file/d/1ZHHXBAZ3Gu8oHkp2B215MkUl5IXtEqft/view?usp=sharing",
  product245: "https://drive.google.com/drive/folders/1RqTD_vuq2LvYWH-vpQBAk2d73X6-W4ny?usp=sharing",
  product255: "https://drive.google.com/file/d/1ZHHXBAZ3Gu8oHkp2B215MkUl5IXtEqft/view?usp=sharing",
};

const PRODUCT_NAMES: Record<string, string> = {
  starter: "Starter Pack",
  advanced: "Advanced Learning Pack",
  premium: "Premium Bundle",
  product159: "Essential Pack",
  product161: "Professional Pack",
  product199: "Elite Pack",
  product245: "Ultimate Learning Pack",
  product255: "Master Resource Pack",
};

const PAYMENT_ERROR_MESSAGES: Record<string, string> = {
  authentication_failed: "3DS authentication failed.",
  blocked_card: "Card is blocked, frozen, lost, damaged, or stolen.",
  canceled: "Customer, bank, or provider canceled the payment.",
  declined: "Payment declined by issuer or provider.",
  declined_not_retryable: "Payment declined and should not be retried.",
  expired_card: "Card is expired.",
  fraud: "Payment flagged as potentially fraudulent.",
  invalid_amount: "Issuer or provider cannot process this amount.",
  invalid_payment_details: "Payment details are invalid.",
  issuer_unavailable: "Payment provider could not reach the issuer.",
  not_enough_balance: "Insufficient funds or card limit reached.",
  preferred_network_not_supported: "Selected card network is not supported.",
  prepaid_card_not_supported: "Prepaid cards are blocked for this account.",
  psp_error: "Payment provider error.",
  redacted_payment_method: "Payment method details were redacted.",
  system_error: "Paddle platform error.",
  transaction_not_permitted: "Issuer does not allow this kind of payment.",
  unknown: "Unknown payment failure.",
};

const processedEvents = new Set<string>();

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function verifyPaddleSignature(rawBody: string, signature: string, secret: string) {
  try {
    const parts = Object.fromEntries(
      signature.split(";").map((part) => {
        const [key, value] = part.split("=");
        return [key, value];
      })
    );

    const ts = parts.ts;
    const h1 = parts.h1;

    if (!ts || !h1) return false;

    const digest = crypto
      .createHmac("sha256", secret)
      .update(`${ts}:${rawBody}`)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(digest, "hex"),
      Buffer.from(h1, "hex")
    );
  } catch {
    return false;
  }
}

function latestPayment(payments: any[]) {
  if (!Array.isArray(payments) || payments.length === 0) return {};
  return payments[payments.length - 1] || {};
}

function getAmount(data: any) {
  const total = data.details?.totals?.grand_total;

  if (total === undefined || total === null) return "?";

  return (Number(total) / 100).toFixed(2);
}

function getPaymentMethod(payment: any) {
  return (
    payment.method_details?.type ||
    payment.method_details?.card?.type ||
    payment.payment_method_id ||
    "unknown"
  );
}

function getPaymentCard(payment: any) {
  const card = payment.method_details?.card;

  if (!card) return "unknown";

  return [
    card.type,
    card.brand,
    card.last4 ? `**** ${card.last4}` : null,
  ]
    .filter(Boolean)
    .join(" ");
}

function getFailureReason(payment: any, data: any) {
  const code =
    payment.error_code ||
    data.error_code ||
    data.checkout?.error_code ||
    "unknown";

  const message =
    payment.error_message ||
    data.error_message ||
    PAYMENT_ERROR_MESSAGES[code] ||
    PAYMENT_ERROR_MESSAGES.unknown;

  return { code, message };
}

async function fetchPaddleCountry(customerId: string, addressId: string) {
  const apiKey = process.env.PADDLE_API_KEY;

  if (!apiKey || customerId === "unknown" || !addressId) return null;

  try {
    const res = await fetch(
      `https://api.paddle.com/customers/${customerId}/addresses/${addressId}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      console.error("Paddle address lookup failed:", await res.text());
      return null;
    }

    const json = await res.json();
    return json.data?.country_code || null;
  } catch (error) {
    console.error("Paddle address lookup error:", error);
    return null;
  }
}

async function resolveCountry(data: any) {
  const directCountry =
    data.customer?.address?.country_code ||
    data.address?.country_code ||
    data.billing_details?.address?.country_code ||
    data.details?.tax_rates_used?.[0]?.tax_rate_country ||
    null;

  if (directCountry) return directCountry;

  const customerId = data.customer_id || data.customer?.id || "unknown";
  const addressId = data.address_id || data.customer?.address_id || "";

  return (await fetchPaddleCountry(customerId, addressId)) || "unknown";
}

function buildPaymentMessage(title: string, details: Record<string, unknown>) {
  return `<b>${title}</b>

<b>Website:</b> ${escapeHtml(details.website)}
<b>Email:</b> ${escapeHtml(details.email)}
<b>Product:</b> ${escapeHtml(details.product)}
<b>Amount:</b> ${escapeHtml(details.amount)} ${escapeHtml(details.currency)}
<b>Payment method:</b> ${escapeHtml(details.paymentMethod)}
<b>Card:</b> ${escapeHtml(details.paymentCard)}
<b>Payment status:</b> ${escapeHtml(details.paymentStatus)}
<b>Country:</b> ${escapeHtml(details.country)}
${details.errorCode ? `<b>Error code:</b> ${escapeHtml(details.errorCode)}
<b>Error reason:</b> ${escapeHtml(details.errorReason)}
` : ""}<b>Transaction ID:</b> ${escapeHtml(details.transactionId)}
<b>Customer ID:</b> ${escapeHtml(details.customerId)}
<b>Date:</b> ${escapeHtml(details.date)}`;
}

async function sendTelegram(text: string, sourceDomain: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    console.log("NO TELEGRAM_BOT_TOKEN");
    return;
  }

  const chatId =
    process.env.TELEGRAM_CHAT_ID ||
    (sourceDomain.includes("holytime.business")
      ? "-1003983054033"
      : "-1003808961913");

  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });

  if (!res.ok) {
    console.error("TG RESPONSE:", await res.text());
  }
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();

    const signature = req.headers.get("paddle-signature") || "";
    const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.log("NO PADDLE_WEBHOOK_SECRET");
      return new Response("OK", { status: 200 });
    }

    if (!signature) {
      console.log("NO PADDLE SIGNATURE");
      return new Response("OK", { status: 200 });
    }

    const validSignature = verifyPaddleSignature(rawBody, signature, webhookSecret);

    if (!validSignature) {
      console.log("INVALID PADDLE SIGNATURE");
      return new Response("OK", { status: 200 });
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event_type;
    const data = event.data || {};

    console.log("PADDLE EVENT:", eventType);

    const eventId =
      event.notification_id ||
      event.event_id ||
      `${eventType}_${data.id}`;

    if (processedEvents.has(eventId)) {
      console.log("DUPLICATE EVENT:", eventId);
      return new Response("OK", { status: 200 });
    }

    processedEvents.add(eventId);

    const customData = data.custom_data || {};
    const productId = customData.productId || "advanced";
    const payment = latestPayment(data.payments);
    const failureReason = getFailureReason(payment, data);
    const country = await resolveCountry(data);

    const sourceDomain =
      customData.sourceDomain ||
      req.headers.get("host") ||
      "holytime.space";

    const details = {
      website: sourceDomain,
      email: data.customer?.email || data.customer_email || customData.email || "unknown",
      product:
        PRODUCT_NAMES[productId] ||
        customData.productName ||
        data.items?.[0]?.price?.name ||
        data.items?.[0]?.product?.name ||
        "Advanced Learning Pack",
      amount: getAmount(data),
      currency: data.currency_code || data.details?.totals?.currency_code || "EUR",
      paymentMethod: getPaymentMethod(payment),
      paymentCard: getPaymentCard(payment),
      paymentStatus: payment.status || data.status || "unknown",
      country,
      transactionId: data.id || "unknown",
      customerId: data.customer_id || data.customer?.id || "unknown",
      date: new Date().toLocaleString("en-GB"),
    };

    if (eventType === "transaction.payment_failed") {
      await sendTelegram(
        buildPaymentMessage("PADDLE PAYMENT FAILED", {
          ...details,
          errorCode: failureReason.code,
          errorReason: failureReason.message,
        }),
        sourceDomain
      );

      return new Response("OK", { status: 200 });
    }

    if (eventType !== "transaction.completed") {
      return new Response("OK", { status: 200 });
    }

    await sendTelegram(
      buildPaymentMessage("PADDLE PAYMENT SUCCESSFUL", details),
      sourceDomain
    );

    const downloadLink = PRODUCT_LINKS[productId];

    if (downloadLink && details.email !== "unknown") {
      await resend.emails.send({
        from: "Holytime <support@holytime.auction>",
        to: String(details.email),
        subject: `Your product: ${details.product}`,
        html: `
          <h2>Thank you for your purchase</h2>
          <p>Your product is ready:</p>
          <p><strong>${details.product}</strong></p>
          <p>
            <a href="${downloadLink}"
            style="display:inline-block;padding:12px 20px;background:#6541df;color:white;border-radius:8px;text-decoration:none;font-weight:bold;">
            Download your product
            </a>
          </p>
        `,
      });
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("Paddle webhook error:", err);
    return new Response("OK", { status: 200 });
  }
}
