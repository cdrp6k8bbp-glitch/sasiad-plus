import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import OwnerSummary from "@/components/OwnerSummary";
import ListingGallery from "@/components/ListingGallery";
import { auth } from "@/lib/auth";
import { getListingById } from "@/lib/db";
import { parseListingImageKeys } from "@/lib/listing-images";
import { startConversation } from "@/app/wiadomosci/actions";
import ListingOwnerActions from "@/components/ListingOwnerActions";
import FavoriteButton from "@/components/FavoriteButton";
import { getFavoriteListingIds } from "@/lib/db";

const categoryNames: Record<string, string> = {
  sprzet: "Sprzęt",
  usluga: "Pomoc sąsiedzka",
  pomoc: "Pomoc sąsiedzka",
  zwierzeta: "Opieka nad zwierzętami",
  dzieci: "Opieka nad dziećmi",
  turystyka: "Turystyka",
  ogrod: "Ogród",
  dom: "Dom",
};

export default async function ListingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ zapisano?: string }>;
}) {
  const { id } = await params;
  const { zapisano } = await searchParams;
  const listingId = Number(id);

  if (!Number.isInteger(listingId) || listingId < 1) {
    notFound();
  }

  const listing = await getListingById(listingId);

  if (!listing) {
    notFound();
  }

  const session = await auth.api.getSession({ headers: await headers() });
  const isOwner = session?.user.id === listing.owner_id;
  const isFavorite = session
    ? (await getFavoriteListingIds(session.user.id)).includes(listing.id)
    : false;
  const imageKeys = parseListingImageKeys(
    listing.image_keys,
    listing.image_key,
  );

  return (
    <main className="min-h-screen bg-[#f7faf8] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
          <Link href="/" className="text-2xl font-black text-green-700">
            Sąsiad+
          </Link>

          <Link
            href="/dodaj"
            className="rounded-full bg-green-700 px-5 py-3 font-semibold text-white"
          >
            + Dodaj ogłoszenie
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <Link href="/" className="font-semibold text-green-700 hover:underline">
          ← Wróć
        </Link>

        {zapisano === "1" && (
          <p className="mt-6 rounded-2xl bg-green-100 px-5 py-4 font-bold text-green-800">
            ✓ Zmiany w ogłoszeniu zostały zapisane.
          </p>
        )}

        <div className="mt-7 grid gap-8 lg:grid-cols-[1.5fr_0.8fr]">
          <section>
            {imageKeys.length > 0 ? (
              <ListingGallery imageKeys={imageKeys} title={listing.title} />
            ) : (
              <div className="flex min-h-[360px] items-center justify-center overflow-hidden rounded-[36px] bg-gradient-to-br from-green-50 to-emerald-100 md:min-h-[500px]">
                <span className="text-9xl">{listing.icon}</span>
              </div>
            )}

            <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 md:p-8">
              <p className="text-sm font-bold uppercase tracking-wider text-green-700">
                {categoryNames[listing.category] ?? listing.category}
                {listing.subcategory ? ` · ${listing.subcategory}` : ""}
              </p>

              <h1 className="mt-3 text-3xl font-black md:text-5xl">
                {listing.title}
              </h1>

              <p className="mt-4 text-lg text-slate-500">
                📍 {listing.location}
              </p>

              <div className="mt-8 border-t border-slate-200 pt-7">
                <h2 className="text-2xl font-black">Opis ogłoszenia</h2>
                <p className="mt-4 whitespace-pre-wrap leading-8 text-slate-600">
                  {listing.description || "Autor nie dodał szczegółowego opisu."}
                </p>
              </div>
            </div>
          </section>

          <aside>
            <div className="sticky top-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
              <p className="text-sm text-slate-500">Cena</p>
              <p className="mt-1 text-3xl font-black text-green-700">
                {listing.price}
              </p>

              <div className="mt-6 rounded-2xl bg-green-50 p-4 text-green-800">
                <p className="font-bold">🟢 Dostępne</p>
                <p className="mt-1 text-sm">
                  Ustal termin bezpośrednio z właścicielem.
                </p>
              </div>

              {!listing.owner_id ? (
                <p className="mt-6 rounded-2xl bg-slate-100 p-4 text-center text-sm font-semibold text-slate-600">
                  Kontakt jest niedostępny dla starszego ogłoszenia.
                </p>
              ) : isOwner ? (
                <ListingOwnerActions listingId={listing.id} />
              ) : !session ? (
                <Link
                  href={`/logowanie?redirect=/ogloszenie/${listing.id}`}
                  className="mt-6 flex w-full items-center justify-center rounded-2xl bg-green-700 px-6 py-4 font-bold text-white hover:bg-green-800"
                >
                  Zaloguj się, aby napisać
                </Link>
              ) : (
                <form action={startConversation}>
                  <input type="hidden" name="listing_id" value={listing.id} />
                  <button
                    type="submit"
                    className="mt-6 w-full rounded-2xl bg-green-700 px-6 py-4 font-bold text-white hover:bg-green-800"
                  >
                    Napisz do właściciela
                  </button>
                </form>
              )}

              {!isOwner && (
                <FavoriteButton
                  listingId={listing.id}
                  initialIsFavorite={isFavorite}
                  wide
                />
              )}

              <div className="mt-6 border-t border-slate-200 pt-6">
                <OwnerSummary ownerName={listing.owner_name} />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
