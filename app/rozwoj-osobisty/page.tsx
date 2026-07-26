import CategoryListingsPage from "@/components/CategoryListingsPage";

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
      title="Rozwój osobisty"
    />
  );
}
