"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { createNotificationStatement } from "@/lib/notifications";

function positiveInteger(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string") return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function dateValue(formData: FormData, field: string): string {
  const value = formData.get(field);

  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error("Wybierz prawidłowy termin rezerwacji.");
  }

  return value;
}

function timeValue(formData: FormData, field: string): string {
  const value = formData.get(field);

  if (
    typeof value !== "string" ||
    !/^(?:[01]\d|2[0-3]):(?:00|30)$/.test(value)
  ) {
    throw new Error("Wybierz godzinę z dokładnością do 30 minut.");
  }

  return value;
}

function reservationDateTime(date: string, time: string): string {
  return `${date} ${time}:00`;
}

function formatReservationPeriod(
  startDate: string,
  startTime: string,
  endDate: string,
  endTime: string,
): string {
  if (startDate === endDate) {
    return `${startDate}, ${startTime}–${endTime}`;
  }

  return `${startDate} ${startTime} – ${endDate} ${endTime}`;
}

function revalidateReservationPages(listingId: number) {
  revalidatePath("/");
  revalidatePath("/sprzet");
  revalidatePath("/uslugi");
  revalidatePath("/profil");
  revalidatePath(`/ogloszenie/${listingId}`);
}

export async function createReservation(formData: FormData): Promise<void> {
  const listingId = positiveInteger(formData.get("listing_id"));
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect(
      listingId
        ? `/logowanie?redirect=/ogloszenie/${listingId}`
        : "/logowanie",
    );
  }

  if (!listingId) {
    throw new Error("Nieprawidłowe ogłoszenie.");
  }

  const startDate = dateValue(formData, "start_date");
  const endDate = dateValue(formData, "end_date");
  const startTime = timeValue(formData, "start_time");
  const endTime = timeValue(formData, "end_time");
  const today = new Date().toISOString().slice(0, 10);
  const startDateTime = reservationDateTime(startDate, startTime);
  const endDateTime = reservationDateTime(endDate, endTime);
  const noteValue = formData.get("note");
  const note = typeof noteValue === "string" ? noteValue.trim() : "";

  if (startDate < today || endDateTime <= startDateTime) {
    throw new Error("Termin rezerwacji jest nieprawidłowy.");
  }

  if (note.length > 500) {
    throw new Error("Wiadomość może mieć maksymalnie 500 znaków.");
  }

  const { env } = await getCloudflareContext({ async: true });
  const listing = await env.DB.prepare(
    `SELECT owner_id, title
     FROM listings
     WHERE id = ? AND archived_at IS NULL
     LIMIT 1`,
  )
    .bind(listingId)
    .first<{ owner_id: string | null; title: string }>();

  if (!listing?.owner_id) {
    throw new Error("To ogłoszenie nie przyjmuje jeszcze rezerwacji.");
  }

  if (listing.owner_id === session.user.id) {
    throw new Error("Nie można rezerwować własnego ogłoszenia.");
  }

  const currentRequest = await env.DB.prepare(
    `SELECT id
     FROM reservations
     WHERE listing_id = ?
       AND requester_id = ?
       AND status IN ('pending', 'accepted')
       AND completed_at IS NULL
       AND end_date >= date('now')
     LIMIT 1`,
  )
    .bind(listingId, session.user.id)
    .first<{ id: number }>();

  if (currentRequest) {
    throw new Error("Masz już aktywną prośbę dotyczącą tego ogłoszenia.");
  }

  const insertResult = await env.DB.prepare(
    `INSERT INTO reservations (
       listing_id,
       requester_id,
       owner_id,
       start_date,
       end_date,
       start_time,
       end_time,
       note
     )
     SELECT ?, ?, ?, ?, ?, ?, ?, ?
     WHERE NOT EXISTS (
       SELECT 1
       FROM reservations AS conflicting
       WHERE conflicting.listing_id = ?
         AND conflicting.status = 'accepted'
         AND conflicting.completed_at IS NULL
         AND datetime(conflicting.start_date || ' ' || conflicting.start_time) < datetime(?)
         AND datetime(conflicting.end_date || ' ' || conflicting.end_time) > datetime(?)
     )`,
  )
    .bind(
      listingId,
      session.user.id,
      listing.owner_id,
      startDate,
      endDate,
      startTime,
      endTime,
      note || null,
      listingId,
      endDateTime,
      startDateTime,
    )
    .run();

  if (insertResult.meta.changes !== 1) {
    throw new Error("Wybrany termin jest już zarezerwowany.");
  }

  await createNotificationStatement(env.DB, {
    userId: listing.owner_id,
    type: "reservation_created",
    title: "Nowa prośba o rezerwację",
    body: `${session.user.name} chce zarezerwować „${listing.title}” w terminie ${formatReservationPeriod(
      startDate,
      startTime,
      endDate,
      endTime,
    )}.`,
    href: "/profil#rezerwacje",
  }).run();

  revalidateReservationPages(listingId);
  redirect(`/ogloszenie/${listingId}?rezerwacja=wyslana`);
}

