import { Resend } from "resend";

const PRODUCT_LINKS: Record<string, string> = {
  starter: "https://drive.google.com/your-starter-file-link",
  advanced: "https://drive.google.com/your-advanced-file-link",
  premium: "https://drive.google.com/your-premium-file-link",
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const eventType = body.event_type;
    const data = body.data || {};
    const customData = data.custom_data || {};

    const resendKey = process.env.RESEND_API_KEY;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    const productId = customData.productId;
    const productName = customData.productName || "Digital product";

    const customerEmail =
      data.customer?.email ||
      customData.customerEmail ||
      data.customer_email ||
      "unknown";

    const country =
      data.customer?.address?.country_code ||
      data.billing_details?.address?.country_code ||
      data.address?.country_code ||
      "unknown";

    const addressData =
      data.customer?.address ||
      data.billing_details?.address ||
      data.address ||
      {};

    const address =
      [
        addressData.first_line,
        addressData.city,
        addressData.postal_code,
        addressData.country_code,
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

    async function sendTelegram(text: string) {
      if (!botToken || !chatId) return;

      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text,
        }),
      });
    }

    if (eventType === "transaction.payment_failed") {
      await sendTelegram(`❌ ОПЛАТА ОТКЛОНЕНА

Email: ${customerEmail}
Страна: ${country}
Адрес: ${address}
Метод оплаты: ${paymentMethod}
Причина: ${declineReason}`);

      return new Response("OK", { status: 200 });
    }

    if (eventType !== "transaction.completed") {
      return new Response("OK", { status: 200 });
    }

    await sendTelegram(`✅ ОПЛАТА УСПЕШНА

Email: ${customerEmail}
Страна: ${country}
Адрес: ${address}
Метод оплаты: ${paymentMethod}
Сумма: ${amount} ${currency}
Продукт: ${productName}`);

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