export default function SuccessPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white px-6">
      <div className="max-w-xl text-center">
        <h1 className="text-4xl font-black mb-4">Payment successful ✅</h1>
        <p className="text-white/70 mb-6">
          Thank you for your purchase. Your digital product will be sent to your email shortly.
        </p>
        <a
          href="/"
          className="inline-block rounded-xl bg-white text-black px-6 py-3 font-bold"
        >
          Back to home
        </a>
      </div>
    </main>
  );
}