export async function respondToReservation(formData: FormData): Promise<void> {
  const reservationId = positiveInteger(formData.get("reservation_id"));
  const response = formData.get("response");
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/logowanie?redirect=/profil#rezerwacje");
  }

  if (!reservationId || (response !== "accepted" && response !== "rejected")) {
    throw new Error("Nieprawidłowa odpowiedź na rezerwację.");
  }

  const { env } = await getCloudflareContext({ async: true });
  const reservation = await env.DB.prepare(
    `SELECT
       reservations.id,
       reservations.listing_id,
       reservations.requester_id,
       reservations.owner_id,
       reservations.start_date,
       reservations.end_date,
       reservations.start_time,
       reservations.end_time,
       reservations.status,
       listings.title AS listing_title
     FROM reservations
     JOIN listings ON listings.id = reservations.listing_id
     WHERE reservations.id = ?
     LIMIT 1`,
  )
    .bind(reservationId)
    .first<{
      id: number;
      listing_id: number;
      requester_id: string;
      owner_id: string;
      start_date: string;
      end_date: string;
      start_time: string;
      end_time: string;
      status: string;
      listing_title: string;
    }>();

  if (!reservation || reservation.owner_id !== session.user.id) {
    throw new Error("Nie masz dostępu do tej rezerwacji.");
  }

  if (reservation.status !== "pending") {
    throw new Error("Ta prośba została już rozpatrzona.");
  }

  if (response === "accepted") {
    const startDateTime = reservationDateTime(
      reservation.start_date,
      reservation.start_time,
    );
    const endDateTime = reservationDateTime(
      reservation.end_date,
      reservation.end_time,
    );
    const acceptResult = await env.DB.prepare(
      `UPDATE reservations
       SET status = 'accepted', updated_at = datetime('now')
       WHERE id = ?
         AND owner_id = ?
         AND status = 'pending'
         AND NOT EXISTS (
           SELECT 1
           FROM reservations AS conflicting
           WHERE conflicting.listing_id = ?
             AND conflicting.id != ?
             AND conflicting.status = 'accepted'
             AND conflicting.completed_at IS NULL
             AND datetime(conflicting.start_date || ' ' || conflicting.start_time) < datetime(?)
             AND datetime(conflicting.end_date || ' ' || conflicting.end_time) > datetime(?)
         )`,
    )
      .bind(
        reservation.id,
        session.user.id,
        reservation.listing_id,
        reservation.id,
        endDateTime,
        startDateTime,
      )
      .run();

    if (acceptResult.meta.changes !== 1) {
      throw new Error(
        "Tego terminu nie można już zaakceptować, ponieważ koliduje z inną rezerwacją.",
      );
    }

    await env.DB.prepare(
      `UPDATE reservations
       SET status = 'rejected', updated_at = datetime('now')
       WHERE listing_id = ?
         AND id != ?
         AND status = 'pending'
         AND datetime(start_date || ' ' || start_time) < datetime(?)
         AND datetime(end_date || ' ' || end_time) > datetime(?)`,
    )
      .bind(
        reservation.listing_id,
        reservation.id,
        endDateTime,
        startDateTime,
      )
      .run();
  } else {
    await env.DB.prepare(
      `UPDATE reservations
       SET status = 'rejected', updated_at = datetime('now')
       WHERE id = ? AND owner_id = ? AND status = 'pending'`,
    )
      .bind(reservation.id, session.user.id)
      .run();
  }

  await createNotificationStatement(env.DB, {
    userId: reservation.requester_id,
    type:
      response === "accepted"
        ? "reservation_accepted"
        : "reservation_rejected",
    title:
      response === "accepted"
        ? "Rezerwacja zaakceptowana"
        : "Rezerwacja odrzucona",
    body:
      response === "accepted"
        ? `Twoja rezerwacja „${reservation.listing_title}” została zaakceptowana.`
        : `Twoja prośba dotycząca „${reservation.listing_title}” została odrzucona.`,
    href: "/profil#rezerwacje",
  }).run();

  revalidateReservationPages(reservation.listing_id);
  redirect("/profil#rezerwacje");
}

