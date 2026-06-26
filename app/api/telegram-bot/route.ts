export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TIME_ZONE = "Europe/Kyiv";
const SUCCESS_STATUSES = new Set(["completed", "billed", "paid"]);

function tg(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function kyivDateKey(value: string | null | undefined) {
  if (!value) return "";

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

function formatMoney(amount: unknown, currency: unknown) {
  const value = Number(amount || 0) / 100;
  return `${value.toFixed(2)} ${String(currency || "EUR")}`;
}

function transactionNetAmount(transaction: any) {
  const payoutTotals = transaction.details?.payout_totals || transaction.details?.adjusted_payout_totals;
  const totals = transaction.details?.totals;

  if (payoutTotals?.earnings !== undefined && payoutTotals?.earnings !== null) {
    return {
      amount: Number(payoutTotals.earnings),
      currency: payoutTotals.currency_code || transaction.currency_code || totals?.currency_code || "EUR",
    };
  }

  if (totals?.fee !== undefined && totals?.fee !== null) {
    return {
      amount: Number(totals.grand_total || totals.total || 0) - Number(totals.fee || 0),
      currency: totals.currency_code || transaction.currency_code || "EUR",
    };
  }

  return {
    amount: Number(totals?.grand_total || totals?.total || 0),
    currency: totals?.currency_code || transaction.currency_code || "EUR",
  };
}

async function fetchAddress(transaction: any) {
  const apiKey = process.env.PADDLE_API_KEY;
  const customerId = transaction.customer_id;
  const addressId = transaction.address_id;

  if (!apiKey || !customerId || !addressId) {
    return { country: "unknown", postalCode: "" };
  }

  try {
    const res = await fetch(`https://api.paddle.com/customers/${customerId}/addresses/${addressId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
    });

    if (!res.ok) {
      return { country: "unknown", postalCode: "" };
    }

    const json = await res.json();

    return {
      country: json.data?.country_code || "unknown",
      postalCode: json.data?.postal_code || json.data?.zip_code || "",
    };
  } catch {
    return { country: "unknown", postalCode: "" };
  }
}

async function fetchTodayTransactions() {
  const apiKey = process.env.PADDLE_API_KEY;

  if (!apiKey) return [];

  const today = kyivDateKey(new Date().toISOString());
  let url = "https://api.paddle.com/transactions?per_page=100&order_by=created_at[DESC]";
  const transactions: any[] = [];

  for (let page = 0; page < 5 && url; page += 1) {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
    });

    if (!res.ok) break;

    const json = await res.json();
    const pageTransactions = Array.isArray(json.data) ? json.data : [];

    for (const transaction of pageTransactions) {
      const dateForReport = transaction.billed_at || transaction.created_at;
      const status = String(transaction.status || "").toLowerCase();

      if (kyivDateKey(dateForReport) === today && SUCCESS_STATUSES.has(status)) {
        transactions.push(transaction);
      }
    }

    const oldest = pageTransactions[pageTransactions.length - 1];
    if (oldest && kyivDateKey(oldest.created_at) !== today) break;

    url = json.meta?.pagination?.has_more ? json.meta.pagination.next : "";
  }

  return transactions;
}

async function buildTodayReport() {
  const transactions = await fetchTodayTransactions();
  const totals = new Map<string, number>();
  const lines: string[] = [];

  for (const transaction of transactions) {
    const { amount, currency } = transactionNetAmount(transaction);
    totals.set(currency, (totals.get(currency) || 0) + amount);
    const email = transaction.customer?.email || transaction.customer_email || transaction.custom_data?.email || "unknown";

    lines.push(`• ${tg(email)}`);
  }

  const totalText =
    [...totals.entries()]
      .map(([currency, amount]) => formatMoney(amount, currency))
      .join(", ") || "0.00 EUR";

  const date = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    dateStyle: "short",
  }).format(new Date());

  const body = lines.length ? lines.join("\n") : "No successful payments today.";
  const report = `<b>Holytime Final - Today (${tg(date)})</b>

Total after Paddle fee: <b>${tg(totalText)}</b>

${body}`;

  return report.length > 3900 ? `${report.slice(0, 3800)}\n\n...truncated` : report;
}

async function sendTelegram(chatId: string | number, text: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) return;

  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });
}

export async function POST(req: Request) {
  const update = await req.json().catch(() => null);
  const message = update?.message || update?.edited_message;
  const chatId = message?.chat?.id;
  const text = String(message?.text || "").trim().split(/\s+/)[0].split("@")[0].toLowerCase();

  if (!chatId) {
    return new Response("OK", { status: 200 });
  }

  if (text === "/today") {
    await sendTelegram(chatId, await buildTodayReport());
    return new Response("OK", { status: 200 });
  }

  if (text === "/help" || text === "/start") {
    await sendTelegram(chatId, "Command: /today");
  }

  return new Response("OK", { status: 200 });
}
