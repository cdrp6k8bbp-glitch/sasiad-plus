import type { Metadata } from "next";
import CategoryListingsPage from "@/components/CategoryListingsPage";

export const metadata: Metadata = {
  title: "Pomoc sąsiedzka i lokalne usługi",
  description:
    "Znajdź zaufaną osobę do drobnych napraw, opieki i pomocy w codziennych sprawach w swojej okolicy.",
  alternates: { canonical: "/uslugi" },
};

export default function Uslugi({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string | string[];
    location?: string | string[];
  }>;
}) {
  return (
    <CategoryListingsPage
      categories={["usluga", "pomoc"]}
      description="Znajdź osobę, która pomoże Ci w codziennych sprawach."
      icon="🤝"
      pathname="/uslugi"
      searchParams={searchParams}
      seoContent={{
        heading: "Znajdź pomoc sąsiedzką i lokalne usługi",
        paragraphs: [
          "Sąsiad+ ułatwia znalezienie osoby do drobnych napraw, skręcania mebli, malowania, pomocy przy przeprowadzce, zakupów lub codziennych spraw. Oferty pochodzą od osób działających lokalnie.",
          "Wyszukaj rodzaj pomocy i miejscowość, sprawdź opis oraz dostępność, a później napisz do ogłoszeniodawcy. Termin i zakres pomocy możecie ustalić w wiadomościach.",
        ],
        searches: [
          "drobne naprawy",
          "skręcanie mebli",
          "malowanie",
          "pomoc przy przeprowadzce",
          "pomoc seniorom",
        ],
      }}
      title="Pomoc sąsiedzka"
    />
  );
}
