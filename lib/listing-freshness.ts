export const LISTING_FRESHNESS_DAYS = 60;
export const LISTING_FRESHNESS_REMINDER_DAYS = 53;

export type ListingFreshnessRecipient = {
  listingId: number;
  title: string;
  userId: string;
  email: string;
};

export type ListingFreshnessSummary = {
  reminded: ListingFreshnessRecipient[];
  archived: ListingFreshnessRecipient[];
};

type FreshnessRow = {
  listing_id: number;
  title: string;
  user_id: string;
  email: string;
};

function isoDaysAgo(now: Date, days: number): string {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
}

function toRecipient(row: FreshnessRow): ListingFreshnessRecipient {
  return {
    listingId: row.listing_id,
    title: row.title,
    userId: row.user_id,
    email: row.email,
  };
}

const WITHOUT_CURRENT_RESERVATION = `
  NOT EXISTS (
    SELECT 1
    FROM reservations
    WHERE reservations.listing_id = listings.id
      AND reservations.status IN ('pending', 'accepted')
      AND reservations.completed_at IS NULL
      AND reservations.end_date >= date(?)
  )
`;

export async function runListingFreshnessMaintenance(
  db: D1Database,
  now = new Date(),
): Promise<ListingFreshnessSummary> {
  const reminderCutoff = isoDaysAgo(now, LISTING_FRESHNESS_REMINDER_DAYS);
  const archiveCutoff = isoDaysAgo(now, LISTING_FRESHNESS_DAYS);
  const nowIso = now.toISOString();

  const remindedResult = await db
    .prepare(
      `SELECT listings.id AS listing_id, listings.title, "user".id AS user_id, "user".email
       FROM listings
       JOIN "user" ON "user".id = listings.owner_id
       WHERE listings.archived_at IS NULL
         AND listings.freshness_reminded_at IS NULL
         AND datetime(COALESCE(listings.freshness_confirmed_at, listings.created_at)) <= datetime(?)
         AND datetime(COALESCE(listings.freshness_confirmed_at, listings.created_at)) > datetime(?)
         AND ${WITHOUT_CURRENT_RESERVATION}
       ORDER BY listings.id
       LIMIT 100`,
    )
    .bind(reminderCutoff, archiveCutoff, nowIso)
    .all<FreshnessRow>();

  const archivedResult = await db
    .prepare(
      `SELECT listings.id AS listing_id, listings.title, "user".id AS user_id, "user".email
       FROM listings
       JOIN "user" ON "user".id = listings.owner_id
       WHERE listings.archived_at IS NULL
         AND datetime(COALESCE(listings.freshness_confirmed_at, listings.created_at)) <= datetime(?)
         AND ${WITHOUT_CURRENT_RESERVATION}
       ORDER BY listings.id
       LIMIT 100`,
    )
    .bind(archiveCutoff, nowIso)
    .all<FreshnessRow>();

  const reminded = remindedResult.results.map(toRecipient);
  const archived = archivedResult.results.map(toRecipient);
  const statements: D1PreparedStatement[] = [];

  for (const listing of reminded) {
    statements.push(
      db
        .prepare(
          `INSERT INTO notifications (user_id, type, title, body, href)
           VALUES (?, 'listing_freshness_reminder', ?, ?, ?)`,
        )
        .bind(
          listing.userId,
          "Czy Twoje ogłoszenie jest nadal aktualne?",
          `Potwierdź aktualność oferty „${listing.title}”, aby pozostała widoczna.`,
          `/ogloszenie/${listing.listingId}`,
        ),
      db
        .prepare(
          `UPDATE listings
           SET freshness_reminded_at = ?
           WHERE id = ? AND archived_at IS NULL AND freshness_reminded_at IS NULL`,
        )
        .bind(nowIso, listing.listingId),
    );
  }

  for (const listing of archived) {
    statements.push(
      db
        .prepare(
          `INSERT INTO notifications (user_id, type, title, body, href)
           VALUES (?, 'listing_archived', ?, ?, ?)`,
        )
        .bind(
          listing.userId,
          "Ogłoszenie przeniesiono do archiwum",
          `Oferta „${listing.title}” nie była potwierdzona przez 60 dni. Możesz ją przywrócić w profilu.`,
          "/profil#ogloszenia",
        ),
      db
        .prepare(
          `UPDATE listings
           SET archived_at = ?
           WHERE id = ? AND archived_at IS NULL`,
        )
        .bind(nowIso, listing.listingId),
    );
  }

  if (statements.length > 0) await db.batch(statements);

  return { reminded, archived };
}
