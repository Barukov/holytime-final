import { Resend } from "resend";

const PRODUCT_LINKS: Record<string, string> = {
  starter: "https://drive.google.com/your-starter-file-link",
  advanced: "https://drive.google.com/your-advanced-file-link",
  premium: "https://drive.google.com/your-premium-file-link",
};

const processedEvents = new Set<string>();

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const eventType = body.event_type;
    const data = body.data || {};
    const customData = data.custom_data || {};

    const resendKey = process.env.RESEND_API_KEY;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    const transactionId =
      data.id ||
      data.transaction_id ||
      body.event_id ||
      body.notification_id ||
      "unknown";

    const eventId =
      body.event_id ||
      body.notification_id ||
      `${eventType}_${transactionId}`;

    if (processedEvents.has(eventId)) {
      return new Response("OK", { status: 200 });
    }

    processedEvents.add(eventId);

    const status =
      data.status ||
      data.transaction?.status ||
      data.checkout?.status ||
      "unknown";

    const productId = customData.productId;
    const productName = customData.productName || "Digital product";

    const customerEmail =
      data.customer?.email ||
      customData.customerEmail ||
      data.customer_email ||
      "unknown";

    const addressData =
      data.customer?.address ||
      data.billing_details?.address ||
      data.address ||
      {};

    const country =
      addressData.country_code ||
      data.customer?.country ||
      data.billing_address?.country ||
      "unknown";

    const address =
      [
        addressData.first_line || addressData.line1,
        addressData.city,
        addressData.postal_code,
        country,
      ]
        .filter(Boolean)
        .join(", ") || "unknown";

    const payment = data.payments?.[0] || {};

    const paymentMethod =
      payment.method_details?.type ||
      payment.payment_method_id ||
      payment.type ||
      "unknown";

    const declineReason =
      payment.error_code ||
      payment.error_message ||
      payment.method_details?.card?.decline_reason ||
      payment.status ||
      data.error_code ||
      data.error_message ||
      "unknown";

    const amount = data.details?.totals?.total
      ? Number(data.details.totals.total) / 100
      : "?";

    const currency = data.currency_code || "";

    const date = data.created_at
      ? new Date(data.created_at).toLocaleString("en-GB")
      : new Date().toLocaleString("en-GB");

    async function sendTelegram(text: string) {
      if (!botToken || !chatId) return;

      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
        }),
      });
    }

    if (eventType === "transaction.payment_failed") {
      if (
        status === "completed" ||
        status === "paid" ||
        status === "completed"
      ) {
        return new Response("OK", { status: 200 });
      }

      await sendTelegram(`⚠️ <b>PAYMENT ATTEMPT FAILED</b>
🌐 <b>Website:</b> holytime-final.vercel.app

👤 <b>Email:</b> ${customerEmail}
📦 <b>Product:</b> ${productName}
💳 <b>Payment:</b> ${paymentMethod}
🌍 <b>Country:</b> ${country}
📍 <b>Address:</b> ${address}
⚠️ <b>Reason:</b> ${declineReason}
🧾 <b>ID:</b> ${transactionId}
🕒 <b>Date:</b> ${date}`);

      return new Response("OK", { status: 200 });
    }

    if (eventType !== "transaction.completed") {
      return new Response("OK", { status: 200 });
    }

    await sendTelegram(`💸 <b>PAYMENT SUCCESSFUL</b>
🌐 <b>Website:</b> holytime-final.vercel.app

👤 <b>Email:</b> ${customerEmail}
📦 <b>Product:</b> ${productName}
💰 <b>Amount:</b> ${amount} ${currency}
💳 <b>Payment:</b> ${paymentMethod}
🌍 <b>Country:</b> ${country}
📍 <b>Address:</b> ${address}
🧾 <b>ID:</b> ${transactionId}
🕒 <b>Date:</b> ${date}`);

    if (!resendKey || !productId || customerEmail === "unknown") {
      return new Response("OK", { status: 200 });
    }

    const downloadLink = PRODUCT_LINKS[productId];

    if (!downloadLink) {
      return new Response("OK", { status: 200 });
    }

    const resend = new Resend(resendKey);

    await resend.emails.send({
      from: "Holytime Learning <onboarding@resend.dev>",
      to: customerEmail,
      subject: `Your digital product: ${productName}`,
      html: `
        <h2>Thank you for your purchase</h2>
        <p>Your digital product is ready.</p>
        <p><strong>${productName}</strong></p>
        <p><a href="${downloadLink}">Download your files here</a></p>
      `,
    });

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Paddle webhook error:", error);
    return new Response("OK", { status: 200 });
  }
}