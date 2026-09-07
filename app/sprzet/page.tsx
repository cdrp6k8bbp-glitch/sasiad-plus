import type { Metadata } from "next";
import CategoryListingsPage from "@/components/CategoryListingsPage";

export const metadata: Metadata = {
  title: "Wypożyczalnia sprzętu i narzędzi w okolicy",
  description:
    "Znajdź narzędzia, sprzęt domowy, ogrodowy i turystyczny dostępny do pożyczenia od osób w Twojej okolicy.",
  alternates: { canonical: "/sprzet" },
};

export default function Sprzet({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string | string[];
    location?: string | string[];
    radius?: string | string[];
  }>;
}) {
  return (
    <CategoryListingsPage
      categories="sprzet"
      description="Znajdź narzędzia i sprzęt dostępny w Twojej okolicy."
      icon="🛠️"
      pathname="/sprzet"
      searchParams={searchParams}
      seoContent={{
        heading: "Wypożycz sprzęt i narzędzia od osób w swojej okolicy",
        paragraphs: [
          "Nie każdy sprzęt trzeba kupować na własność. W Sąsiad+ możesz znaleźć narzędzia remontowe, drabiny, myjki ciśnieniowe, odkurzacze przemysłowe, agregaty i osuszacze udostępniane lokalnie.",
          "Wpisz nazwę potrzebnego urządzenia i miejscowość, porównaj dostępne ogłoszenia, a następnie skontaktuj się z właścicielem. Szczegóły odbioru, cenę i termin ustalacie bezpośrednio między sobą.",
        ],
        searches: [
          "wiertarka",
          "drabina",
          "myjka ciśnieniowa",
          "odkurzacz przemysłowy",
          "osuszacz",
        ],
        guides: [
          {
            href: "/poradniki/gdzie-wypozyczyc-narzedzia-w-slupsku",
            title: "Gdzie wypożyczyć narzędzia w Słupsku?",
          },
          {
            href: "/poradniki/jak-przygotowac-sprzet-do-wypozyczenia",
            title: "Jak przygotować sprzęt do wypożyczenia?",
          },
          {
            href: "/poradniki/co-mozna-bezpiecznie-pozyczyc-od-sasiada",
            title: "Co można bezpiecznie pożyczyć od sąsiada?",
          },
        ],
      }}
      title="Wypożycz sprzęt"
    />
  );
}
