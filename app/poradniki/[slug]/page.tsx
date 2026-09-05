import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getGuide, GUIDES } from "@/lib/guides";
import { absoluteUrl } from "@/lib/seo";

type GuidePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return GUIDES.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({
  params,
}: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);

  if (!guide) {
    return {};
  }

  const path = `/poradniki/${guide.slug}`;

  return {
    title: guide.title,
    description: guide.description,
    keywords: [...guide.keywords],
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      title: guide.title,
      description: guide.description,
      url: path,
      publishedTime: guide.publishedAt,
      modifiedTime: guide.updatedAt,
    },
  };
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { slug } = await params;
  const guide = getGuide(slug);

  if (!guide) {
    notFound();
  }

  const relatedGuides = GUIDES.filter((item) => item.slug !== guide.slug).slice(
    0,
    3,
  );
  const articleUrl = absoluteUrl(`/poradniki/${guide.slug}`);
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: guide.title,
      description: guide.description,
      datePublished: guide.publishedAt,
      dateModified: guide.updatedAt,
      inLanguage: "pl-PL",
      mainEntityOfPage: articleUrl,
      author: { "@type": "Organization", name: "Sąsiad+" },
      publisher: {
        "@type": "Organization",
        name: "Sąsiad+",
        url: absoluteUrl("/"),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Strona główna",
          item: absoluteUrl("/"),
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Poradniki",
          item: absoluteUrl("/poradniki"),
        },
        {
          "@type": "ListItem",
          position: 3,
          name: guide.title,
          item: articleUrl,
        },
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-[#f7faf8] text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 md:px-8">
          <Link
            href="/"
            className="text-2xl font-black tracking-tight text-green-700 md:text-3xl"
          >
            Sąsiad+
          </Link>
          <Link
            className="font-bold text-slate-600 transition hover:text-green-700"
            href="/poradniki"
          >
            Wszystkie poradniki
          </Link>
        </div>
      </header>

      <article>
        <div className="border-b border-green-100 bg-gradient-to-br from-green-50 to-emerald-100/70">
          <div className="mx-auto max-w-4xl px-4 py-12 md:px-8 md:py-16">
            <nav
              aria-label="Okruszki"
              className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-500"
            >
              <Link className="hover:text-green-700" href="/">
                Strona główna
              </Link>
              <span aria-hidden="true">/</span>
              <Link className="hover:text-green-700" href="/poradniki">
                Poradniki
              </Link>
            </nav>
            <span className="mt-8 block text-5xl" aria-hidden="true">
              {guide.icon}
            </span>
            <h1 className="mt-5 text-4xl font-black tracking-tight md:text-6xl">
              {guide.title}
            </h1>
            <p className="mt-6 text-xl leading-8 text-slate-600">
              {guide.intro}
            </p>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-slate-500">
              <span>{guide.readingTime}</span>
              <time dateTime={guide.updatedAt}>Aktualizacja: 5 września 2026</time>
            </div>
          </div>
        </div>

        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:px-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:py-16">
          <div className="space-y-12">
            {guide.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-2xl font-black tracking-tight md:text-3xl">
                  {section.heading}
                </h2>
                <div className="mt-5 space-y-4 text-lg leading-8 text-slate-700">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
                {section.bullets && (
                  <ul className="mt-6 space-y-3 rounded-3xl border border-green-100 bg-green-50 p-6 text-base leading-7 text-slate-700">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-3">
                        <span
                          className="font-black text-green-700"
                          aria-hidden="true"
                        >
                          ✓
                        </span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            <div className="rounded-[32px] bg-slate-900 p-7 text-white md:p-9">
              <p className="font-bold text-green-300">Przejdź od porad do działania</p>
              <h2 className="mt-2 text-2xl font-black">
                Zobacz {guide.categoryLabel}
              </h2>
              <p className="mt-3 leading-7 text-slate-300">
                Przeglądaj lokalne ogłoszenia i ustal szczegóły bezpośrednio z
                drugą osobą.
              </p>
              <Link
                href={guide.categoryHref}
                className="mt-6 inline-flex rounded-full bg-green-600 px-6 py-3 font-black transition hover:bg-green-500"
              >
                {guide.categoryCta}
              </Link>
            </div>
          </div>

          <aside className="self-start lg:sticky lg:top-8">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-black">W tym poradniku</h2>
              <ol className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                {guide.sections.map((section, index) => (
                  <li key={section.heading}>
                    <span className="mr-2 font-black text-green-700">
                      {index + 1}.
                    </span>
                    {section.heading}
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>
      </article>

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 md:px-8 md:py-16">
          <p className="font-bold text-green-700">Czytaj dalej</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight">
            Inne poradniki
          </h2>
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {relatedGuides.map((item) => (
              <Link
                key={item.slug}
                href={`/poradniki/${item.slug}`}
                className="rounded-3xl border border-slate-200 p-6 transition hover:border-green-300 hover:bg-green-50"
              >
                <span className="text-3xl" aria-hidden="true">
                  {item.icon}
                </span>
                <h3 className="mt-4 font-black leading-6">{item.cardTitle}</h3>
                <p className="mt-3 text-sm font-bold text-green-700">
                  Czytaj →
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
