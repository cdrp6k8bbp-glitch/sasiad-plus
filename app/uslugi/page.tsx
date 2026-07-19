import CategoryListingsPage from "@/components/CategoryListingsPage";

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
      title="Pomoc sąsiedzka"
    />
  );
}
