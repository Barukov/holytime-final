"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    Paddle: any;
  }
}

export default function PaddleProvider() {
  const pathname = usePathname();

  if (pathname === "/success" || pathname === "/api/success") {
    return null;
  }

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
