import CategoryListingsPage from "@/components/CategoryListingsPage";

export default function Sprzet({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string | string[];
    location?: string | string[];
  }>;
}) {
  return (
    <CategoryListingsPage
      categories="sprzet"
      description="Znajdź narzędzia i sprzęt dostępny w Twojej okolicy."
      icon="🛠️"
      pathname="/sprzet"
      searchParams={searchParams}
      title="Wypożycz sprzęt"
    />
  );
}
