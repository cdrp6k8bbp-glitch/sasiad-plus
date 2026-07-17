import { getCloudflareContext } from "@opennextjs/cloudflare";

export type TrustLevel =
  | "Nowy Sąsiad"
  | "Zweryfikowany Sąsiad"
  | "Zaufany Sąsiad"
  | "Ambasador Sąsiedztwa";

export type TrustStats = {
  activeListings: number;
  completedAsOwner: number;
  completedAsRequester: number;
  completedTotal: number;
  reviewCount: number;
  averageRating: number | null;
};

export function getTrustLevel(stats: TrustStats): TrustLevel {
  if (
    stats.completedTotal >= 10 &&
    stats.reviewCount >= 5 &&
    (stats.averageRating ?? 0) >= 4.7
  ) {
    return "Ambasador Sąsiedztwa";
  }

  if (
    stats.completedTotal >= 5 &&
    stats.reviewCount >= 3 &&
    (stats.averageRating ?? 0) >= 4.5
  ) {
    return "Zaufany Sąsiad";
  }

  if (stats.completedTotal >= 1) {
    return "Zweryfikowany Sąsiad";
  }

  return "Nowy Sąsiad";
}

export async function getUserTrustStats(userId: string): Promise<TrustStats> {
  const { env } = await getCloudflareContext({ async: true });
  const result = await env.DB.prepare(
    `SELECT
       (SELECT COUNT(*) FROM listings WHERE owner_id = ?) AS active_listings,
       (
         SELECT COUNT(*)
         FROM reservations
         WHERE owner_id = ?
           AND status = 'accepted'
           AND completed_at IS NOT NULL
       ) AS completed_as_owner,
       (
         SELECT COUNT(*)
         FROM reservations
         WHERE requester_id = ?
           AND status = 'accepted'
           AND completed_at IS NOT NULL
       ) AS completed_as_requester,
       (SELECT COUNT(*) FROM reviews WHERE reviewed_id = ?) AS review_count,
       (SELECT AVG(rating) FROM reviews WHERE reviewed_id = ?) AS average_rating`,
  )
    .bind(userId, userId, userId, userId, userId)
    .first<{
      active_listings: number;
      completed_as_owner: number;
      completed_as_requester: number;
      review_count: number;
      average_rating: number | null;
    }>();

  const completedAsOwner = result?.completed_as_owner ?? 0;
  const completedAsRequester = result?.completed_as_requester ?? 0;

  return {
    activeListings: result?.active_listings ?? 0,
    completedAsOwner,
    completedAsRequester,
    completedTotal: completedAsOwner + completedAsRequester,
    reviewCount: result?.review_count ?? 0,
    averageRating: result?.average_rating ?? null,
  };
}
