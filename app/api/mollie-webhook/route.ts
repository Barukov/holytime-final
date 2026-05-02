import createMollieClient from "@mollie/api-client";
import { Resend } from "resend";

const PRODUCT_LINKS: Record<string, string> = {
  starter: "https://drive.google.com/your-starter-file-link",
  advanced: "https://drive.google.com/your-advanced-file-link",
  premium: "https://drive.google.com/your-premium-file-link",
};

export async function POST(req: Request) {
  try {
    console.log("WEBHOOK HIT");

    const mollieKey = process.env.MOLLIE_API_KEY;
    const resendKey = process.env.RESEND_API_KEY;

    if (!mollieKey || !resendKey) {
      console.error("Missing env:", { mollieKey: !!mollieKey, resendKey: !!resendKey });
      return new Response("OK", { status: 200 });
    }

    const formData = await req.formData();
    const paymentId = formData.get("id") as string | null;

    console.log("PAYMENT ID:", paymentId);

    if (!paymentId) return new Response("OK", { status: 200 });

    const mollie = createMollieClient({ apiKey: mollieKey });
    const payment = await mollie.payments.get(paymentId);

    console.log("STATUS:", payment.status);
    console.log("METADATA:", payment.metadata);

    if (payment.status !== "paid") return new Response("OK", { status: 200 });

    const metadata = payment.metadata as any;

    const productId = metadata?.productId;
    const productName = metadata?.productName || "Digital product";
    const customerEmail = metadata?.customerEmail;

    console.log("EMAIL:", customerEmail);
    console.log("PRODUCT:", productId);

    if (!productId || !customerEmail) {
      console.error("Missing metadata:", payment.metadata);
      return new Response("OK", { status: 200 });
    }

    const downloadLink = PRODUCT_LINKS[productId];

    if (!downloadLink) {
      console.error("No product link for:", productId);
      return new Response("OK", { status: 200 });
    }

    const resend = new Resend(resendKey);

    const result = await resend.emails.send({
      from: "Holytime Learning <onboarding@resend.dev>",
      to: customerEmail,
      subject: `Your digital product: ${productName}`,
      html: `
        <h2>Thank you for your purchase</h2>
        <p>Your digital product is ready.</p>
        <p><strong>${productName}</strong></p>
        <p><a href="${downloadLink}">Download your files here</a></p>
        <p>${downloadLink}</p>
      `,
    });

    console.log("RESEND RESULT:", result);

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response("OK", { status: 200 });
  }
}