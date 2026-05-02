import createMollieClient from "@mollie/api-client";
import { Resend } from "resend";

const PRODUCT_LINKS: Record<string, string> = {
  starter: "https://drive.google.com/your-starter-file-link",
  advanced: "https://drive.google.com/your-advanced-file-link",
  premium: "https://drive.google.com/your-premium-file-link",
};

export async function POST(req: Request) {
  try {
    const mollieKey = process.env.MOLLIE_API_KEY;
    const resendKey = process.env.RESEND_API_KEY;

    if (!mollieKey || !resendKey) {
      return new Response("Missing env", { status: 500 });
    }

    const formData = await req.formData();
    const paymentId = formData.get("id") as string | null;

    if (!paymentId) {
      return new Response("OK", { status: 200 });
    }

    const mollie = createMollieClient({ apiKey: mollieKey });
    const payment = await mollie.payments.get(paymentId);

    if (payment.status !== "paid") {
      return new Response("OK", { status: 200 });
    }

    const metadata = payment.metadata as {
      productId?: string;
      productName?: string;
      customerEmail?: string;
    } | null;

    const productId = metadata?.productId;
    const productName = metadata?.productName;
    const customerEmail = metadata?.customerEmail;

    if (!productId || !productName || !customerEmail) {
      console.error("Missing metadata:", payment.metadata);
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
      to: [customerEmail],
      subject: `Your digital product: ${productName}`,
      html: `
        <h2>Thank you for your purchase</h2>
        <p>Your digital product is ready.</p>
        <p><strong>${productName}</strong></p>
        <p><a href="${downloadLink}">Download your files here</a></p>
        <p>If the button does not work, copy this link:</p>
        <p>${downloadLink}</p>
        <br />
        <p>Support: sofieww86@gmail.com</p>
      `,
    });

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response("OK", { status: 200 });
  }
}