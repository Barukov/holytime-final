import Link from "next/link";

export default function RefundPolicy() {
  return (
    <main className="min-h-screen bg-gradient-to-r from-[#eee8ff] via-white to-[#e8eeff] text-[#090522]">
      <header className="bg-[#13083d] px-8 py-8 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="text-3xl font-black">HOLYTIME</Link>
          <Link href="/" className="rounded-full bg-[#6541df] px-7 py-3 font-bold">Back home</Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-8 py-24">
        <div className="rounded-[34px] bg-white p-10 shadow-2xl">
          <p className="font-black uppercase tracking-[0.25em] text-[#7657e8]">Policy</p>
          <h1 className="mt-4 text-6xl font-black">Refund Policy</h1>

          <div className="mt-10 space-y-6 text-lg leading-8 text-black/65">
            <p>Because Holytime products are digital, refunds are not available after the product has been delivered.</p>
            <p>If you entered the wrong email or did not receive your product, contact support with your payment details.</p>
            <p>We will help resend your digital product to the correct email address.</p>
          </div>

          <Link href="/contact" className="mt-10 inline-block rounded-2xl bg-[#6541df] px-8 py-4 font-black text-white">
            Contact support
          </Link>
        </div>
      </section>
    </main>
  );
}