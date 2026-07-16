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
  owner_id: string | null;
  owner_name: string | null;
  created_at: string;
};

const LISTING_COLUMNS = `
  listings.id,
  listings.title,
  listings.category,
  listings.subcategory,
  listings.description,
  listings.price,
  listings.location,
  listings.icon,
  listings.image_key,
  listings.owner_id,
  listings.created_at,
  "user".name AS owner_name
`;

const LISTING_SOURCE = `
  FROM listings
  LEFT JOIN "user" ON "user".id = listings.owner_id
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
       ${LISTING_SOURCE}
       WHERE listings.category IN (${placeholders})
       ORDER BY listings.created_at DESC
       LIMIT ?`,
    )
      .bind(...category, limit)
      .all<Listing>();

    return result.results;
  }

  if (typeof category === "string" && category.length > 0) {
    const result = await env.DB.prepare(
      `SELECT ${LISTING_COLUMNS}
       ${LISTING_SOURCE}
       WHERE listings.category = ?
       ORDER BY listings.created_at DESC
       LIMIT ?`,
    )
      .bind(category, limit)
      .all<Listing>();

    return result.results;
  }

  const result = await env.DB.prepare(
    `SELECT ${LISTING_COLUMNS}
     ${LISTING_SOURCE}
     ORDER BY listings.created_at DESC
     LIMIT ?`,
  )
    .bind(limit)
    .all<Listing>();

  return result.results;
}

export async function getListingsByOwner(ownerId: string): Promise<Listing[]> {
  const { env } = await getCloudflareContext({ async: true });

  const result = await env.DB.prepare(
    `SELECT ${LISTING_COLUMNS}
     ${LISTING_SOURCE}
     WHERE listings.owner_id = ?
     ORDER BY listings.created_at DESC`,
  )
    .bind(ownerId)
    .all<Listing>();

  return result.results;
}

export async function getListingById(id: number): Promise<Listing | null> {
  const { env } = await getCloudflareContext({ async: true });

  const listing = await env.DB.prepare(
    `SELECT ${LISTING_COLUMNS}
     ${LISTING_SOURCE}
     WHERE listings.id = ?
     LIMIT 1`,
  )
    .bind(id)
    .first<Listing>();

  return listing ?? null;
}
