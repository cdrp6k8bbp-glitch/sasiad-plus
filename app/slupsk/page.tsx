import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import AuthNav from "@/components/AuthNav";
import ListingCard from "@/components/ListingCard";
import { auth } from "@/lib/auth";
import { getFavoriteListingIds, getListings } from "@/lib/db";
import { absoluteUrl } from "@/lib/seo";
import { listingAvailabilityStateFromRecord } from "@/lib/listing-availability";

export const metadata: Metadata = {
  title: "Wypożyczalnia sprzętu i pomoc sąsiedzka w Słupsku",
  description:
    "Znajdź sprzęt, narzędzia, pomoc sąsiedzką, opiekę i lokalne usługi w Słupsku. Przeglądaj ogłoszenia i skontaktuj się bezpośrednio z sąsiadem.",
  alternates: { canonical: "/slupsk" },
  openGraph: {
    title: "Sąsiad+ Słupsk — sprzęt, pomoc i lokalne usługi",
    description:
      "Lokalne ogłoszenia ze Słupska: wypożyczanie sprzętu, pomoc sąsiedzka, opieka i usługi.",
    url: "/slupsk",
  },
};

const localCategories = [
  {
    icon: "🛠️",
    title: "Sprzęt i narzędzia",
    description: "Wiertarki, drabiny, myjki i sprzęt remontowy",
    href: "/sprzet?location=Słupsk",
  },
  {
    icon: "🤝",
    title: "Pomoc sąsiedzka",
    description: "Drobne naprawy i pomoc w codziennych sprawach",
    href: "/uslugi?location=Słupsk",
  },
  {
    icon: "🐕",
    title: "Opieka nad zwierzętami",
    description: "Spacery oraz opieka nad psem lub kotem",
    href: "/kategoria/zwierzeta?location=Słupsk",
  },
  {
    icon: "🌿",
    title: "Dom i ogród",
    description: "Sprzęt do domu, ogrodu i porządków",
    href: "/kategoria/ogrod?location=Słupsk",
  },
] as const;

function normalizeLocation(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pl");
}

export default async function SlupskPage() {
  const [allListings, session] = await Promise.all([
    getListings(undefined, 100),
    auth.api.getSession({ headers: await headers() }),
  ]);
  const listings = allListings
    .filter((listing) => normalizeLocation(listing.location).includes("slupsk"))
    .slice(0, 12);
  const favoriteIds = new Set(
    session ? await getFavoriteListingIds(session.user.id) : [],
  );
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Sąsiad+ Słupsk — lokalne ogłoszenia",
    url: absoluteUrl("/slupsk"),
    description:
      "Sprzęt, pomoc sąsiedzka, opieka i lokalne usługi dostępne w Słupsku.",
    inLanguage: "pl-PL",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: listings.length,
      itemListElement: listings.map((listing, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: listing.title,
        url: absoluteUrl(`/ogloszenie/${listing.id}`),
      })),
    },
  };

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

      <section className="border-b border-green-100 bg-gradient-to-br from-green-50 to-emerald-100/70">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-8 md:py-20">
          <p className="font-bold text-green-700">Lokalnie w Słupsku</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-tight md:text-6xl">
            Wypożycz sprzęt i znajdź pomoc sąsiedzką w Słupsku
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600 md:text-xl">
            Przeglądaj ogłoszenia osób z Twojej okolicy. Znajdź narzędzia,
            sprzęt do domu i ogrodu, opiekę nad zwierzętami albo pomoc w
            codziennych sprawach.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="#ogloszenia"
              className="rounded-full bg-green-700 px-6 py-3 font-bold text-white transition hover:bg-green-800"
            >
              Zobacz ogłoszenia
            </Link>
            <Link
              href="/dodaj"
              className="rounded-full border border-green-700 bg-white px-6 py-3 font-bold text-green-800 transition hover:bg-green-50"
            >
              Dodaj ogłoszenie w Słupsku
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <p className="font-semibold text-green-700">Czego potrzebujesz?</p>
        <h2 className="mt-1 text-3xl font-black tracking-tight">
          Popularne kategorie w Słupsku
        </h2>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {localCategories.map((category) => (
            <Link
              key={category.title}
              href={category.href}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-green-300 hover:shadow-lg"
            >
              <span className="text-4xl" aria-hidden="true">
                {category.icon}
              </span>
              <h3 className="mt-4 text-lg font-black">{category.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {category.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section
        id="ogloszenia"
        className="mx-auto max-w-7xl scroll-mt-24 px-4 py-12 md:px-8"
      >
        <p className="font-semibold text-green-700">Dostępne blisko Ciebie</p>
        <h2 className="mt-1 text-3xl font-black tracking-tight">
          Ogłoszenia ze Słupska: {listings.length}
        </h2>

        {listings.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <div className="text-5xl">📍</div>
            <h3 className="mt-4 text-xl font-bold">
              Czekamy na pierwsze lokalne ogłoszenia
            </h3>
            <p className="mt-2 text-slate-600">
              Dodaj ofertę ze Słupska i pokaż sąsiadom, co możesz wypożyczyć lub
              w czym możesz pomóc.
            </p>
            <Link
              href="/dodaj"
              className="mt-6 inline-flex rounded-full bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-800"
            >
              Dodaj ogłoszenie
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="grid gap-8 rounded-[36px] border border-slate-200 bg-white p-7 shadow-sm md:grid-cols-2 md:p-12">
          <div>
            <p className="font-semibold text-green-700">Sąsiad+ Słupsk</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight">
              Lokalne rzeczy i usługi bez dalekich dojazdów
            </h2>
            <div className="mt-5 space-y-4 leading-7 text-slate-600">
              <p>
                Sąsiad+ łączy mieszkańców Słupska, którzy chcą pożyczać rzeczy,
                dzielić się umiejętnościami i korzystać z lokalnej pomocy.
                Warunki, cenę, odbiór oraz termin ustalacie bezpośrednio między
                sobą.
              </p>
              <p>
                Możesz znaleźć między innymi wypożyczanie wiertarek, drabin,
                kosiarek, odkurzaczy piorących i sprzętu turystycznego, a także
                opiekę nad psem, pomoc przy przeprowadzce lub drobnych naprawach.
              </p>
            </div>
          </div>
          <div className="rounded-3xl bg-slate-900 p-7 text-white">
            <h3 className="text-2xl font-black">Jak zacząć?</h3>
            <ol className="mt-5 space-y-4 text-slate-200">
              <li><strong className="text-white">1.</strong> Wybierz kategorię albo lokalne ogłoszenie.</li>
              <li><strong className="text-white">2.</strong> Sprawdź opis, cenę i dostępne terminy.</li>
              <li><strong className="text-white">3.</strong> Napisz do właściciela i ustal szczegóły.</li>
            </ol>
          </div>
        </div>
      </section>

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
