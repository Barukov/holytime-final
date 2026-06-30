import { Resend } from "resend";
import crypto from "crypto";

export const runtime = "nodejs";

const resend = new Resend(process.env.RESEND_API_KEY!);

const PRODUCT_LINKS: Record<string, string> = {
  starter: "/downloads/Starter-Digital-Pack.pdf",
  advanced: "/downloads/Advanced-Digital-Pack.pdf",
  premium: "/downloads/Premium-Digital-Bundle.pdf",
  product159: "/downloads/Essential-Digital-Pack.pdf",
  product161: "/downloads/Professional-Digital-Pack.pdf",
  product199: "/downloads/Elite-Learning-Pack.pdf",
  product245: "/downloads/Ultimate-Learning-Pack.pdf",
  product255: "/downloads/Master-Resource-Pack.pdf",
};

const PRODUCT_NAMES: Record<string, string> = {
  starter: "Starter Pack",
  advanced: "Advanced Learning Pack",
  premium: "Premium Bundle",
  product159: "Essential Pack",
  product161: "Professional Pack",
  product199: "Elite Learning Pack",
  product245: "Ultimate Learning Pack",
  product255: "Master Resource Pack",
};
function buildDownloadLink(productId: string, sourceDomain: unknown) {
  const link = PRODUCT_LINKS[productId];

  if (!link) return "";
  if (/^https?:\/\//i.test(link)) return link;

  const domain = String(sourceDomain || "")
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0]
    .toLowerCase();

  return `https://${domain}${link.startsWith("/") ? link : `/${link}`}`;
}


const ICONS = {
  success: "\u{1F4B8}",
  failed: "\u{26A0}\u{FE0F}",
  website: "\u{1F310}",
  email: "\u{1F464}",
  product: "\u{1F4E6}",
  amount: "\u{1F4B0}",
  payment: "\u{1F4B3}",
  country: "\u{1F30D}",
  error: "\u{26A0}\u{FE0F}",
  reason: "\u{1F4DD}",
  id: "\u{1F9FE}",
  date: "\u{1F552}",
};

const PAYMENT_ERROR_MESSAGES: Record<string, string> = {
  authentication_failed: "3DS authentication failed. Customer completed the bank verification challenge, but it was not successful.",
  blocked_card: "The card is blocked, frozen, lost, damaged, or stolen. Customer should try another card.",
  canceled: "Payment was canceled by the customer, bank, or payment provider.",
  declined: "Payment was declined by the bank or payment provider. Customer should try another card.",
  declined_not_retryable: "Payment was declined and should not be retried with the same card.",
  expired_card: "The card is expired. Customer should use another card.",
  fraud: "Payment was blocked as potentially fraudulent.",
  invalid_amount: "The bank or payment provider cannot process this amount.",
  invalid_payment_details: "Payment details are invalid. Customer should re-enter card details or use another card.",
  issuer_unavailable: "The bank was unavailable and could not confirm the payment.",
  not_enough_balance: "Insufficient funds or card limit reached.",
  preferred_network_not_supported: "Selected card network is not supported.",
  prepaid_card_not_supported: "Prepaid cards are not supported for this payment.",
  psp_error: "Payment provider error. Customer can retry later or use another payment method.",
  redacted_payment_method: "Payment method details were redacted by the provider.",
  system_error: "Paddle platform error. Customer can retry later.",
  transaction_not_permitted: "The bank does not allow this type of transaction.",
  unknown: "Unknown payment failure. Check Paddle transaction details for the exact bank/provider response.",
};

const processedEvents = new Set<string>();
const processedTransactions = new Set<string>();
const DESK2_CHAT_ID = "-1003808961913";

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

  return [...payments].sort((a, b) => {
    const aTime = new Date(a?.created_at || 0).getTime();
    const bTime = new Date(b?.created_at || 0).getTime();
    return bTime - aTime;
  })[0] || {};
}

function latestFailedPayment(payments: any[]) {
  if (!Array.isArray(payments) || payments.length === 0) return {};

  const failedPayments = payments.filter((payment) => {
    const status = String(payment?.status || "").toLowerCase();
    return status === "error" || status === "failed" || Boolean(payment?.error_code);
  });

  return latestPayment(failedPayments.length ? failedPayments : payments);
}

function paymentFingerprint(eventType: string, transactionId: unknown, payment: any) {
  if (eventType === "transaction.completed") {
    return `${eventType}_${transactionId || "unknown"}`;
  }

  return [
    eventType,
    transactionId || "unknown",
    payment?.payment_attempt_id ||
      payment?.payment_method_id ||
      payment?.created_at ||
      payment?.error_code ||
      "unknown",
  ].join("_");
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
    return {
      country: json.data?.country_code || null,
      postalCode: json.data?.postal_code || json.data?.zip_code || null,
    };
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

  const customerId = data.customer_id || data.customer?.id || "unknown";
  const addressId = data.address_id || data.customer?.address_id || "";
  const paddleAddress = await fetchPaddleCountry(customerId, addressId);

  return directCountry || paddleAddress?.country || "unknown";
}

