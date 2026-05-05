import { Resend } from "resend";

const PRODUCT_LINKS: Record<string, string> = {
  starter: "https://drive.google.com/your-starter-file-link",
  advanced: "https://drive.google.com/your-advanced-file-link",
  premium: "https://drive.google.com/your-premium-file-link",
};

export async function POST(req: Request) {
  try {
    console.log("PADDLE WEBHOOK HIT");

    const resendKey = process.env.RESEND_API_KEY;

    if (!resendKey) {
      console.error("Missing RESEND_API_KEY");
      return new Response("OK", { status: 200 });
    }

    const body = await req.json();

    console.log("EVENT:", body.event_type);

    if (body.event_type !== "transaction.completed") {
      return new Response("OK", { status: 200 });
    }

    const data = body.data;
    const customData = data.custom_data || {};

    const productId = customData.productId;
    const productName = customData.productName || "Digital product";
    const customerEmail =
      data.customer?.email || customData.customerEmail;

    if (!productId || !customerEmail) {
      console.error("Missing data:", { productId, customerEmail, customData });
      return new Response("OK", { status: 200 });
    }

    const downloadLink = PRODUCT_LINKS[productId];

    if (!downloadLink) {
      console.error("No product link for:", productId);
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