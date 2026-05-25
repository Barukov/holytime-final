import Link from "next/link";

export default function SuccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
      <div className="max-w-xl text-center">
        <h1 className="mb-4 text-4xl font-black">Order received ✅</h1>

        <p className="mb-6 text-white/70">
          If your payment was successful, your digital product will be sent to your email shortly.
        </p>

        <p className="mb-8 text-sm text-white/40">
          Please do not refresh or retry payment unless you did not complete checkout.
        </p>

        <Link
          href="/"
          className="inline-block rounded-xl bg-white px-6 py-3 font-bold text-black"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}