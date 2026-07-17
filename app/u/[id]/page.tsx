import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import AuthNav from "@/components/AuthNav";
import ListingCard from "@/components/ListingCard";
import TrustBadge from "@/components/profile/TrustBadge";
import TrustPanel from "@/components/profile/TrustPanel";
import UserStats from "@/components/profile/UserStats";
import { auth } from "@/lib/auth";
import {
  getFavoriteListingIds,
  getListingsByOwner,
} from "@/lib/db";
import {
  getPublicUser,
  getReviewsForUser,
  getReviewSummary,
} from "@/lib/reviews";
import { getTrustLevel, getUserTrustStats } from "@/lib/trust";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function formatDate(value: string | number): string {
  return new Intl.DateTimeFormat("pl-PL", {
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [user, reviews, summary, listings, session, trustStats] = await Promise.all([
    getPublicUser(id),
    getReviewsForUser(id),
    getReviewSummary(id),
    getListingsByOwner(id),
    auth.api.getSession({ headers: await headers() }),
    getUserTrustStats(id),
  ]);

  if (!user) {
    notFound();
  }

  const favoriteIds = new Set(
    session ? await getFavoriteListingIds(session.user.id) : [],
  );
  const trustLevel = getTrustLevel(trustStats);

  return (
    <main className="min-h-screen bg-[#f7faf8] pb-16 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-8">
          <Link href="/" className="text-2xl font-black text-green-700">
            Sąsiad+
          </Link>
          <AuthNav />
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 md:px-8">
        <Link href="/" className="font-semibold text-green-700 hover:underline">
          ← Wróć do ogłoszeń
        </Link>

        <section className="flex flex-col gap-6 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center md:p-8">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-600 to-emerald-400 text-3xl font-black text-white">
            {initials(user.name) || "S+"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <p className="font-semibold text-green-700">Profil sąsiada</p>
              <TrustBadge level={trustLevel} />
            </div>
            <h1 className="mt-1 text-4xl font-black">{user.name}</h1>
            <p className="mt-2 text-slate-500">
              🏡 W Sąsiad+ od {formatDate(user.created_at)}
            </p>
            <p className="mt-3 text-xl font-black text-amber-600">
              {summary.average !== null
                ? `⭐ ${summary.average.toFixed(1)} · ${summary.count} opinii`
                : "☆ Brak opinii"}
            </p>
          </div>
        </section>

        <UserStats
          activeListings={trustStats.activeListings}
          completedTotal={trustStats.completedTotal}
          reviewCount={trustStats.reviewCount}
          joinedYear={new Date(user.created_at).getFullYear()}
        />

        <TrustPanel level={trustLevel} stats={trustStats} />

        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-3xl font-black">Opinie sąsiadów</h2>
          {reviews.length === 0 ? (
            <p className="mt-6 rounded-2xl bg-slate-50 p-6 text-slate-500">
              Ten użytkownik nie ma jeszcze opinii po zakończonych rezerwacjach.
            </p>
          ) : (
            <div className="mt-6 space-y-4">
              {reviews.map((review) => (
                <article key={review.id} className="rounded-3xl border border-slate-200 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-black">{review.reviewer_name}</p>
                    <p className="font-black text-amber-500">
                      {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                    </p>
                  </div>
                  <p className="mt-3 leading-7 text-slate-600">{review.body}</p>
                  <Link
                    href={`/ogloszenie/${review.listing_id}`}
                    className="mt-3 inline-flex text-sm font-bold text-green-700 hover:underline"
                  >
                    {review.listing_title}
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-3xl font-black">Ogłoszenia użytkownika</h2>
          {listings.length === 0 ? (
            <p className="mt-5 text-slate-500">Brak aktywnych ogłoszeń.</p>
          ) : (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                  ownerId={listing.owner_id}
                  ownerName={listing.owner_name}
                  isFavorite={favoriteIds.has(listing.id)}
                  isReserved={Boolean(listing.is_reserved)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
