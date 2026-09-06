import Link from "next/link";
import type { Metadata } from "next";
import { headers } from "next/headers";
import AuthNav from "@/components/AuthNav";
import ListingCard from "@/components/ListingCard";
import { auth } from "@/lib/auth";
import { CATEGORIES, isCategoryKey } from "@/lib/categories";
import { getFavoriteListingIds, getListings } from "@/lib/db";
import { GUIDES } from "@/lib/guides";
import { listingAvailabilityStateFromRecord } from "@/lib/listing-availability";

export const metadata: Metadata = {
  title: {
    absolute: "Sąsiad+ — wypożyczalnia sprzętu i pomoc sąsiedzka",
  },
  description:
    "Wypożyczaj sprzęt i narzędzia, znajdź pomoc sąsiedzką, opiekę oraz lokalne usługi w Słupsku i swojej okolicy.",
  alternates: { canonical: "/" },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://sasiad-plus.com/#website",
      url: "https://sasiad-plus.com/",
      name: "Sąsiad+",
      description:
        "Lokalna platforma do wypożyczania sprzętu, znajdowania pomocy sąsiedzkiej i usług.",
      inLanguage: "pl-PL",
    },
    {
      "@type": "Organization",
      "@id": "https://sasiad-plus.com/#organization",
      url: "https://sasiad-plus.com/",
      name: "Sąsiad+",
      description:
        "Platforma łącząca osoby, które chcą pożyczać rzeczy, oferować pomoc i korzystać z lokalnych usług.",
    },
  ],
};

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
    href: "/kategoria/zwierzeta",
  },
  {
    icon: "👶",
    title: "Opieka nad dziećmi",
    description: "Opieka wieczorna i okazjonalna",
    href: "/kategoria/dzieci",
  },
  {
    icon: "🏕️",
    title: "Turystyka",
    description: "Kampery, namioty, kajaki i SUP-y",
    href: "/kategoria/turystyka",
  },
  {
    icon: "🌿",
    title: "Ogród",
    description: "Kosiarki i sprzęt ogrodowy",
    href: "/kategoria/ogrod",
  },
  {
    icon: "🏠",
    title: "Dom",
    description: "Odkurzacze, osuszacze i wyposażenie",
    href: "/kategoria/dom",
  },
  {
    icon: "🧘",
    title: "Rozwój osobisty",
    description: "Medytacja, mentoring i spotkania rozwojowe",
    href: "/rozwoj-osobisty",
  },
];

