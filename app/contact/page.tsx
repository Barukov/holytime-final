import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gradient-to-r from-[#eee8ff] via-white to-[#e8eeff] text-[#090522]">
      
      {/* HEADER */}
      <header className="bg-[#13083d] px-8 py-8 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="text-3xl font-black">
            HOLYTIME
          </Link>

          <Link
            href="/"
            className="rounded-full bg-[#6645e8] px-7 py-3 font-bold transition hover:scale-105"
          >
            Back home
          </Link>
        </div>
      </header>

      {/* CONTENT */}
      <section className="mx-auto grid max-w-7xl gap-12 px-8 py-24 lg:grid-cols-[0.8fr_1.2fr]">
        
        {/* LEFT */}
        <div>
          <h1 className="text-6xl font-black leading-tight">
            Contact <span className="text-[#7657e8]">Support</span>
          </h1>

          <p className="mt-6 text-lg leading-8 text-black/60">
            Have a question about delivery, payment or your product?
            Send a message and we will reply.
          </p>

          <div className="mt-10 space-y-6">
            <div className="rounded-[22px] bg-white p-7 shadow-xl">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-[#7657e8]">
                Email
              </p>
              <p className="mt-3 text-2xl font-black">
                support@holytime.store
              </p>
            </div>

            <div className="rounded-[22px] bg-white p-7 shadow-xl">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-[#7657e8]">
                Response time
              </p>
              <p className="mt-3 text-2xl font-black">24–48 hours</p>
            </div>
          </div>
        </div>

        {/* FORM */}
        <form
          action="https://formspree.io/f/mbdwlvbv" // ← ВСТАВЬ СВОЮ ССЫЛКУ
          method="POST"
          className="rounded-[30px] bg-white p-8 shadow-2xl"
        >
          <h2 className="text-4xl font-black">Send a message</h2>

          <div className="mt-8 space-y-5">
            <input
              name="name"
              placeholder="Your name"
              required
              className="w-full rounded-xl border border-black/15 px-5 py-4 outline-none focus:border-[#6541df]"
            />

            <input
              name="email"
              type="email"
              placeholder="Your email"
              required
              className="w-full rounded-xl border border-black/15 px-5 py-4 outline-none focus:border-[#6541df]"
            />

            <textarea
              name="message"
              placeholder="Your message"
              rows={7}
              required
              className="w-full rounded-xl border border-black/15 px-5 py-4 outline-none focus:border-[#6541df]"
            />

            <button
              type="submit"
              className="w-full rounded-2xl bg-[#6541df] px-8 py-4 font-black text-white transition hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(102,69,232,.4)]"
            >
              Send message
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}