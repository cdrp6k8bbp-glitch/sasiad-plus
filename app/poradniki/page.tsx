import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES } from "@/lib/guides";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Poradniki o wypożyczaniu sprzętu i pomocy sąsiedzkiej",
  description:
    "Praktyczne poradniki Sąsiad+: lokalne wypożyczanie sprzętu, opieka nad zwierzętami oraz bezpieczne przekazywanie rzeczy.",
  alternates: { canonical: "/poradniki" },
  openGraph: {
    title: "Poradniki Sąsiad+ — pożyczaj i pomagaj bezpiecznie",
    description:
      "Praktyczne wskazówki dotyczące lokalnego wypożyczania, opieki nad zwierzętami i bezpiecznego korzystania z ofert.",
    url: "/poradniki",
  },
};

export default function GuidesPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Poradniki Sąsiad+",
    description: metadata.description,
    url: absoluteUrl("/poradniki"),
    inLanguage: "pl-PL",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: GUIDES.length,
      itemListElement: GUIDES.map((guide, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: guide.title,
        url: absoluteUrl(`/poradniki/${guide.slug}`),
      })),
    },
  };

  return (
    <main className="min-h-screen bg-[#f7faf8] text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 md:px-8">
          <Link
            href="/"
            className="text-2xl font-black tracking-tight text-green-700 md:text-3xl"
          >
            Sąsiad+
          </Link>
          <nav className="flex items-center gap-4 text-sm font-bold sm:gap-7 sm:text-base">
            <Link className="hover:text-green-700" href="/sprzet">
              Sprzęt
            </Link>
            <Link className="hover:text-green-700" href="/uslugi">
              Pomoc
            </Link>
            <Link
              className="rounded-full bg-green-700 px-4 py-2 text-white hover:bg-green-800 sm:px-5"
              href="/dodaj"
            >
              Dodaj ogłoszenie
            </Link>
          </nav>
        </div>
      </header>

      <section className="border-b border-green-100 bg-gradient-to-br from-green-50 to-emerald-100/70">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-8 md:py-20">
          <p className="font-bold text-green-700">Praktycznie i po sąsiedzku</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-tight md:text-6xl">
            Poradniki Sąsiad+
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600 md:text-xl">
            Dowiedz się, jak znaleźć potrzebny sprzęt, przygotować własne
            ogłoszenie i bezpiecznie ustalić zasady z drugą osobą.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
        <div className="grid gap-6 md:grid-cols-2">
          {GUIDES.map((guide) => (
            <article
              key={guide.slug}
              className="flex flex-col rounded-[32px] border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-green-300 hover:shadow-lg md:p-9"
            >
              <span className="text-4xl" aria-hidden="true">
                {guide.icon}
              </span>
              <p className="mt-5 text-sm font-bold text-green-700">
                {guide.readingTime}
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight md:text-3xl">
                <Link
                  className="transition hover:text-green-700"
                  href={`/poradniki/${guide.slug}`}
                >
                  {guide.cardTitle}
                </Link>
              </h2>
              <p className="mt-4 flex-1 leading-7 text-slate-600">
                {guide.description}
              </p>
              <Link
                className="mt-7 inline-flex font-black text-green-700 hover:underline"
                href={`/poradniki/${guide.slug}`}
              >
                Czytaj poradnik →
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-8">
        <div className="rounded-[32px] bg-slate-900 p-8 text-white md:flex md:items-center md:justify-between md:gap-8 md:p-12">
          <div>
            <p className="font-bold text-green-300">Masz coś do zaoferowania?</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight">
              Dodaj lokalne ogłoszenie
            </h2>
            <p className="mt-3 max-w-2xl leading-7 text-slate-300">
              Opisz rzecz lub pomoc, dodaj zdjęcia i określ dostępne terminy.
            </p>
          </div>
          <Link
            href="/dodaj"
            className="mt-6 inline-flex rounded-full bg-green-600 px-6 py-3 font-black text-white transition hover:bg-green-500 md:mt-0"
          >
            Dodaj ogłoszenie
          </Link>
        </div>
      </section>
    </main>
  );
}
