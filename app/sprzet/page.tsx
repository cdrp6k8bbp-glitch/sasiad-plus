import ListingCard from "@/components/ListingCard";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getFavoriteListingIds, getListings } from "@/lib/db";

export default async function Sprzet() {
  const [listings, session] = await Promise.all([
    getListings("sprzet"),
    auth.api.getSession({ headers: await headers() }),
  ]);
  const favoriteIds = new Set(
    session ? await getFavoriteListingIds(session.user.id) : [],
  );

  return (
    <main className="min-h-screen bg-slate-50 p-8">

      <h1 className="text-4xl font-bold text-green-600">
        🛠 Wypożycz sprzęt
      </h1>

      <p className="mt-4 text-gray-600">
        Znajdź narzędzia w swojej okolicy.
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
  ownerName={listing.owner_name}
  ownerId={listing.owner_id}
  isFavorite={favoriteIds.has(listing.id)}
  isReserved={Boolean(listing.is_reserved)}
/>
          ))}
        </div>
      )}

    </main>
  );
}
