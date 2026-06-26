"use client";

import Link from "next/link";
import Script from "next/script";
import { useCallback, useEffect, useState } from "react";

declare global {
  interface Window {
    Paddle?: {
      Environment?: { set: (environment: string) => void };
      Initialize: (options: unknown) => void;
      Checkout: { open: (options: unknown) => void };
    };
    __holytimePaddleReady?: boolean;
  }
}

const PADDLE_CLIENT_TOKEN = "live_c0bb423aebbbe5671abf6d87cd4";

export default function CheckoutPage() {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [message, setMessage] = useState("Preparing secure checkout...");

  const getTransactionId = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("_ptxn") || params.get("txn") || params.get("transaction_id");
  }, []);

  const openCheckout = useCallback(() => {
    const transactionId = getTransactionId();

    if (!transactionId) {
      setMessage("Checkout link is missing. Please go back and try again.");
      return;
    }

    if (!window.Paddle) {
      setMessage("Checkout is still loading. Please try again in a moment.");
      return;
    }

    try {
      window.Paddle.Environment?.set("production");

      if (!window.__holytimePaddleReady) {
        window.Paddle.Initialize({
          token: PADDLE_CLIENT_TOKEN,
          checkout: {
            settings: {
              displayMode: "overlay",
              theme: "light",
              locale: "en",
              successUrl: `${window.location.origin}/success?txn=${encodeURIComponent(transactionId)}`,
            },
          },
        });
        window.__holytimePaddleReady = true;
      }

      window.Paddle.Checkout.open({
        transactionId,
        settings: {
          displayMode: "overlay",
          theme: "light",
          locale: "en",
          successUrl: `${window.location.origin}/success?txn=${encodeURIComponent(transactionId)}`,
        },
      });

      setMessage("Checkout is open. Complete payment in the secure Paddle window.");
    } catch (error) {
      console.error("Paddle checkout open error:", error);
      setMessage("Could not open checkout. Please try the button below.");
    }
  }, [getTransactionId]);

  useEffect(() => {
    if (scriptLoaded) {
      openCheckout();
    }
  }, [openCheckout, scriptLoaded]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
      <Script
        src="https://cdn.paddle.com/paddle/v2/paddle.js"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />

      <div className="max-w-xl text-center">
        <h1 className="mb-4 text-4xl font-black">Secure checkout</h1>

        <p className="mb-8 text-white/70">{message}</p>

        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={openCheckout}
            className="rounded-xl bg-white px-6 py-3 font-bold text-black transition hover:bg-white/90"
          >
            Open checkout
          </button>

          <Link
            href="/"
            className="rounded-xl border border-white/25 px-6 py-3 font-bold text-white transition hover:bg-white/10"
          >
            Back to products
          </Link>
        </div>
      </div>
    </main>
  );
}