async function resolvePostalCode(data: any) {
  const directPostalCode =
    data.customer?.address?.postal_code ||
    data.customer?.address?.zip_code ||
    data.address?.postal_code ||
    data.address?.zip_code ||
    data.billing_details?.address?.postal_code ||
    data.billing_details?.address?.zip_code ||
    null;

  if (directPostalCode) return directPostalCode;

  const customerId = data.customer_id || data.customer?.id || "unknown";
  const addressId = data.address_id || data.customer?.address_id || "";
  const paddleAddress = await fetchPaddleCountry(customerId, addressId);

  return paddleAddress?.postalCode || "";
}

function formatCountry(country: unknown, postalCode: unknown) {
  const zip = String(postalCode || "").trim();
  return zip ? `${country} ZIP: ${zip}` : String(country || "unknown");
}

function buildPaymentMessage(title: string, details: Record<string, unknown>) {
  return `<b>${title}</b>

${ICONS.website} <b>Website:</b> ${escapeHtml(details.website)}

${ICONS.email} <b>Email:</b> ${escapeHtml(details.email)}
${ICONS.product} <b>Product:</b> ${escapeHtml(details.product)}
${ICONS.amount} <b>Amount:</b> ${escapeHtml(details.amount)} ${escapeHtml(details.currency)}
${ICONS.payment} <b>Payment:</b> ${escapeHtml(details.paymentMethod)}
${ICONS.country} <b>Country:</b> ${escapeHtml(formatCountry(details.country, details.postalCode))}
${details.errorCode ? `${ICONS.error} <b>Error:</b> ${escapeHtml(details.errorCode)}
${ICONS.reason} <b>Reason:</b> ${escapeHtml(details.errorReason)}
` : ""}${ICONS.id} <b>ID:</b> ${escapeHtml(details.transactionId)}
${ICONS.date} <b>Date:</b> ${escapeHtml(details.date)}`;
}

async function sendTelegram(text: string, sourceDomain: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    console.log("NO TELEGRAM_BOT_TOKEN");
    return;
  }

  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: DESK2_CHAT_ID,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });

  if (!res.ok) {
    console.error("TG RESPONSE:", await res.text());
  }
}

function normalizeSourceDomain(value: unknown) {
  return String(value || "")
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0]
    .toLowerCase();
}

function shouldProcessSourceDomain(sourceDomain: string) {
  const domain = normalizeSourceDomain(sourceDomain);
  return domain === "holytime-final.vercel.app";
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

    console.log(
      "PADDLE EVENT:",
      eventType,
      "txn:",
      data.id || "unknown",
      "event:",
      event.event_id || "unknown",
      "notification:",
      event.notification_id || "unknown"
    );

    const eventId =
      event.notification_id ||
      event.event_id ||
      `${eventType}_${data.id}`;

    if (processedEvents.has(eventId)) {
      console.log("DUPLICATE EVENT:", eventId);
      return new Response("OK", { status: 200 });
    }

    processedEvents.add(eventId);

    const sourceDomain =
      data.custom_data?.sourceDomain ||
      req.headers.get("host") ||
      "holytime.space";

    if (!shouldProcessSourceDomain(sourceDomain)) {
      console.log("IGNORED SOURCE DOMAIN:", sourceDomain);
      return new Response("OK", { status: 200 });
    }

    const customData = data.custom_data || {};
    const productId = customData.productId || "advanced";
    const payment =
      eventType === "transaction.payment_failed"
        ? latestFailedPayment(data.payments)
        : latestPayment(data.payments);
    const transactionEventId = paymentFingerprint(eventType, data.id, payment);

    if (
      data.id &&
      (eventType === "transaction.payment_failed" || eventType === "transaction.completed") &&
      processedTransactions.has(transactionEventId)
    ) {
      console.log("DUPLICATE TRANSACTION EVENT:", transactionEventId);
      return new Response("OK", { status: 200 });
    }

    if (data.id && (eventType === "transaction.payment_failed" || eventType === "transaction.completed")) {
      processedTransactions.add(transactionEventId);
    }

    const failureReason = getFailureReason(payment, data);
    const country = await resolveCountry(data);
    const postalCode = await resolvePostalCode(data);

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
      paymentStatus: payment.status || data.status || "unknown",
      country,
      postalCode,
      transactionId: data.id || "unknown",
      date: new Date().toLocaleString("en-GB"),
    };

    if (eventType === "transaction.payment_failed") {
      await sendTelegram(
        buildPaymentMessage(`${ICONS.failed} PADDLE PAYMENT FAILED`, {
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
      buildPaymentMessage(`${ICONS.success} PADDLE PAYMENT SUCCESSFUL`, details),
      sourceDomain
    );

    const downloadLink = buildDownloadLink(String(productId), sourceDomain);

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