const featuredGuides = GUIDES.slice(0, 3);

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{
    dodano?: string;
    konto?: string;
    q?: string;
    location?: string;
  }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim().toLowerCase() ?? "";
  const location = params.location?.trim().toLowerCase() ?? "";
  const isSearching = Boolean(q || location);

  const [allListings, session] = await Promise.all([
    getListings(undefined, isSearching ? 100 : 6),
    auth.api.getSession({ headers: await headers() }),
  ]);
  const favoriteIds = new Set(
    session ? await getFavoriteListingIds(session.user.id) : [],
  );

  const listings = allListings
    .filter((listing) => {
      const categoryLabel = isCategoryKey(listing.category)
        ? CATEGORIES[listing.category].label
        : listing.category;
      const matchesQuery =
        !q ||
        listing.title.toLowerCase().includes(q) ||
        listing.description.toLowerCase().includes(q) ||
        listing.category.toLowerCase().includes(q) ||
        categoryLabel.toLowerCase().includes(q);

      const matchesLocation =
        !location || listing.location.toLowerCase().includes(location);

      return matchesQuery && matchesLocation;
    })
    .slice(0, q || location ? 100 : 6);

  return (
    <main className="min-h-screen bg-[#f7faf8] pb-24 text-slate-900 md:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
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
              className="transition hover:text-green-700"
              href="/rozwoj-osobisty"
            >
              Rozwój osobisty
            </Link>

            <Link
              href="/dodaj"
              className="rounded-full bg-green-700 px-6 py-3 font-semibold text-white transition hover:bg-green-800"
            >
              + Dodaj ogłoszenie
            </Link>

            <AuthNav userName={session?.user.name ?? null} />
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <Link
              href="/dodaj"
              className="rounded-full bg-green-700 px-4 py-2 text-sm font-semibold text-white"
            >
              + Dodaj
            </Link>

            <AuthNav userName={session?.user.name ?? null} />
          </div>
        </div>
      </header>

      {params.dodano === "1" && (
        <div className="mx-auto mt-5 max-w-7xl px-4 md:px-8">
          <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-center font-medium text-green-800">
            Ogłoszenie zostało dodane.
          </div>
        </div>
      )}

      {params.konto === "usuniete" && (
        <div className="mx-auto mt-5 max-w-7xl px-4 md:px-8">
          <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-center font-medium text-green-800">
            Konto i powiązane z nim dane zostały usunięte.
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

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
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

      {!isSearching && (
        <section className="mx-auto max-w-7xl px-4 py-14 md:px-8">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="font-semibold text-green-700">
                Praktycznie i po sąsiedzku
              </p>
              <h2 className="mt-1 text-3xl font-black tracking-tight">
                Poradniki Sąsiad+
              </h2>
              <p className="mt-3 max-w-2xl leading-7 text-slate-600">
                Sprawdź, jak bezpiecznie wypożyczać rzeczy, przygotować sprzęt
                i dobrze ustalić zasady opieki.
              </p>
            </div>
            <Link
              href="/poradniki"
              className="hidden font-semibold text-green-700 hover:underline sm:block"
            >
              Wszystkie poradniki →
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {featuredGuides.map((guide) => (
              <article
                key={guide.slug}
                className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-green-300 hover:shadow-lg"
              >
                <span className="text-4xl" aria-hidden="true">
                  {guide.icon}
                </span>
                <p className="mt-5 text-sm font-bold text-green-700">
                  {guide.readingTime}
                </p>
                <h3 className="mt-2 text-xl font-black leading-7 tracking-tight">
                  <Link
                    className="transition hover:text-green-700"
                    href={`/poradniki/${guide.slug}`}
                  >
                    {guide.cardTitle}
                  </Link>
                </h3>
                <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">
                  {guide.description}
                </p>
                <Link
                  className="mt-6 font-black text-green-700 hover:underline"
                  href={`/poradniki/${guide.slug}`}
                >
                  Czytaj poradnik →
                </Link>
              </article>
            ))}
          </div>

          <Link
            href="/poradniki"
            className="mt-6 inline-flex font-semibold text-green-700 hover:underline sm:hidden"
          >
            Wszystkie poradniki →
          </Link>
        </section>
      )}

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
                imageKey={listing.image_key}
                subcategory={listing.subcategory}
                title={listing.title}
                place={listing.location}
                price={listing.price}
                ownerName={listing.owner_name}
                ownerId={listing.owner_id}
                isFavorite={favoriteIds.has(listing.id)}
                isReserved={Boolean(listing.is_reserved)}
                availabilityState={listingAvailabilityStateFromRecord(listing)}
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

      {!isSearching && (
        <section className="mx-auto max-w-7xl px-4 py-14 md:px-8">
          <div className="grid gap-8 rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-[1.2fr_0.8fr] md:p-12">
            <div>
              <p className="font-semibold text-green-700">Blisko ludzi i potrzeb</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight">
                Lokalna wypożyczalnia sprzętu i pomoc sąsiedzka
              </h2>
              <div className="mt-5 space-y-4 leading-7 text-slate-600">
                <p>
                  Sąsiad+ pomaga znaleźć rzeczy i usługi dostępne blisko domu.
                  Możesz wyszukać wynajem narzędzi, sprzętu ogrodowego,
                  odkurzacza piorącego, SUP-a lub kajaka, a także opiekę nad
                  zwierzętami i pomoc w codziennych sprawach.
                </p>
                <p>
                  Wpisz miejscowość — na przykład{" "}
                  <Link className="font-semibold text-green-700 hover:underline" href="/slupsk">
                    Słupsk
                  </Link>{" "}
                  — aby zobaczyć lokalne ogłoszenia. Kontakt, cenę, odbiór i
                  dogodny termin ustalasz bezpośrednio z osobą dodającą ofertę.
                </p>
              </div>
            </div>

            <div className="rounded-3xl bg-green-50 p-6">
              <h3 className="text-xl font-black text-slate-900">
                Najczęściej wybierane
              </h3>
              <ul className="mt-5 space-y-3 font-semibold text-green-800">
                <li><Link className="hover:underline" href="/slupsk">Sprzęt i pomoc sąsiedzka w Słupsku →</Link></li>
                <li><Link className="hover:underline" href="/sprzet?q=wiertarka">Wypożyczanie narzędzi i wiertarek →</Link></li>
                <li><Link className="hover:underline" href="/kategoria/ogrod?q=kosiarka">Wynajem kosiarek i sprzętu ogrodowego →</Link></li>
                <li><Link className="hover:underline" href="/kategoria/dom?q=odkurzacz+piorący">Odkurzacze piorące i sprzęt do domu →</Link></li>
                <li><Link className="hover:underline" href="/kategoria/zwierzeta">Opieka nad psem i kotem →</Link></li>
                <li><Link className="hover:underline" href="/uslugi">Pomoc sąsiedzka i lokalne usługi →</Link></li>
              </ul>
            </div>
          </div>
        </section>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-slate-200 bg-white px-2 py-2 shadow-2xl md:hidden">
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

        <Link href="/rozwoj-osobisty" className="flex flex-col items-center gap-1 p-2 text-xs font-medium text-slate-600">
          <span className="text-xl">🧘</span>
          Rozwój
        </Link>
      </nav>
    </main>
  );
}
