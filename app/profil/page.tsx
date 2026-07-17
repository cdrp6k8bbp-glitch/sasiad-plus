import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AuthNav from "@/components/AuthNav";
import ListingCard from "@/components/ListingCard";
import ListingOwnerActions from "@/components/ListingOwnerActions";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ReservationCard from "@/components/ReservationCard";
import { auth } from "@/lib/auth";
import {
  getFavoriteListingsByUser,
  getListingsByOwner,
} from "@/lib/db";
import {
  getReservationsForOwner,
  getReservationsForRequester,
} from "@/lib/reservations";

export default async function ProfilPage({
  searchParams,
}: {
  searchParams: Promise<{ usunieto?: string; oceniono?: string }>;
}) {
  const { usunieto, oceniono } = await searchParams;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/logowanie?redirect=/profil");
  }

  const [
    listings,
    favoriteListings,
    incomingReservations,
    requestedReservations,
  ] = await Promise.all([
    getListingsByOwner(session.user.id),
    getFavoriteListingsByUser(session.user.id),
    getReservationsForOwner(session.user.id),
    getReservationsForRequester(session.user.id),
  ]);

  return (
    <main className="min-h-screen bg-[#f7faf8] pb-16 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-8">
          <Link href="/" className="text-2xl font-black text-green-700">
            Sąsiad+
          </Link>

          <AuthNav />
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 md:px-8">
        <Link
          href="/"
          className="inline-flex font-semibold text-green-700 hover:underline"
        >
          ← Wróć na stronę główną
        </Link>

        <ProfileHeader
          name={session.user.name}
          email={session.user.email}
          createdAt={new Date(session.user.createdAt)}
        />

        {usunieto === "1" && (
          <p className="rounded-2xl bg-green-100 px-5 py-4 font-bold text-green-800">
            ✓ Ogłoszenie zostało usunięte.
          </p>
        )}

        {oceniono === "1" && (
          <p className="rounded-2xl bg-green-100 px-5 py-4 font-bold text-green-800">
            ✓ Dziękujemy — Twoja opinia została opublikowana.
          </p>
        )}

        <Link
          href={`/u/${session.user.id}`}
          className="inline-flex font-bold text-green-700 hover:underline"
        >
          Zobacz swój publiczny profil i opinie →
        </Link>

        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-semibold text-green-700">Twoje oferty</p>
              <h2 className="mt-1 text-3xl font-black tracking-tight">
                Moje ogłoszenia
              </h2>
            </div>

            <span className="text-sm font-semibold text-slate-500">
              {listings.length} {listings.length === 1 ? "ogłoszenie" : "ogłoszeń"}
            </span>
          </div>

          {listings.length === 0 ? (
            <div className="mt-7 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <div className="text-5xl">📦</div>
              <h3 className="mt-4 text-xl font-black">
                Nie masz jeszcze ogłoszeń
              </h3>
              <p className="mt-2 text-slate-600">
                Dodaj pierwszą ofertę — zostanie automatycznie przypisana do
                Twojego konta.
              </p>
            </div>
          ) : (
            <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing) => (
                <div key={listing.id} className="space-y-3">
                  <ListingCard
                    id={listing.id}
                    icon={listing.icon}
                    imageKey={listing.image_key}
                    subcategory={listing.subcategory}
                    title={listing.title}
                    place={listing.location}
                    price={listing.price}
                    ownerName={listing.owner_name}
                    ownerId={listing.owner_id}
                    showFavorite={false}
                    isReserved={Boolean(listing.is_reserved)}
                  />
                  <ListingOwnerActions listingId={listing.id} compact />
                </div>
              ))}
            </div>
          )}
        </section>

        <section
          id="ulubione"
          className="scroll-mt-6 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-8"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-semibold text-red-600">Zapisane oferty</p>
              <h2 className="mt-1 text-3xl font-black tracking-tight">
                Ulubione
              </h2>
            </div>
            <span className="text-sm font-semibold text-slate-500">
              {favoriteListings.length} zapisanych
            </span>
          </div>

          {favoriteListings.length === 0 ? (
            <div className="mt-7 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <div className="text-5xl">♡</div>
              <h3 className="mt-4 text-xl font-black">
                Nie masz jeszcze ulubionych
              </h3>
              <p className="mt-2 text-slate-600">
                Kliknij serduszko przy interesującym ogłoszeniu, aby zapisać je tutaj.
              </p>
              <Link
                href="/"
                className="mt-5 inline-flex rounded-full bg-green-700 px-6 py-3 font-bold text-white"
              >
                Przeglądaj ogłoszenia
              </Link>
            </div>
          ) : (
            <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {favoriteListings.map((listing) => (
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
                  isFavorite
                  isReserved={Boolean(listing.is_reserved)}
                />
              ))}
            </div>
          )}
        </section>

        <section
          id="rezerwacje"
          className="scroll-mt-6 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-8"
        >
          <p className="font-semibold text-blue-700">Terminy i prośby</p>
          <h2 className="mt-1 text-3xl font-black tracking-tight">
            Rezerwacje
          </h2>

          <div className="mt-7 grid gap-8 lg:grid-cols-2">
            <div>
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-xl font-black">Prośby do Ciebie</h3>
                <span className="text-sm font-semibold text-slate-500">
                  {incomingReservations.filter((item) => item.status === "pending").length} nowych
                </span>
              </div>
              {incomingReservations.length === 0 ? (
                <p className="mt-4 rounded-2xl bg-slate-50 p-5 text-slate-500">
                  Nie masz jeszcze próśb o rezerwację.
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {incomingReservations.map((reservation) => (
                    <ReservationCard
                      key={reservation.id}
                      reservation={reservation}
                      perspective="owner"
                    />
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-xl font-black">Twoje rezerwacje</h3>
              {requestedReservations.length === 0 ? (
                <p className="mt-4 rounded-2xl bg-slate-50 p-5 text-slate-500">
                  Nie wysłano jeszcze żadnej prośby o termin.
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {requestedReservations.map((reservation) => (
                    <ReservationCard
                      key={reservation.id}
                      reservation={reservation}
                      perspective="requester"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <Link
          href="/dodaj"
          className="inline-flex rounded-full bg-green-700 px-6 py-3 font-bold text-white transition hover:bg-green-800"
        >
          + Dodaj ogłoszenie
        </Link>
      </div>
    </main>
  );
}
