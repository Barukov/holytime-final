"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

const products: any = {
  product159: {
    name: "Essential Learning Pack",
    price: "€159",
    tag: "Special offer",
  },
  product161: {
    name: "Professional Learning Pack",
    price: "€161",
    tag: "Special offer",
  },
  product199: {
    name: "Elite Trading Pack",
    price: "€199",
    tag: "Best value",
  },
  starter: {
    name: "Starter Learning Pack",
    price: "€219",
    tag: "For beginners",
  },
  product245: {
    name: "Ultimate Learning Pack",
    price: "€245",
    tag: "Advanced",
  },
  advanced: {
    name: "Advanced Learning Pack",
    price: "€250",
    tag: "Most popular",
  },
  product255: {
    name: "Master Resource Pack",
    price: "€255",
    tag: "Premium choice",
  },
  premium: {
    name: "Premium Resource Bundle",
    price: "€500",
    tag: "Premium",
  },
};

const faq = [
  ["What do I receive?", "You receive PDF guides, templates, worksheets, planners and checklists."],
  ["How is it delivered?", "Delivery is made by email after successful payment confirmation."],
  ["Can I get a refund?", "We offer a 14-day refund policy. If you are not satisfied, you can request a refund within 14 days of purchase."],
  ["Is payment secure?", "Yes, payment is processed securely through Paddle checkout."],
];

export default function ProductPage() {
  const { slug } = useParams();
  const product = products[slug as string];

  const [cart, setCart] = useState(false);
  const [email, setEmail] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [loading, setLoading] = useState(false);

  if (!product) return <main className="p-10">Product not found</main>;

  const canPay = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handlePayment = async () => {
    if (!canPay || loading) return;

    setLoading(true);

    try {
      const res = await fetch("/api/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          productId: slug,
        }),
      });

      const data = await res.json();

      if (!data.checkoutUrl) {
        alert("Payment error");
        return;
      }

      window.location.href = data.checkoutUrl;
    } catch (error) {
      console.error(error);
      alert("Payment error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f3f0ff] text-[#090522]">
      <section className="bg-[#13083d] px-8 py-8 text-white">
        <header className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="text-3xl font-black">
            HOLYTIME
          </Link>

          <button
            onClick={() => setCart(true)}
            className="rounded-full bg-[#6645e8] px-7 py-3 font-bold"
          >
            Add to cart
          </button>
        </header>

        <div className="mx-auto grid max-w-7xl items-center gap-14 py-20 lg:grid-cols-2">
          <div>
            <p className="font-bold text-[#9c7cff]">{product.tag}</p>

            <h1 className="mt-5 text-6xl font-black leading-[0.95] md:text-7xl">
              {product.name}
            </h1>

            <p className="mt-6 text-xl leading-9 text-white/75">
              Premium digital learning pack with structured guides, templates,
              worksheets, checklists and planning resources for personal study.
              <br />
              <br />
              By purchasing, you agree to our{" "}
              <Link href="/rules" className="underline">terms</Link>,{" "}
              <Link href="/delivery" className="underline">delivery</Link> and{" "}
              <Link href="/refund-policy" className="underline">refund policy</Link>.
            </p>

            <p className="mt-8 text-6xl font-black text-[#9c7cff]">
              {product.price}
            </p>

            <div className="mt-8 flex gap-4">
              <button
                onClick={() => setCart(true)}
                className="rounded-2xl bg-[#6645e8] px-9 py-4 font-bold"
              >
                Add to cart
              </button>

              <a
                href="#details"
                className="rounded-2xl bg-white px-9 py-4 font-bold text-black"
              >
                View details
              </a>
            </div>
          </div>

          <div className="rounded-[28px] bg-white p-3 shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80"
              className="h-[420px] w-full rounded-[22px] object-cover"
              alt={product.name}
            />
          </div>
        </div>
      </section>

      <section id="details" className="px-8 py-24">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-5xl font-black">
            What’s inside <span className="text-[#7657e8]">the pack?</span>
          </h2>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {["PDF guides", "Worksheets", "Study planner", "Checklists", "Templates", "Progress tracker"].map((x) => (
              <div key={x} className="rounded-[14px] bg-white p-5 font-bold shadow-sm">
                ✓ {x}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-8 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-5xl font-black">FAQ</h2>

          <div className="mt-10 space-y-5">
            {faq.map(([q, a], i) => (
              <div key={q} className="rounded-[10px] border bg-white/50">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full justify-between px-8 py-7 text-left text-2xl"
                >
                  <span>{q}</span>
                  <span>{openFaq === i ? "−" : "⌄"}</span>
                </button>

                {openFaq === i && (
                  <p className="px-8 pb-7 text-lg text-black/60">{a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {cart && (
        <div className="fixed inset-0 z-50 flex">
          <div onClick={() => setCart(false)} className="flex-1 bg-black/50" />

          <aside className="flex h-full w-[420px] flex-col bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-2xl font-black">Your cart</h3>
              <button onClick={() => setCart(false)} className="text-xl">
                ✕
              </button>
            </div>

            <div className="mt-6">
              <p className="font-black">{product.name}</p>
              <p className="text-sm text-black/60">Digital product</p>
              <p className="mt-2 font-bold">{product.price}</p>
            </div>

            <div className="mt-8">
              <p className="mb-2 text-sm font-bold">Delivery email</p>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full rounded-lg border px-4 py-3"
              />
            </div>

            <button
              onClick={handlePayment}
              disabled={!canPay || loading}
              className={`mt-auto rounded-xl py-4 font-black ${
                canPay ? "bg-black text-white" : "bg-black/10 text-black/40"
              }`}
            >
              {loading ? "Opening checkout..." : canPay ? "Proceed to payment" : "Enter email first"}
            </button>

            <p className="mt-4 text-center text-xs text-black/40">
              Secure checkout powered by Paddle
            </p>
          </aside>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between border-t bg-white p-4">
        <div>
          <p className="font-bold">{product.name}</p>
          <p className="text-black/60">{product.price}</p>
        </div>

        <button
          onClick={() => setCart(true)}
          className="rounded-xl bg-[#6541df] px-6 py-3 font-bold text-white"
        >
          Buy now
        </button>
      </div>
    </main>
  );
}