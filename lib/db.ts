import { getCloudflareContext } from "@opennextjs/cloudflare";

export type Listing = {
  id: number;
  title: string;
  category: string;
  subcategory: string | null;
  description: string;
  price: string;
  location: string;
  icon: string;
  image_key: string | null;
  created_at: string;
};

const LISTING_COLUMNS = `
  id,
  title,
  category,
  subcategory,
  description,
  price,
  location,
  icon,
  image_key,
  created_at
`;

export async function getListings(
  category?: string | string[],
  limit = 20,
): Promise<Listing[]> {
  const { env } = await getCloudflareContext({ async: true });

  if (Array.isArray(category) && category.length > 0) {
    const placeholders = category.map(() => "?").join(", ");

    const result = await env.DB.prepare(
      `SELECT ${LISTING_COLUMNS}
       FROM listings
       WHERE category IN (${placeholders})
       ORDER BY created_at DESC
       LIMIT ?`,
    )
      .bind(...category, limit)
      .all<Listing>();

    return result.results;
  }

  if (typeof category === "string" && category.length > 0) {
    const result = await env.DB.prepare(
      `SELECT ${LISTING_COLUMNS}
       FROM listings
       WHERE category = ?
       ORDER BY created_at DESC
       LIMIT ?`,
    )
      .bind(category, limit)
      .all<Listing>();

    return result.results;
  }

  const result = await env.DB.prepare(
    `SELECT ${LISTING_COLUMNS}
     FROM listings
     ORDER BY created_at DESC
     LIMIT ?`,
  )
    .bind(limit)
    .all<Listing>();

  return result.results;
}

export async function getListingById(id: number): Promise<Listing | null> {
  const { env } = await getCloudflareContext({ async: true });

  const listing = await env.DB.prepare(
    `SELECT ${LISTING_COLUMNS}
     FROM listings
     WHERE id = ?
     LIMIT 1`,
  )
    .bind(id)
    .first<Listing>();

  return listing ?? null;
}
