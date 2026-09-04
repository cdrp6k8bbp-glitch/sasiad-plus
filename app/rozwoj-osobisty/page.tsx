import type { Metadata } from "next";
import CategoryListingsPage from "@/components/CategoryListingsPage";

export const metadata: Metadata = {
  title: "Rozwój osobisty — lokalne sesje i spotkania",
  description:
    "Znajdź lokalne sesje oddechowe, mentoring, reiki, koncerty mis tybetańskich i inne spotkania wspierające dobrostan.",
  alternates: { canonical: "/rozwoj-osobisty" },
};

export default function RozwojOsobisty({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string | string[];
    location?: string | string[];
  }>;
}) {
  return (
    <CategoryListingsPage
      categories="rozwoj"
      description="Znajdź lokalne sesje i spotkania wspierające rozwój oraz dobrostan. Ogłoszenia nie zastępują opieki medycznej ani psychologicznej."
      icon="🧘"
      pathname="/rozwoj-osobisty"
      searchParams={searchParams}
      seoContent={{
        heading: "Lokalne spotkania wspierające rozwój i dobrostan",
        paragraphs: [
          "Znajdź prowadzone w okolicy sesje oddechowe, medytacje, mentoring, warsztaty uważności, koncerty mis oraz inne spotkania rozwojowe. Skorzystaj z wyszukiwarki, aby zawęzić wyniki do swojej miejscowości.",
          "Przed umówieniem terminu przeczytaj opis ogłoszenia i zapytaj prowadzącego o przebieg spotkania. Oferty rozwojowe publikowane w Sąsiad+ nie zastępują diagnozy, psychoterapii ani opieki medycznej.",
        ],
        searches: [
          "medytacja",
          "sesja oddechowa",
          "mentoring",
          "warsztaty uważności",
          "koncert mis",
        ],
      }}
      title="Rozwój osobisty"
    />
  );
}
