import { getCloudflareContext } from "@opennextjs/cloudflare";

export type ReservationStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "cancelled";

export type Reservation = {
  id: number;
  listing_id: number;
  listing_title: string;
  requester_id: string;
  requester_name: string;
  owner_id: string;
  owner_name: string;
  start_date: string;
  end_date: string;
  note: string | null;
  status: ReservationStatus;
  completed_at: string | null;
  review_id: number | null;
  created_at: string;
};

const RESERVATION_COLUMNS = `
  reservations.id,
  reservations.listing_id,
  listings.title AS listing_title,
  reservations.requester_id,
  requester.name AS requester_name,
  reservations.owner_id,
  owner.name AS owner_name,
  reservations.start_date,
  reservations.end_date,
  reservations.note,
  reservations.status,
  reservations.completed_at,
  (
    SELECT reviews.id
    FROM reviews
    WHERE reviews.reservation_id = reservations.id
    LIMIT 1
  ) AS review_id,
  reservations.created_at
`;

const RESERVATION_SOURCE = `
  FROM reservations
  JOIN listings ON listings.id = reservations.listing_id
  JOIN "user" AS requester ON requester.id = reservations.requester_id
  JOIN "user" AS owner ON owner.id = reservations.owner_id
`;

export async function getReservationsForOwner(
  ownerId: string,
): Promise<Reservation[]> {
  const { env } = await getCloudflareContext({ async: true });
  const result = await env.DB.prepare(
    `SELECT ${RESERVATION_COLUMNS}
     ${RESERVATION_SOURCE}
     WHERE reservations.owner_id = ?
     ORDER BY
       CASE reservations.status WHEN 'pending' THEN 0 ELSE 1 END,
       reservations.created_at DESC`,
  )
    .bind(ownerId)
    .all<Reservation>();

  return result.results;
}

export async function getReservationsForRequester(
  requesterId: string,
): Promise<Reservation[]> {
  const { env } = await getCloudflareContext({ async: true });
  const result = await env.DB.prepare(
    `SELECT ${RESERVATION_COLUMNS}
     ${RESERVATION_SOURCE}
     WHERE reservations.requester_id = ?
     ORDER BY reservations.created_at DESC`,
  )
    .bind(requesterId)
    .all<Reservation>();

  return result.results;
}

export async function getActiveReservationForListingAndUser(
  listingId: number,
  userId: string,
): Promise<Reservation | null> {
  const { env } = await getCloudflareContext({ async: true });
  const reservation = await env.DB.prepare(
    `SELECT ${RESERVATION_COLUMNS}
     ${RESERVATION_SOURCE}
     WHERE reservations.listing_id = ?
       AND reservations.requester_id = ?
       AND reservations.status IN ('pending', 'accepted')
       AND reservations.completed_at IS NULL
       AND reservations.end_date >= date('now')
     ORDER BY reservations.created_at DESC
     LIMIT 1`,
  )
    .bind(listingId, userId)
    .first<Reservation>();

  return reservation ?? null;
}
