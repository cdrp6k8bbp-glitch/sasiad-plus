import Link from "next/link";
import type { Metadata } from "next";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { CATEGORIES, isCategoryKey } from "@/lib/categories";
import { getActiveDemands } from "@/lib/search-alerts";

export const metadata: Metadata = {
  title: "Lokalne zapotrzebowania",
  description:
    "Zobacz, czego szukają mieszkańcy Słupska i okolic, lub opublikuj własne zapotrzebowanie.",
  alternates: { canonical: "/zapotrzebowania" },
};

export const dynamic = "force-dynamic";

export default async function DemandsPage({ searchParams }: { searchParams: Promise<{ dodano?: string }> }) {
  const { env } = await getCloudflareContext({ async: true });
  const [demands, params] = await Promise.all([getActiveDemands(env.DB), searchParams]);

  return (
    <main className="min-h-screen bg-[#f7faf8] px-4 py-10 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link href="/" className="font-bold text-green-700 hover:underline">← Strona główna</Link>
            <h1 className="mt-5 text-4xl font-black">Czego szukają sąsiedzi?</h1>
            <p className="mt-2 text-slate-600">Zobacz lokalne zapotrzebowania i dodaj pasującą ofertę.</p>
          </div>
          <Link href="/zapotrzebowania/dodaj" className="rounded-full bg-green-700 px-6 py-3 font-black text-white">+ Dodaj zapotrzebowanie</Link>
        </div>
        {params.dodano === "1" && <p className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4 font-bold text-green-800">Zapotrzebowanie zostało opublikowane. Powiadomimy Cię o pasującej ofercie.</p>}

        {demands.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center"><p className="text-5xl">🔎</p><h2 className="mt-4 text-2xl font-black">Brak aktywnych zapotrzebowań</h2></div>
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {demands.map((demand) => {
              const category = demand.categories.split(",")[0];
              return <article key={demand.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-black text-green-700">{isCategoryKey(category) ? `${CATEGORIES[category].icon} ${CATEGORIES[category].label}` : "🔎 Zapotrzebowanie"}</p>
                <h2 className="mt-2 text-xl font-black">{demand.query}</h2>
                <p className="mt-2 text-sm font-semibold text-slate-500">📍 {demand.location} · do {demand.radius} km</p>
                {demand.description && <p className="mt-4 leading-7 text-slate-600">{demand.description}</p>}
                <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <Link href={`/u/${demand.user_id}`} className="font-bold text-green-700 hover:underline">{demand.user_name}</Link>
                  <Link href={`/dodaj`} className="rounded-full bg-green-50 px-4 py-2 text-sm font-black text-green-800">Dodaj ofertę</Link>
                </div>
              </article>;
            })}
          </div>
        )}
      </div>
    </main>
  );
}
