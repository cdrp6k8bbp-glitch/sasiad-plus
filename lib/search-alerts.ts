import "server-only";
import { matchesLocationSearch, parseSearchRadius } from "@/lib/locations";
import { createNotificationStatement } from "@/lib/notifications";

export type SearchAlert = {
  id: number;
  user_id: string;
  query: string;
  categories: string;
  location: string;
  radius: number;
  kind: "alert" | "demand";
  description: string | null;
  created_at: string;
};

export type Demand = SearchAlert & { user_name: string };

type ListingForMatching = {
  id: number;
  title: string;
  description: string;
  subcategory: string;
  category: string;
  location: string;
  ownerId: string;
};

export function alertMatchesListing(
  alert: SearchAlert,
  listing: ListingForMatching,
) {
  const categories = alert.categories.split(",").filter(Boolean);
  const searchable = `${listing.title} ${listing.description} ${listing.subcategory}`
    .toLocaleLowerCase("pl");
  const query = alert.query.toLocaleLowerCase("pl");

  return (
    alert.user_id !== listing.ownerId &&
    (!query || searchable.includes(query)) &&
    (categories.length === 0 || categories.includes(listing.category)) &&
    matchesLocationSearch(
      listing.location,
      alert.location,
      parseSearchRadius(String(alert.radius)),
    )
  );
}

export async function notifyMatchingSearchAlerts(
  db: D1Database,
  listing: ListingForMatching,
): Promise<number> {
  const result = await db
    .prepare(
      `SELECT id, user_id, query, categories, location, radius, kind,
              description, created_at
       FROM search_alerts
       WHERE active = 1
         AND (kind = 'alert' OR created_at >= datetime('now', '-30 days'))
       ORDER BY created_at DESC
       LIMIT 500`,
    )
    .all<SearchAlert>();
  const matches = result.results.filter((alert) =>
    alertMatchesListing(alert, listing),
  );

  if (matches.length === 0) return 0;

  for (let index = 0; index < matches.length; index += 50) {
    const batch = matches.slice(index, index + 50);
    await db.batch(
      batch.flatMap((alert) => [
        createNotificationStatement(db, {
          userId: alert.user_id,
          type: "search_match",
          title: "Pojawiła się pasująca oferta",
          body: `${listing.title} · ${listing.location}`,
          href: `/ogloszenie/${listing.id}`,
        }),
        db
          .prepare(
            `UPDATE search_alerts SET last_notified_at = datetime('now') WHERE id = ?`,
          )
          .bind(alert.id),
      ]),
    );
  }

  return matches.length;
}

export async function getActiveDemands(db: D1Database, limit = 100) {
  const result = await db
    .prepare(
      `SELECT search_alerts.id, search_alerts.user_id, search_alerts.query,
              search_alerts.categories, search_alerts.location,
              search_alerts.radius, search_alerts.kind,
              search_alerts.description, search_alerts.created_at,
              "user".name AS user_name
       FROM search_alerts
       JOIN "user" ON "user".id = search_alerts.user_id
       WHERE search_alerts.active = 1
         AND search_alerts.kind = 'demand'
         AND search_alerts.created_at >= datetime('now', '-30 days')
       ORDER BY search_alerts.created_at DESC
       LIMIT ?`,
    )
    .bind(limit)
    .all<Demand>();

  return result.results;
}
