import Link from "next/link";
import { headers } from "next/headers";
import AuthNav from "@/components/AuthNav";
import ListingCard from "@/components/ListingCard";
import { auth } from "@/lib/auth";
import { getFavoriteListingIds, getListings } from "@/lib/db";

type CategoryListingsPageProps = {
  categories: string | string[];
  description: string;
  icon: string;
  pathname: "/sprzet" | "/uslugi";
  searchParams: Promise<{
    q?: string | string[];
    location?: string | string[];
  }>;
  title: string;
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function CategoryListingsPage({
  categories,
  description,
  icon,
  pathname,
  searchParams,
  title,
}: CategoryListingsPageProps) {
  const params = await searchParams;
  const queryValue = firstValue(params.q).trim();
  const locationValue = firstValue(params.location).trim();
  const query = queryValue.toLocaleLowerCase("pl");
  const location = locationValue.toLocaleLowerCase("pl");
  const isSearching = Boolean(query || location);

  const [allListings, session] = await Promise.all([
    getListings(categories, 100),
    auth.api.getSession({ headers: await headers() }),
  ]);
  const favoriteIds = new Set(
    session ? await getFavoriteListingIds(session.user.id) : [],
  );
  const listings = allListings.filter((listing) => {
    const searchableText = [
      listing.title,
      listing.description,
      listing.subcategory ?? "",
    ]
      .join(" ")
      .toLocaleLowerCase("pl");

    return (
      (!query || searchableText.includes(query)) &&
      (!location || listing.location.toLocaleLowerCase("pl").includes(location))
    );
  });

  return (
    <main className="min-h-screen bg-[#f7faf8] pb-24 text-slate-900 md:pb-0">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
          <Link
            href="/"
            className="text-2xl font-black tracking-tight text-green-700 md:text-3xl"
          >
            Sąsiad+
          </Link>

          <nav className="hidden items-center gap-7 font-medium md:flex">
            <Link
              className={`transition hover:text-green-700 ${
                pathname === "/sprzet" ? "text-green-700" : ""
              }`}
              href="/sprzet"
            >
              Sprzęt
            </Link>

            <Link
              className={`transition hover:text-green-700 ${
                pathname === "/uslugi" ? "text-green-700" : ""
              }`}
              href="/uslugi"
            >
              Pomoc sąsiedzka
            </Link>

            <Link
              href="/dodaj"
              className="rounded-full bg-green-700 px-6 py-3 font-semibold text-white transition hover:bg-green-800"
            >
              + Dodaj ogłoszenie
            </Link>

            <AuthNav />
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <Link
              href="/dodaj"
              className="rounded-full bg-green-700 px-4 py-2 text-sm font-semibold text-white"
            >
              + Dodaj
            </Link>

            <AuthNav />
          </div>
        </div>
      </header>

      <section className="border-b border-green-100 bg-gradient-to-br from-green-50 to-emerald-100/60">
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
          <div className="flex items-start gap-4">
            <span className="text-5xl" aria-hidden="true">
              {icon}
            </span>

            <div>
              <h1 className="text-4xl font-black tracking-tight md:text-5xl">
                {title}
              </h1>
              <p className="mt-3 max-w-2xl text-lg text-slate-600">
                {description}
              </p>
            </div>
          </div>

          <form
            action={pathname}
            method="GET"
            className="mt-8 grid gap-3 rounded-3xl border border-slate-200 bg-white p-3 shadow-xl shadow-green-900/5 sm:grid-cols-[1fr_220px_auto]"
          >
            <label className="sr-only" htmlFor={`${pathname}-q`}>
              Czego szukasz?
            </label>
            <input
              id={`${pathname}-q`}
              name="q"
              type="search"
              defaultValue={queryValue}
              placeholder="Czego szukasz?"
              className="min-w-0 rounded-2xl border border-slate-200 px-4 py-4 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100"
            />

            <label className="sr-only" htmlFor={`${pathname}-location`}>
              Miasto
            </label>
            <input
              id={`${pathname}-location`}
              name="location"
              defaultValue={locationValue}
              placeholder="Miasto"
              className="min-w-0 rounded-2xl border border-slate-200 px-4 py-4 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100"
            />

            <button
              type="submit"
              className="rounded-2xl bg-green-700 px-7 py-4 font-bold text-white transition hover:bg-green-800"
            >
              Szukaj
            </button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="font-semibold text-green-700">
              {isSearching ? "Wyniki wyszukiwania" : "Dostępne w okolicy"}
            </p>
            <h2 className="mt-1 text-3xl font-black tracking-tight">
              {isSearching ? `Znaleziono: ${listings.length}` : `Ogłoszenia: ${listings.length}`}
            </h2>
          </div>

          {isSearching && (
            <Link
              href={pathname}
              className="font-semibold text-green-700 hover:underline"
            >
              Wyczyść filtry
            </Link>
          )}
        </div>

        {listings.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <div className="text-5xl">{isSearching ? "🔍" : "📦"}</div>
            <h3 className="mt-4 text-xl font-bold">
              {isSearching
                ? "Nie znaleziono pasujących ogłoszeń"
                : "Nie ma jeszcze ogłoszeń w tej kategorii"}
            </h3>
            <p className="mt-2 text-slate-600">
              {isSearching
                ? "Spróbuj użyć krótszej nazwy albo innego miasta."
                : "Dodaj pierwsze ogłoszenie i pokaż sąsiadom, co oferujesz."}
            </p>
            <Link
              href={isSearching ? pathname : "/dodaj"}
              className="mt-6 inline-flex rounded-full bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-800"
            >
              {isSearching ? "Wyczyść filtry" : "Dodaj ogłoszenie"}
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                id={listing.id}
                icon={listing.icon}
                imageKey={listing.image_key}
                subcategory={listing.subcategory}
                title={listing.title}
                place={listing.location}
                price={listing.price}
                ownerName={listing.owner_name}
                ownerId={listing.owner_id}
                isFavorite={favoriteIds.has(listing.id)}
                isReserved={Boolean(listing.is_reserved)}
              />
            ))}
          </div>
        )}
      </section>

      <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-4 border-t border-slate-200 bg-white px-2 py-2 shadow-2xl md:hidden">
        <Link href="/" className="flex flex-col items-center gap-1 p-2 text-xs font-medium text-slate-600">
          <span className="text-xl">🏠</span>
          Start
        </Link>
        <Link
          href="/sprzet"
          className={`flex flex-col items-center gap-1 p-2 text-xs font-medium ${
            pathname === "/sprzet" ? "text-green-700" : "text-slate-600"
          }`}
        >
          <span className="text-xl">🔍</span>
          Sprzęt
        </Link>
        <Link href="/dodaj" className="flex flex-col items-center gap-1 p-2 text-xs font-medium text-slate-600">
          <span className="text-xl">➕</span>
          Dodaj
        </Link>
        <Link
          href="/uslugi"
          className={`flex flex-col items-center gap-1 p-2 text-xs font-medium ${
            pathname === "/uslugi" ? "text-green-700" : "text-slate-600"
          }`}
        >
          <span className="text-xl">🤝</span>
          Pomoc
        </Link>
      </nav>
    </main>
  );
}
