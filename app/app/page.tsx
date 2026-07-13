import Link from "next/link";
import ListingCard from "@/components/ListingCard";
import { getListings } from "@/lib/db";

const categories = [
  {
    icon: "🛠️",
    title: "Sprzęt",
    description: "Narzędzia, drabiny i sprzęt remontowy",
    href: "/sprzet",
  },
  {
    icon: "🤝",
    title: "Pomoc sąsiedzka",
    description: "Drobne naprawy i pomoc w codziennych sprawach",
    href: "/uslugi",
  },
  {
    icon: "🐕",
    title: "Zwierzęta",
    description: "Spacery i opieka podczas urlopu",
    href: "/uslugi",
  },
  {
    icon: "👶",
    title: "Opieka nad dziećmi",
    description: "Opieka wieczorna i okazjonalna",
    href: "/uslugi",
  },
  {
    icon: "🏕️",
    title: "Turystyka",
    description: "Kampery, namioty, kajaki i SUP-y",
    href: "/sprzet",
  },
  {
    icon: "🌿",
    title: "Ogród",
    description: "Kosiarki i sprzęt ogrodowy",
    href: "/sprzet",
  },
  {
    icon: "🏠",
    title: "Dom",
    description: "Odkurzacze, osuszacze i wyposażenie",
    href: "/sprzet",
  },
];

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{
    dodano?: string;
    q?: string;
    location?: string;
  }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim().toLowerCase() ?? "";
  const location = params.location?.trim().toLowerCase() ?? "";

  const allListings = await getListings(undefined, 100);

  const listings = allListings
    .filter((listing) => {
      const matchesQuery =
        !q ||
        listing.title.toLowerCase().includes(q) ||
        listing.description.toLowerCase().includes(q) ||
        listing.category.toLowerCase().includes(q);

      const matchesLocation =
        !location || listing.location.toLowerCase().includes(location);

      return matchesQuery && matchesLocation;
    })
    .slice(0, q || location ? 100 : 6);

  const isSearching = Boolean(q || location);

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
            <Link className="transition hover:text-green-700" href="/sprzet">
              Sprzęt
            </Link>

            <Link className="transition hover:text-green-700" href="/uslugi">
              Pomoc sąsiedzka
            </Link>

            <Link
              href="/dodaj"
              className="rounded-full bg-green-700 px-6 py-3 font-semibold text-white transition hover:bg-green-800"
            >
              + Dodaj ogłoszenie
            </Link>
          </nav>

          <Link
            href="/dodaj"
            className="rounded-full bg-green-700 px-4 py-2 text-sm font-semibold text-white md:hidden"
          >
            + Dodaj
          </Link>
        </div>
      </header>

      {params.dodano === "1" && (
        <div className="mx-auto mt-5 max-w-7xl px-4 md:px-8">
          <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-center font-medium text-green-800">
            Ogłoszenie zostało dodane.
          </div>
        </div>
      )}

      <section className="overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 md:grid-cols-2 md:px-8 md:py-24">
          <div>
            <span className="inline-flex rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-800">
              Lokalnie, prosto i po sąsiedzku
            </span>

            <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight md:text-6xl">
              Wszystko czego potrzebujesz,
              <span className="block text-green-700">jest po sąsiedzku.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 md:text-xl">
              Pożycz sprzęt. Znajdź pomoc. Pomóż innym.
            </p>

            <form
              action="/"
              method="GET"
              className="mt-8 grid gap-3 rounded-3xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-200/60 sm:grid-cols-[1fr_180px_auto]"
            >
              <label className="sr-only" htmlFor="q">
                Czego szukasz?
              </label>

              <input
                id="q"
                name="q"
                type="search"
                defaultValue={params.q ?? ""}
                placeholder="Czego szukasz?"
                className="min-w-0 rounded-2xl border border-slate-200 px-4 py-4 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100"
              />

              <label className="sr-only" htmlFor="location">
                Miasto
              </label>

              <input
                id="location"
                name="location"
                defaultValue={params.location ?? ""}
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

          <div className="relative hidden min-h-[430px] md:block">
            <div className="absolute inset-0 rotate-3 rounded-[48px] bg-green-100" />

            <div className="absolute inset-5 flex flex-col justify-between rounded-[42px] bg-gradient-to-br from-green-700 to-emerald-500 p-10 text-white shadow-2xl">
              <div>
                <div className="text-7xl">🏡</div>

                <p className="mt-8 text-3xl font-black leading-tight">
                  Pożyczaj rzeczy.
                  <br />
                  Pomagaj ludziom.
                  <br />
                  Buduj zaufanie.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center text-sm font-semibold">
                <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
                  🛠️
                  <span className="mt-2 block">Sprzęt</span>
                </div>

                <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
                  🐕
                  <span className="mt-2 block">Opieka</span>
                </div>

                <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
                  🤝
                  <span className="mt-2 block">Pomoc</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="font-semibold text-green-700">Znajdź to, czego potrzebujesz</p>
            <h2 className="mt-1 text-3xl font-black tracking-tight">
              Popularne kategorie
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
          {categories.map((category) => (
            <Link
              key={category.title}
              href={category.href}
              className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-green-300 hover:shadow-lg"
            >
              <span className="text-4xl">{category.icon}</span>

              <h3 className="mt-4 font-bold group-hover:text-green-700">
                {category.title}
              </h3>

              <p className="mt-2 hidden text-sm leading-5 text-slate-500 lg:block">
                {category.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 md:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="font-semibold text-green-700">
              {isSearching ? "Wyniki wyszukiwania" : "Nowe w Sąsiad+"}
            </p>
            <h2 className="mt-1 text-3xl font-black tracking-tight">
              {isSearching ? "Znalezione ogłoszenia" : "Najnowsze ogłoszenia"}
            </h2>

            {isSearching && (
              <p className="mt-2 text-slate-500">
                Znaleziono: {listings.length}
              </p>
            )}
          </div>

          {isSearching ? (
            <Link
              href="/"
              className="hidden font-semibold text-green-700 hover:underline sm:block"
            >
              Wyczyść wyszukiwanie
            </Link>
          ) : (
            <Link
              href="/sprzet"
              className="hidden font-semibold text-green-700 hover:underline sm:block"
            >
              Zobacz wszystkie →
            </Link>
          )}
        </div>

        {listings.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <div className="text-5xl">📦</div>

            <h3 className="mt-4 text-xl font-bold">
              {isSearching
                ? "Nie znaleziono pasujących ogłoszeń"
                : "Nie ma jeszcze ogłoszeń"}
            </h3>

            <p className="mt-2 text-slate-600">
              {isSearching
                ? "Spróbuj użyć krótszej nazwy albo innego miasta."
                : "Dodaj pierwsze ogłoszenie i pokaż sąsiadom, co oferujesz."}
            </p>

            <Link
              href={isSearching ? "/" : "/dodaj"}
              className="mt-6 inline-flex rounded-full bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-800"
            >
              {isSearching ? "Wyczyść wyszukiwanie" : "Dodaj ogłoszenie"}
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                id={listing.id}
                icon={listing.icon}
                title={listing.title}
                place={listing.location}
                price={listing.price}
              />
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 md:px-8">
        <div className="rounded-[36px] bg-slate-900 px-6 py-12 text-white md:px-12">
          <div className="max-w-2xl">
            <p className="font-semibold text-green-400">
              Proste zasady
            </p>

            <h2 className="mt-2 text-3xl font-black">
              Jak działa Sąsiad+?
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              ["1", "Znajdź", "Wyszukaj potrzebny sprzęt lub lokalną pomoc."],
              ["2", "Skontaktuj się", "Ustal szczegóły bezpośrednio z sąsiadem."],
              ["3", "Korzystaj", "Pożycz, pomóż lub umów dogodny termin."],
            ].map(([number, title, text]) => (
              <div key={number} className="rounded-3xl bg-white/10 p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-500 font-black text-slate-950">
                  {number}
                </div>

                <h3 className="mt-5 text-xl font-bold">{title}</h3>
                <p className="mt-2 leading-6 text-slate-300">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-10 text-sm text-slate-500 md:flex-row md:items-center md:justify-between md:px-8">
          <p>© 2026 Sąsiad+. Wszystko, czego potrzebujesz, jest po sąsiedzku.</p>

          <div className="flex gap-5">
            <Link href="/sprzet">Sprzęt</Link>
            <Link href="/uslugi">Pomoc</Link>
            <Link href="/dodaj">Dodaj ogłoszenie</Link>
          </div>
        </div>
      </footer>

      <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-4 border-t border-slate-200 bg-white px-2 py-2 shadow-2xl md:hidden">
        <Link href="/" className="flex flex-col items-center gap-1 p-2 text-xs font-medium text-green-700">
          <span className="text-xl">🏠</span>
          Start
        </Link>

        <Link href="/sprzet" className="flex flex-col items-center gap-1 p-2 text-xs font-medium text-slate-600">
          <span className="text-xl">🔍</span>
          Szukaj
        </Link>

        <Link href="/dodaj" className="flex flex-col items-center gap-1 p-2 text-xs font-medium text-slate-600">
          <span className="text-xl">➕</span>
          Dodaj
        </Link>

        <Link href="/uslugi" className="flex flex-col items-center gap-1 p-2 text-xs font-medium text-slate-600">
          <span className="text-xl">🤝</span>
          Pomoc
        </Link>
      </nav>
    </main>
  );
}
