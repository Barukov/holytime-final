import { NextResponse } from "next/server";

export async function POST() {
  try {
    const res = await fetch("https://api.paddle.com/transactions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PADDLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [
          {
            price_id: "pri_01kqstdk4f4h6xm4nf0eqjqhms",
            quantity: 1,
          },
        ],
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Paddle error:", data);
      return NextResponse.json({ error: data }, { status: 500 });
    }

    return NextResponse.json({
      checkoutUrl: data.data.checkout.url,
    });
  } catch (error) {
    console.error("Create Paddle checkout error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}