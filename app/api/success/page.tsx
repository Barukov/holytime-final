export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
        <h1 className="text-3xl font-bold">Payment received</h1>
        <p className="mt-4 text-white/70">
          We are checking your payment status. If everything is successful, your order will be processed shortly.
        </p>
      </div>
    </div>
  );
}