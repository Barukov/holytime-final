import Link from "next/link";
import { redirect } from "next/navigation";

type SuccessPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
};

const SUCCESS_STATUSES = new Set(["billed", "paid", "completed"]);

async function isPaidTransaction(transactionId: string) {
  const apiKey = process.env.PADDLE_API_KEY;

  if (!apiKey || !transactionId.startsWith("txn_")) {
    return false;
  }

  try {
    const res = await fetch(`https://api.paddle.com/transactions/${transactionId}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return false;
    }

    const data = await res.json();
    return SUCCESS_STATUSES.has(String(data?.data?.status || "").toLowerCase());
  } catch (error) {
    console.error("Paddle transaction verify error:", error);
    return false;
  }
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const params = await Promise.resolve(searchParams || {});
  const transactionParam = params.txn || params.transaction_id;
  const transactionId = Array.isArray(transactionParam) ? transactionParam[0] : transactionParam;

  if (!transactionId || !(await isPaidTransaction(transactionId))) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
      <div className="max-w-xl text-center">
        <h1 className="mb-4 text-4xl font-black">Order received</h1>

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
