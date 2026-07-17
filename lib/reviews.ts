import { getCloudflareContext } from "@opennextjs/cloudflare";

export type PublicUser = {
  id: string;
  name: string;
  created_at: string | number;
};

export type Review = {
  id: number;
  listing_id: number;
  listing_title: string;
  reviewer_name: string;
  rating: number;
  body: string;
  created_at: string;
};

export type ReviewSummary = {
  average: number | null;
  count: number;
};

export async function getPublicUser(userId: string): Promise<PublicUser | null> {
  const { env } = await getCloudflareContext({ async: true });
  const user = await env.DB.prepare(
    `SELECT id, name, "createdAt" AS created_at
     FROM "user"
     WHERE id = ?
     LIMIT 1`,
  )
    .bind(userId)
    .first<PublicUser>();

  return user ?? null;
}

export async function getReviewsForUser(userId: string): Promise<Review[]> {
  const { env } = await getCloudflareContext({ async: true });
  const result = await env.DB.prepare(
    `SELECT
       reviews.id,
       reviews.listing_id,
       listings.title AS listing_title,
       reviewer.name AS reviewer_name,
       reviews.rating,
       reviews.body,
       reviews.created_at
     FROM reviews
     JOIN listings ON listings.id = reviews.listing_id
     JOIN "user" AS reviewer ON reviewer.id = reviews.reviewer_id
     WHERE reviews.reviewed_id = ?
     ORDER BY reviews.created_at DESC`,
  )
    .bind(userId)
    .all<Review>();

  return result.results;
}

export async function getReviewSummary(userId: string): Promise<ReviewSummary> {
  const { env } = await getCloudflareContext({ async: true });
  const result = await env.DB.prepare(
    `SELECT AVG(rating) AS average, COUNT(*) AS count
     FROM reviews
     WHERE reviewed_id = ?`,
  )
    .bind(userId)
    .first<{ average: number | null; count: number }>();

  return {
    average: result?.average ?? null,
    count: result?.count ?? 0,
  };
}
