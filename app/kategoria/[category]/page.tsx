import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CategoryListingsPage from "@/components/CategoryListingsPage";
import { CATEGORIES } from "@/lib/categories";

const categoryPages = {
  zwierzeta: {
    title: "Opieka nad zwierzętami",
    description:
      "Znajdź spacery, wizyty domowe i opiekę nad zwierzętami w swojej okolicy.",
    seoContent: {
      heading: "Opieka nad psem, kotem i innymi zwierzętami w okolicy",
      paragraphs: [
        "Szukasz osoby, która wyprowadzi psa, odwiedzi kota albo zaopiekuje się zwierzęciem podczas urlopu? W Sąsiad+ możesz znaleźć lokalne ogłoszenia opiekunów i sąsiadów dostępnych w Twojej miejscowości.",
        "Sprawdź opis usługi, dostępne terminy i lokalizację. Przed przekazaniem zwierzęcia ustal zasady opieki, karmienie, kontakt awaryjny oraz ewentualne potrzeby zdrowotne pupila.",
      ],
      searches: ["wyprowadzanie psa", "opieka nad psem", "opieka nad kotem", "opieka podczas urlopu"],
      guides: [
        {
          href: "/poradniki/ile-kosztuje-opieka-nad-psem-podczas-urlopu",
          title: "Ile kosztuje opieka nad psem podczas urlopu?",
        },
      ],
    },
  },
  dzieci: {
    title: "Opieka nad dziećmi",
    description:
      "Znajdź opiekę wieczorną, weekendową lub okazjonalną w swojej okolicy.",
    seoContent: {
      heading: "Opieka nad dziećmi blisko domu",
      paragraphs: [
        "Znajdź lokalne ogłoszenia dotyczące opieki wieczornej, weekendowej i okazjonalnej. Wyszukiwanie według miejscowości pomaga dotrzeć do osób dostępnych w najbliższej okolicy.",
        "Przed umówieniem opieki porozmawiaj z opiekunem, sprawdź informacje w profilu i dokładnie ustal godziny, obowiązki oraz zasady bezpieczeństwa.",
      ],
      searches: ["opieka wieczorna", "opieka weekendowa", "opieka okazjonalna", "opiekunka do dziecka"],
      guides: [
        {
          href: "/poradniki/co-mozna-bezpiecznie-pozyczyc-od-sasiada",
          title: "Jak bezpiecznie ustalać sąsiedzką pomoc?",
        },
      ],
    },
  },
  turystyka: {
    title: "Sprzęt turystyczny",
    description:
      "Znajdź kampery, namioty, kajaki, SUP-y i inny sprzęt turystyczny.",
    seoContent: {
      heading: "Wypożycz sprzęt turystyczny w swojej okolicy",
      paragraphs: [
        "Zamiast kupować sprzęt używany kilka razy w roku, znajdź lokalne ogłoszenia wynajmu namiotów, SUP-ów, kajaków, rowerów, kamperów i przyczep kempingowych.",
        "Wybierz interesujące ogłoszenie, sprawdź dostępność i skontaktuj się z właścicielem. Przed odbiorem ustal stan wyposażenia, zasady użytkowania, cenę oraz termin zwrotu.",
      ],
      searches: ["SUP", "kajak", "namiot", "rower", "kamper", "przyczepa kempingowa"],
      guides: [
        {
          href: "/poradniki/jak-przygotowac-sprzet-do-wypozyczenia",
          title: "Jak przygotować sprzęt do wypożyczenia?",
        },
        {
          href: "/poradniki/co-mozna-bezpiecznie-pozyczyc-od-sasiada",
          title: "Co można bezpiecznie pożyczyć od sąsiada?",
        },
      ],
    },
  },
  ogrod: {
    title: "Sprzęt ogrodowy",
    description:
      "Znajdź kosiarki, pilarki, wertykulatory i inny sprzęt do ogrodu.",
    seoContent: {
      heading: "Wynajem sprzętu ogrodowego blisko Ciebie",
      paragraphs: [
        "W Sąsiad+ znajdziesz lokalne ogłoszenia kosiarek, glebogryzarek, wertykulatorów, pilarek, nożyc i rozdrabniaczy do gałęzi. To wygodne rozwiązanie przy sezonowych pracach w ogrodzie.",
        "Wyszukaj urządzenie i miejscowość, a potem ustal z właścicielem termin odbioru. Przed użyciem zapytaj o instrukcję, paliwo lub zasilanie oraz zasady bezpiecznego zwrotu.",
      ],
      searches: ["kosiarka", "glebogryzarka", "wertykulator", "pilarka", "rozdrabniacz gałęzi"],
      guides: [
        {
          href: "/poradniki/jak-przygotowac-sprzet-do-wypozyczenia",
          title: "Jak przygotować sprzęt do wypożyczenia?",
        },
        {
          href: "/poradniki/co-mozna-bezpiecznie-pozyczyc-od-sasiada",
          title: "Co można bezpiecznie pożyczyć od sąsiada?",
        },
      ],
    },
  },
  dom: {
    title: "Sprzęt do domu",
    description:
      "Znajdź odkurzacze piorące, osuszacze, klimatyzatory i wyposażenie domu.",
    seoContent: {
      heading: "Wypożycz sprzęt do domu od osób w okolicy",
      paragraphs: [
        "Potrzebujesz odkurzacza piorącego, parownicy, osuszacza, klimatyzatora albo projektora tylko na krótki czas? Sprawdź wyposażenie udostępniane przez osoby z Twojej miejscowości.",
        "Porównaj lokalne ogłoszenia, termin i cenę. Przed odbiorem ustal sposób używania urządzenia, dołączone akcesoria i warunki zwrotu.",
      ],
      searches: ["odkurzacz piorący", "osuszacz", "klimatyzator", "parownica", "projektor"],
      guides: [
        {
          href: "/poradniki/jak-przygotowac-sprzet-do-wypozyczenia",
          title: "Jak przygotować sprzęt do wypożyczenia?",
        },
        {
          href: "/poradniki/co-mozna-bezpiecznie-pozyczyc-od-sasiada",
          title: "Co można bezpiecznie pożyczyć od sąsiada?",
        },
      ],
    },
  },
} as const;

type CategoryPageKey = keyof typeof categoryPages;

type CategoryPageProps = {
  params: Promise<{ category: string }>;
  searchParams: Promise<{
    q?: string | string[];
    location?: string | string[];
    radius?: string | string[];
  }>;
};

function isCategoryPageKey(category: string): category is CategoryPageKey {
  return category in categoryPages;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;

  if (!isCategoryPageKey(category)) {
    return {};
  }

  const page = categoryPages[category];

  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/kategoria/${category}` },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { category } = await params;

  if (!isCategoryPageKey(category)) {
    notFound();
  }

  const page = categoryPages[category];

  return (
    <CategoryListingsPage
      categories={category}
      description={page.description}
      icon={CATEGORIES[category].icon}
      pathname={`/kategoria/${category}`}
      searchParams={searchParams}
      seoContent={page.seoContent}
      title={page.title}
    />
  );
}
