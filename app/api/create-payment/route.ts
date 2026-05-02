import { NextResponse } from "next/server";
import createMollieClient from "@mollie/api-client";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.MOLLIE_API_KEY;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    if (!apiKey || !baseUrl) {
      return NextResponse.json({ error: "Missing env" }, { status: 500 });
    }

    const { productId, name, priceValue, customerEmail } = await req.json();

    if (!productId || !name || !priceValue || !customerEmail) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const mollie = createMollieClient({ apiKey });

    const payment = await mollie.payments.create({
      amount: {
        currency: "EUR",
        value: priceValue,
      },
      description: `Holytime Learning - ${name}`,
      redirectUrl: `${baseUrl}/success`,
      webhookUrl: `${baseUrl}/api/mollie-webhook`,
      metadata: {
        productId,
        productName: name,
        customerEmail,
      },
    });

    return NextResponse.json({
      checkoutUrl: payment.getCheckoutUrl(),
      paymentId: payment.id,
    });
  } catch (error) {
    console.error("Create payment error:", error);
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 });
  }
}