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

const processedEvents = new Set<string>();

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

async function sendTelegram(text: string, sourceDomain: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    console.log("NO TELEGRAM_BOT_TOKEN");
    return;
  }

  const chatId = sourceDomain.includes("holytime.business")
    ? "-1003983054033"
    : "-1003808961913";

  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
    }),
  });

  const tgText = await res.text();
  console.log("TG RESPONSE:", tgText);
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

    const sourceDomain =
      customData.sourceDomain ||
      req.headers.get("host") ||
      "holytime.space";

    const email =
      data.customer?.email ||
      data.customer_email ||
      customData.email ||
      "unknown";

    const productName =
      PRODUCT_NAMES[productId] ||
      customData.productName ||
      data.items?.[0]?.price?.name ||
      data.items?.[0]?.product?.name ||
      "Advanced Learning Pack";

    const amount = data.details?.totals?.grand_total
      ? (Number(data.details.totals.grand_total) / 100).toFixed(2)
      : "?";

    const currency =
      data.currency_code ||
      data.details?.totals?.currency_code ||
      "EUR";

    const paymentMethod =
      data.payments?.[0]?.method_details?.type ||
      data.payments?.[0]?.payment_method_id ||
      "unknown";

    const country =
      data.customer?.address?.country_code ||
      data.billing_details?.address?.country_code ||
      "unknown";

    const paymentId = data.id || "unknown";
    const date = new Date().toLocaleString("en-GB");

    if (eventType === "transaction.payment_failed") {
      await sendTelegram(`⚠️ <b>PADDLE PAYMENT FAILED</b>

🌐 <b>Website:</b> ${sourceDomain}

👤 <b>Email:</b> ${email}
📦 <b>Product:</b> ${productName}
💰 <b>Amount:</b> ${amount} ${currency}
💳 <b>Payment:</b> ${paymentMethod}
🌍 <b>Country:</b> ${country}
🧾 <b>ID:</b> ${paymentId}
🕒 <b>Date:</b> ${date}`, sourceDomain);

      return new Response("OK", { status: 200 });
    }

    if (eventType !== "transaction.completed") {
      return new Response("OK", { status: 200 });
    }

    await sendTelegram(`💸 <b>PADDLE PAYMENT SUCCESSFUL</b>

🌐 <b>Website:</b> ${sourceDomain}

👤 <b>Email:</b> ${email}
📦 <b>Product:</b> ${productName}
💰 <b>Amount:</b> ${amount} ${currency}
💳 <b>Payment:</b> ${paymentMethod}
🌍 <b>Country:</b> ${country}
🧾 <b>ID:</b> ${paymentId}
🕒 <b>Date:</b> ${date}`, sourceDomain);

    const downloadLink = PRODUCT_LINKS[productId];

    if (downloadLink && email !== "unknown") {
      await resend.emails.send({
        from: "Holytime <support@holytime.auction>",
        to: email,
        subject: `Your product: ${productName}`,
        html: `
          <h2>Thank you for your purchase 💜</h2>
          <p>Your product is ready:</p>
          <p><strong>${productName}</strong></p>
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