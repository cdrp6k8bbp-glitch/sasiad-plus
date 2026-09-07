import Link from "next/link";
import ListingCard from "@/components/ListingCard";
import { saveSearchAlert } from "@/app/wyszukiwanie/actions";
import { CATEGORIES, type CategoryKey } from "@/lib/categories";
import type { Listing } from "@/lib/db";
import { listingAvailabilityStateFromRecord } from "@/lib/listing-availability";
import { SEARCH_RADII, type SearchRadius } from "@/lib/locations";

const categoryPaths: Record<CategoryKey, string> = {
  sprzet: "/sprzet",
  pomoc: "/uslugi",
  zwierzeta: "/kategoria/zwierzeta",
  dzieci: "/kategoria/dzieci",
  turystyka: "/kategoria/turystyka",
  ogrod: "/kategoria/ogrod",
  dom: "/kategoria/dom",
  rozwoj: "/rozwoj-osobisty",
};

type EmptySearchStateProps = {
  alertSaved?: boolean;
  categories?: string;
  favoriteIds?: ReadonlySet<number>;
  location: string;
  pathname: string;
  query: string;
  radius: SearchRadius;
  similarListings?: Listing[];
};

function searchPath(pathname: string, query: string, location: string, radius: number) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (location) params.set("location", location);
  params.set("radius", String(radius));
  return `${pathname}?${params.toString()}`;
}

export default function EmptySearchState({
  alertSaved = false,
  categories = "",
  favoriteIds = new Set<number>(),
  location,
  pathname,
  query,
  radius,
  similarListings = [],
}: EmptySearchStateProps) {
  const returnPath = searchPath(pathname, query, location, radius);
  const demandParams = new URLSearchParams({
    q: query,
    location,
    radius: String(radius),
    categories,
  });

  return (
    <div>
      <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-center sm:p-10">
        <div className="text-5xl">🔍</div>
        <h3 className="mt-4 text-2xl font-black">Nie znaleziono pasujących ogłoszeń</h3>
        <p className="mx-auto mt-2 max-w-2xl text-slate-600">
          Nie musisz kończyć poszukiwań. Zapisz alert, dodaj zapotrzebowanie albo poszerz okolicę.
        </p>

        {alertSaved && (
          <p className="mx-auto mt-5 max-w-xl rounded-2xl border border-green-200 bg-green-50 p-4 font-bold text-green-800">
            🔔 Alert został zapisany. Powiadomimy Cię w Sąsiad+, gdy pojawi się pasująca oferta.
          </p>
        )}

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <form action={saveSearchAlert}>
            <input type="hidden" name="query" value={query} />
            <input type="hidden" name="location" value={location} />
            <input type="hidden" name="radius" value={radius} />
            <input type="hidden" name="categories" value={categories} />
            <input type="hidden" name="return_path" value={returnPath} />
            <button type="submit" className="rounded-full bg-green-700 px-5 py-3 font-black text-white hover:bg-green-800">
              🔔 Powiadom mnie o ofercie
            </button>
          </form>
          <Link href={`/zapotrzebowania/dodaj?${demandParams.toString()}`} className="rounded-full border border-green-700 px-5 py-3 font-black text-green-700 hover:bg-green-50">
            + Dodaj zapotrzebowanie
          </Link>
          <Link href={pathname} className="rounded-full border border-slate-300 px-5 py-3 font-bold text-slate-700 hover:bg-slate-50">
            Wyczyść filtry
          </Link>
        </div>

        {location && (
          <div className="mt-7 border-t border-slate-100 pt-6">
            <p className="text-sm font-bold text-slate-600">Szukaj w większej okolicy:</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {SEARCH_RADII.map((distance) => (
                <Link
                  key={distance}
                  href={searchPath(pathname, query, location, distance)}
                  className={`rounded-full px-4 py-2 text-sm font-black ${distance === radius ? "bg-green-700 text-white" : "bg-green-50 text-green-800 hover:bg-green-100"}`}
                >
                  {distance} km
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="mt-8">
        <h3 className="text-xl font-black">Sprawdź podobne kategorie</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          {(Object.keys(CATEGORIES) as CategoryKey[]).map((key) => (
            <Link key={key} href={categoryPaths[key]} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold hover:border-green-300 hover:text-green-700">
              {CATEGORIES[key].icon} {CATEGORIES[key].label}
            </Link>
          ))}
          <Link href="/zapotrzebowania" className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-900">🔎 Czego szukają sąsiedzi?</Link>
        </div>
      </section>

      {similarListings.length > 0 && (
        <section className="mt-10">
          <div className="flex items-end justify-between gap-3">
            <div><p className="font-bold text-green-700">Może zainteresuje Cię również</p><h3 className="mt-1 text-2xl font-black">Podobne i najnowsze oferty</h3></div>
          </div>
          <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {similarListings.map((listing) => (
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
                ownerCreatedAt={listing.owner_created_at}
                ownerRating={listing.owner_rating}
                ownerReviewCount={listing.owner_review_count}
                ownerCompletedCount={listing.owner_completed_count}
                isFavorite={favoriteIds.has(listing.id)}
                isReserved={Boolean(listing.is_reserved)}
                availabilityState={listingAvailabilityStateFromRecord(listing)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
