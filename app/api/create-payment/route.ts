import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PADDLE_PRICE_IDS: Record<string, string> = {
  starter: "pri_01kqstdk4f4h6xm4nf0eqjqhms",
  advanced: "pri_01kqstetc9k2t3jnpm7py0r4pt",
  premium: "pri_01ktrx34ezebz7kw9jgdgqyz9w",

  product159: "pri_01ksg242d7grz69xsaf7999hd5",
  product161: "pri_01ksg1ychgaeytf7yfftmrs99r",
  product199: "pri_01ksg1v9wq5gv0fkekpnk1r3sy",
  product245: "pri_01ksg4aqbr9743eq2ez4fday8g",
  product255: "pri_01ksg4fk56b63x123tnqegtr9q",
};

export async function POST(req: Request) {
  try {
    const { email, productId } = await req.json();

    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email));

    if (!validEmail || !productId) {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }

    const priceId = PADDLE_PRICE_IDS[String(productId)];

    if (!priceId) {
      return NextResponse.json(
        { error: "Product not configured" },
        { status: 400 }
      );
    }

    const apiKey = process.env.PADDLE_API_KEY;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    if (!apiKey || !siteUrl) {
      return NextResponse.json({ error: "Missing env" }, { status: 500 });
    }

    const sourceDomain = req.headers.get("host") || siteUrl;

    const res = await fetch("https://api.paddle.com/transactions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [
          {
            price_id: priceId,
            quantity: 1,
          },
        ],
        customer: {
          email,
        },
        custom_data: {
          productId,
          email,
          sourceDomain,
        },
        checkout: {
          url: `${siteUrl}/success`,
        },
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Paddle error:", data);
      return NextResponse.json(
        { error: "Paddle failed", details: data },
        { status: 500 }
      );
    }

    return NextResponse.json({
      checkoutUrl: data.data.checkout.url,
    });
  } catch (error) {
    console.error("Paddle checkout error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}