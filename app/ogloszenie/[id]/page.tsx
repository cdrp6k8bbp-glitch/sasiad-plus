import Link from "next/link";
import { notFound } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import OwnerSummary from "@/components/OwnerSummary";

type Listing = {
  id: number;
  title: string;
  category: string;
  description: string;
  price: string;
  location: string;
  icon: string;
};

const categoryNames: Record<string, string> = {
  sprzet: "Sprzęt",
  usluga: "Pomoc sąsiedzka",
  pomoc: "Pomoc sąsiedzka",
  zwierzeta: "Opieka nad zwierzętami",
  dzieci: "Opieka nad dziećmi",
  turystyka: "Turystyka",
  ogrod: "Ogród",
  dom: "Dom",
};

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listingId = Number(id);

  if (!Number.isInteger(listingId) || listingId < 1) {
    notFound();
  }

  const { env } = await getCloudflareContext({ async: true });

  const listing = await env.DB.prepare(
    `SELECT id, title, category, description, price, location, icon
     FROM listings
     WHERE id = ?
     LIMIT 1`,
  )
    .bind(listingId)
    .first<Listing>();

  if (!listing) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#f7faf8] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
          <Link href="/" className="text-2xl font-black text-green-700">
            Sąsiad+
          </Link>

          <Link
            href="/dodaj"
            className="rounded-full bg-green-700 px-5 py-3 font-semibold text-white"
          >
            + Dodaj ogłoszenie
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <Link href="/" className="font-semibold text-green-700 hover:underline">
          ← Wróć
        </Link>

        <div className="mt-7 grid gap-8 lg:grid-cols-[1.5fr_0.8fr]">
          <section>
            <div className="flex min-h-[360px] items-center justify-center rounded-[36px] bg-gradient-to-br from-green-50 to-emerald-100 md:min-h-[500px]">
              <span className="text-9xl">{listing.icon}</span>
            </div>

            <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 md:p-8">
              <p className="text-sm font-bold uppercase tracking-wider text-green-700">
                {categoryNames[listing.category] ?? listing.category}
              </p>

              <h1 className="mt-3 text-3xl font-black md:text-5xl">
                {listing.title}
              </h1>

              <p className="mt-4 text-lg text-slate-500">
                📍 {listing.location}
              </p>

              <div className="mt-8 border-t border-slate-200 pt-7">
                <h2 className="text-2xl font-black">Opis ogłoszenia</h2>

                <p className="mt-4 whitespace-pre-wrap leading-8 text-slate-600">
                  {listing.description ||
                    "Autor nie dodał szczegółowego opisu."}
                </p>
              </div>
            </div>
          </section>

          <aside>
            <div className="sticky top-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
              <p className="text-sm text-slate-500">Cena</p>

              <p className="mt-1 text-3xl font-black text-green-700">
                {listing.price}
              </p>

              <div className="mt-6 rounded-2xl bg-green-50 p-4 text-green-800">
                <p className="font-bold">🟢 Dostępne</p>
                <p className="mt-1 text-sm">
                  Ustal termin bezpośrednio z właścicielem.
                </p>
              </div>

              <button
                type="button"
                className="mt-6 w-full rounded-2xl bg-green-700 px-6 py-4 font-bold text-white hover:bg-green-800"
              >
                Zapytaj właściciela
              </button>

              <div className="mt-6 border-t border-slate-200 pt-6">
                <OwnerSummary />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
