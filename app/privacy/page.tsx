import Link from "next/link";

const sections = [
  {
    title: "Information we collect",
    items: [
      "Email address used during checkout or support requests.",
      "Order, product and delivery information needed to provide your digital purchase.",
      "Support messages you send through the Contact page.",
      "Basic technical information such as browser, device, IP address and security logs when needed for fraud prevention and website security.",
    ],
  },
  {
    title: "How we use information",
    items: [
      "To deliver purchased digital products by email.",
      "To provide customer support, refund support and order lookup.",
      "To send purchase confirmations, delivery emails and important order updates.",
      "To prevent fraud, unauthorized access, abuse, chargebacks and policy violations.",
      "To comply with legal, tax, payment processor and compliance requirements.",
    ],
  },
  {
    title: "Payment information",
    items: [
      "Payments are processed securely through Paddle or another approved payment provider.",
      "We do not store full card numbers, bank authentication details or sensitive payment credentials on our website.",
      "Payment providers may process billing data, transaction data and fraud prevention signals according to their own policies.",
    ],
  },
  {
    title: "Sharing and retention",
    items: [
      "We do not sell your personal information.",
      "We share only the information needed with service providers such as payment processors, email delivery providers, hosting providers and fraud prevention tools.",
      "We retain order and support records only as long as needed for delivery, support, refunds, compliance, accounting and dispute prevention.",
    ],
  },
  {
    title: "Your choices",
    items: [
      "You may contact us to request access, correction or deletion of your personal information where legally available.",
      "Some records may need to be retained for payment, fraud prevention, tax, legal or accounting reasons.",
      "For privacy questions, contact us through the Contact page.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-r from-[#eee8ff] via-white to-[#e8eeff] text-[#090522]">
      <header className="bg-[#13083d] px-8 py-8 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="text-3xl font-black">HOLYTIME</Link>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="font-bold">Terms</Link>
            <Link href="/" className="rounded-full bg-[#6541df] px-7 py-3 font-bold">Back home</Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-8 py-24">
        <div className="rounded-[34px] bg-white p-10 shadow-2xl">
          <p className="font-black uppercase tracking-[0.25em] text-[#7657e8]">Privacy</p>
          <h1 className="mt-4 text-6xl font-black">Privacy Policy</h1>
          <p className="mt-6 text-lg leading-8 text-black/60">
            Last updated: June 10, 2026
          </p>

          <div className="mt-10 space-y-8 text-lg leading-8 text-black/65">
            <p>
              This Privacy Policy explains how Holytime collects, uses and
              protects information related to website visits, checkout, digital
              product delivery and customer support.
            </p>

            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-2xl font-black text-[#090522]">{section.title}</h2>
                <ul className="mt-3 space-y-3">
                  {section.items.map((item) => (
                    <li key={item} className="rounded-[16px] bg-[#f3f0ff] p-4">
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/terms" className="inline-block rounded-2xl bg-[#f3f0ff] px-8 py-4 font-black text-[#090522]">
              Terms and Conditions
            </Link>
            <Link href="/contact" className="inline-block rounded-2xl bg-[#6541df] px-8 py-4 font-black text-white">
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