export async function cancelReservation(formData: FormData): Promise<void> {
  const reservationId = positiveInteger(formData.get("reservation_id"));
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/logowanie?redirect=/profil#rezerwacje");
  }

  if (!reservationId) {
    throw new Error("Nieprawidłowa rezerwacja.");
  }

  const { env } = await getCloudflareContext({ async: true });
  const reservation = await env.DB.prepare(
    `SELECT
       reservations.listing_id,
       reservations.owner_id,
       listings.title AS listing_title
     FROM reservations
     JOIN listings ON listings.id = reservations.listing_id
     WHERE reservations.id = ? AND reservations.requester_id = ?
       AND reservations.status IN ('pending', 'accepted')
       AND reservations.completed_at IS NULL
     LIMIT 1`,
  )
    .bind(reservationId, session.user.id)
    .first<{ listing_id: number; owner_id: string; listing_title: string }>();

  if (!reservation) {
    throw new Error("Nie można anulować tej rezerwacji.");
  }

  await env.DB.batch([
    env.DB.prepare(
      `UPDATE reservations
       SET status = 'cancelled', updated_at = datetime('now')
       WHERE id = ? AND requester_id = ?`,
    ).bind(reservationId, session.user.id),
    createNotificationStatement(env.DB, {
      userId: reservation.owner_id,
      type: "reservation_cancelled",
      title: "Rezerwacja anulowana",
      body: `${session.user.name} anulował(a) rezerwację „${reservation.listing_title}”.`,
      href: "/profil#rezerwacje",
    }),
  ]);

  revalidateReservationPages(reservation.listing_id);
  redirect("/profil#rezerwacje");
}

export async function completeReservation(formData: FormData): Promise<void> {
  const reservationId = positiveInteger(formData.get("reservation_id"));
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/logowanie?redirect=/profil#rezerwacje");
  }

  if (!reservationId) {
    throw new Error("Nieprawidłowa rezerwacja.");
  }

  const { env } = await getCloudflareContext({ async: true });
  const reservation = await env.DB.prepare(
    `SELECT
       reservations.listing_id,
       reservations.requester_id,
       reservations.owner_id,
       listings.title AS listing_title
     FROM reservations
     JOIN listings ON listings.id = reservations.listing_id
     WHERE reservations.id = ?
       AND reservations.status = 'accepted'
       AND reservations.completed_at IS NULL
       AND (reservations.requester_id = ? OR reservations.owner_id = ?)
     LIMIT 1`,
  )
    .bind(reservationId, session.user.id, session.user.id)
    .first<{
      listing_id: number;
      requester_id: string;
      owner_id: string;
      listing_title: string;
    }>();

  if (!reservation) {
    throw new Error("Nie można zakończyć tej rezerwacji.");
  }

  const recipientId =
    session.user.id === reservation.owner_id
      ? reservation.requester_id
      : reservation.owner_id;

  await env.DB.batch([
    env.DB.prepare(
      `UPDATE reservations
       SET completed_at = datetime('now'), updated_at = datetime('now')
       WHERE id = ? AND completed_at IS NULL`,
    ).bind(reservationId),
    createNotificationStatement(env.DB, {
      userId: recipientId,
      type: "reservation_completed",
      title: "Transakcja zakończona",
      body: `Rezerwacja „${reservation.listing_title}” została oznaczona jako zakończona.`,
      href: "/profil#rezerwacje",
    }),
  ]);

  revalidateReservationPages(reservation.listing_id);
  redirect("/profil#rezerwacje");
}
