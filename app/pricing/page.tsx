import Link from "next/link";

const products = [
  ["product161", "Professional Digital Pack", "€161", "Advanced worksheets, trackers and premium materials."],
  ["product199", "Elite Learning Pack", "€199", "Educational materials, structured learning resources and practical study guides."],
  ["starter", "Starter Digital Pack", "€219", "PDF guides, checklists, note templates and study planners."],
  ["product245", "Ultimate Learning Pack", "€245", "Advanced guides, templates, worksheets and structured learning resources."],
  ["product159", "Essential Digital Pack", "€249", "Core guides, templates and study resources."],
  ["advanced", "Advanced Digital Pack", "€250", "Worksheets, examples, progress trackers and structured resources."],
  ["product255", "Master Resource Pack", "€255", "Premium materials, advanced resources, templates and study systems."],
  ["premium", "Premium Digital Bundle", "€500", "Full digital resource library with guides, templates, worksheets and bonuses."],
];

const deliverables = [
  "PDF guides",
  "Worksheets",
  "Study planners",
  "Checklists",
  "Templates",
  "Progress trackers",
  "Digital resource files delivered by email",
];

export default function PricingPage() {
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

      <section className="mx-auto max-w-7xl px-8 py-24">
        <div className="mb-12 max-w-3xl">
          <p className="font-black uppercase tracking-[0.25em] text-[#7657e8]">
            Pricing
          </p>
          <h1 className="mt-4 text-6xl font-black">Products and pricing</h1>
          <p className="mt-6 text-lg leading-8 text-black/60">
            Holytime sells digital learning products through https://holytime.auction/.
            All purchases are digital products delivered by email after successful
            payment confirmation.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {products.map(([slug, name, price, desc]) => (
            <Link
              key={slug}
              href={`/product/${slug}`}
              className="flex min-h-[350px] flex-col rounded-[20px] bg-white p-8 shadow-xl transition duration-300 hover:-translate-y-2"
            >
              <p className="text-sm font-black uppercase tracking-[0.2em] text-[#7657e8]">
                Digital product
              </p>
              <h2 className="mt-5 min-h-[76px] text-3xl font-black">{name}</h2>
              <p className="mt-5 min-h-[96px] leading-8 text-black/60">{desc}</p>
              <p className="mt-auto text-5xl font-black">{price}</p>
              <div className="mt-8 rounded-2xl bg-[#6541df] px-6 py-4 text-center font-bold text-white">
                View product
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 rounded-[28px] bg-white p-8 shadow-xl">
          <h2 className="text-4xl font-black">Deliverables included</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {deliverables.map((item) => (
              <div key={item} className="rounded-[16px] bg-[#f3f0ff] p-5 font-bold">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

