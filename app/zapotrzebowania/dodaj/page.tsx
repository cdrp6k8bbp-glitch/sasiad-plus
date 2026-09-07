import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import LocationSearchField from "@/components/LocationSearchField";
import { auth } from "@/lib/auth";
import { CATEGORIES, isCategoryKey } from "@/lib/categories";
import { createDemand } from "@/app/wyszukiwanie/actions";

const fieldClass = "w-full rounded-xl border border-slate-300 bg-white p-3 outline-none focus:border-green-600 focus:ring-4 focus:ring-green-100";

function first(value?: string | string[]) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function AddDemandPage({ searchParams }: {
  searchParams: Promise<{ q?: string | string[]; location?: string | string[]; radius?: string | string[]; categories?: string | string[] }>;
}) {
  const params = await searchParams;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/logowanie?redirect=/zapotrzebowania/dodaj");
  const requestedCategory =
    first(params.categories).split(",").find(isCategoryKey) ?? "";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="font-bold text-green-700 hover:underline">← Wróć</Link>
        <h1 className="mt-6 text-4xl font-black">Dodaj zapotrzebowanie</h1>
        <p className="mt-3 text-slate-600">Napisz, czego szukasz. Zapotrzebowanie będzie widoczne przez 30 dni, a gdy pojawi się pasująca oferta, powiadomimy Cię w Sąsiad+.</p>

        <form action={createDemand} className="mt-8 space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <label htmlFor="demand-query" className="mb-2 block text-sm font-bold">Czego potrzebujesz?</label>
            <input id="demand-query" name="query" required minLength={3} maxLength={120} defaultValue={first(params.q)} className={fieldClass} placeholder="Np. szukam odkurzacza piorącego" />
          </div>
          <div>
            <label htmlFor="demand-category" className="mb-2 block text-sm font-bold">Kategoria</label>
            <select id="demand-category" name="category" required defaultValue={isCategoryKey(requestedCategory) ? requestedCategory : "sprzet"} className={fieldClass}>
              {Object.entries(CATEGORIES).map(([key, category]) => <option key={key} value={key}>{category.icon} {category.label}</option>)}
            </select>
          </div>
          <LocationSearchField id="demand-location" defaultValue={first(params.location)} defaultRadius={params.radius} showRadius required labelClassName="mb-2 block text-sm font-bold" inputClassName={fieldClass} />
          <div>
            <label htmlFor="demand-description" className="mb-2 block text-sm font-bold">Dodatkowe informacje (opcjonalnie)</label>
            <textarea id="demand-description" name="description" maxLength={1000} rows={5} className={fieldClass} placeholder="Termin, budżet lub inne ważne szczegóły" />
          </div>
          <button className="w-full rounded-xl bg-green-700 px-6 py-3 font-black text-white hover:bg-green-800" type="submit">Opublikuj zapotrzebowanie</button>
        </form>
      </div>
    </main>
  );
}
