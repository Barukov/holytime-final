"use client";

import Script from "next/script";

declare global {
  interface Window {
    Paddle: any;
  }
}

export default function PaddleProvider() {
  return (
    <Script
      src="https://cdn.paddle.com/paddle/v2/paddle.js"
      strategy="afterInteractive"
      onLoad={() => {
        window.Paddle.Environment.set("production");
        window.Paddle.Initialize({
          token: "live_c0bb423aebbbe5671abf6d87cd4",
        });
      }}
    />
  );
}