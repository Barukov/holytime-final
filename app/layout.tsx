import Script from "next/script";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Holytime",
  description: "Digital products",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}

        {/* 🔥 ПОДКЛЮЧАЕМ PADDLE */}
        <Script
          src="https://cdn.paddle.com/paddle/v2/paddle.js"
          strategy="afterInteractive"
        />

        {/* 🔥 ИНИЦИАЛИЗАЦИЯ */}
        <Script id="paddle-init" strategy="afterInteractive">
          {`
            Paddle.Environment.set("production");
            Paddle.Initialize({
              token: "live_c0bb423aebbbe5671abf6d87cd4"
            });
          `}
        </Script>
      </body>
    </html>
  );
}