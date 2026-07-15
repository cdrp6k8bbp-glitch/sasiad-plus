import ListingCard from "@/components/ListingCard";
import { getListings } from "@/lib/db";

export default async function Uslugi() {
  const listings = await getListings(["usluga", "pomoc"]);

  return (
    <main className="min-h-screen bg-slate-50 p-8">

      <h1 className="text-4xl font-bold text-green-600">
        🤝 Pomoc sąsiedzka
      </h1>

      <p className="mt-4 text-gray-600">
        Znajdź osobę, która pomoże Ci w codziennych sprawach.
      </p>

      {listings.length === 0 ? (
        <p className="mt-10 text-gray-500">
          Brak ogłoszeń w tej kategorii. Bądź pierwszą osobą, która coś doda!
        </p>
      ) : (
        <div className="mt-10 grid gap-6 md:grid-cols-3">
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
            />
          ))}
        </div>
      )}

    </main>
  );
}
