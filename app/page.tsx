"use client";

import Link from "next/link";
import { useState } from "react";

const products = [
  ["starter", "Starter Learning Pack", "€49", "PDF guides, checklists, notes templates and study planners."],
  ["advanced", "Advanced Learning Pack", "€149", "Worksheets, examples, progress trackers and structured resources."],
  ["premium", "Premium Resource Bundle", "€219", "Full library with guides, templates, worksheets and bonuses."],
];

const faq = [
  ["What do I receive?", "PDF guides, templates, worksheets, planners and checklists."],
  ["How does delivery work?", "After payment, delivery goes to your email."],
  ["Is payment secure?", "Yes, checkout is processed through Paddle."],
  ["Can I get a refund?", "Digital products are not refundable after delivery."],
];

export default function Page() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <main className="min-h-screen overflow-hidden bg-[#f3f0ff] text-[#090522]">
      <section className="relative bg-[#13083d] text-white">
        <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-[#6541df]/40 blur-[140px]" />
        <div className="absolute right-0 top-40 h-[500px] w-[500px] rounded-full bg-cyan-400/20 blur-[140px]" />

        <header className="relative mx-auto flex max-w-7xl items-center justify-between px-8 py-8">
          <Link href="/" className="text-3xl font-black">HOLYTIME</Link>

          <nav className="hidden gap-8 text-sm font-bold md:flex">
            <a href="#products">Products</a>
            <a href="#video">Video</a>
            <a href="#faq">FAQ</a>
            <Link href="/delivery">Delivery</Link>
            <Link href="/contact">Contact</Link>
          </nav>

          <a href="#products" className="rounded-full bg-[#6645e8] px-7 py-3 font-bold transition hover:scale-105">
            Shop now
          </a>
        </header>

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-8 pb-28 pt-20 lg:grid-cols-2">
          <div className="animate-fade">
            <p className="mb-5 font-bold text-[#9c7cff]">Premium digital learning products</p>

            <h1 className="text-6xl font-black leading-[0.95] md:text-7xl">
              Digital Learning
              <br />
              <span className="text-[#9c7cff]">Made Premium</span>
            </h1>

            <p className="mt-7 max-w-xl border-l-2 border-[#9c7cff] pl-5 text-lg leading-8 text-white/75">
              Structured guides, templates, worksheets and planners delivered by email after secure checkout.
            </p>

            <div className="mt-9 flex flex-wrap gap-5">
              <a href="#products" className="rounded-full bg-[#6645e8] px-9 py-4 font-bold transition hover:scale-105">
                View Products
              </a>

              <a href="#video" className="rounded-full bg-white px-9 py-4 font-bold text-black transition hover:scale-105">
                Watch Video
              </a>
            </div>

            <div className="mt-10 flex flex-wrap gap-5 text-sm text-white/70">
              <span>✔ 2,400+ customers</span>
              <span>✔ 5.0 rating</span>
              <span>✔ Secure checkout</span>
              <span>✔ Instant delivery</span>
            </div>
          </div>

          <div className="animate-float">
            <div className="rounded-[30px] border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur">
              <img
                src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80"
                className="h-[380px] w-full rounded-[22px] object-cover"
                alt="Preview"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="video" className="bg-gradient-to-r from-[#eee8ff] via-white to-[#e8eeff] px-8 py-24">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-5xl font-black">
            Product <span className="text-[#7657e8]">Preview</span>
          </h2>

          <div className="mt-10 overflow-hidden rounded-[28px] border-4 border-[#6541df] bg-black shadow-2xl">
            <iframe
              className="aspect-video w-full"
              src="https://www.youtube.com/embed/NEUsYT__hRc"
              title="Product preview"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      <section id="products" className="bg-gradient-to-r from-[#eee8ff] via-white to-[#e8eeff] px-8 py-24">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-5xl font-black">
            Choose your <span className="text-[#7657e8]">product</span>
          </h2>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {products.map(([slug, name, price, desc], i) => (
              <Link
                key={slug}
                href={`/product/${slug}`}
                className={`group rounded-[20px] bg-white p-8 shadow-xl transition duration-300 hover:-translate-y-3 hover:shadow-[0_0_80px_rgba(102,69,232,.45)] ${
                  i === 1 ? "ring-4 ring-[#6541df]/30" : ""
                }`}
              >
                <p className="text-sm font-black uppercase tracking-[0.2em] text-[#7657e8]">
                  {i === 1 ? "Most popular" : "Digital product"}
                </p>

                <h3 className="mt-5 text-3xl font-black">{name}</h3>
                <p className="mt-5 min-h-[100px] leading-8 text-black/60">{desc}</p>
                <p className="mt-6 text-5xl font-black">{price}</p>

                <div className="mt-8 rounded-2xl bg-[#6541df] px-6 py-4 text-center font-bold text-white transition group-hover:scale-105">
                  View product
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="bg-gradient-to-r from-[#eee8ff] via-white to-[#e8eeff] px-8 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 flex items-center justify-between gap-6">
            <h2 className="text-5xl font-black">
              Frequently Asked
              <br />
              <span className="text-[#7657e8]">Questions</span>
            </h2>

            <Link
              href="/contact"
              className="rounded-2xl bg-[#6541df] px-10 py-4 font-bold text-white transition hover:scale-105"
            >
              CONTACT US
            </Link>
          </div>

          <div className="space-y-5">
            {faq.map(([q, a], i) => (
              <div key={q} className="rounded-xl border border-[#090522] bg-white/50 transition hover:bg-white">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="flex w-full justify-between px-8 py-7 text-left text-2xl"
                >
                  {q}
                  <span className={`transition ${open === i ? "rotate-180" : ""}`}>⌄</span>
                </button>

                <div className={`overflow-hidden transition-all duration-300 ${open === i ? "max-h-40 px-8 pb-7" : "max-h-0 px-8"}`}>
                  <p className="text-lg leading-8 text-black/60">{a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-[#13083d] px-8 py-10 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-4 text-sm text-white/60">
          <p>© Holytime · Digital products only</p>

          <div className="flex gap-5">
            <Link href="/rules">Rules</Link>
            <Link href="/refund-policy">Refund</Link>
            <Link href="/delivery">Delivery</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes fade {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-18px); }
        }

        .animate-fade {
          animation: fade .8s ease-out both;
        }

        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}