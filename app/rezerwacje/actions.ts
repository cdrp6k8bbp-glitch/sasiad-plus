"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

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
  const today = new Date().toISOString().slice(0, 10);
  const noteValue = formData.get("note");
  const note = typeof noteValue === "string" ? noteValue.trim() : "";

  if (startDate < today || endDate < startDate) {
    throw new Error("Termin rezerwacji jest nieprawidłowy.");
  }

  if (note.length > 500) {
    throw new Error("Wiadomość może mieć maksymalnie 500 znaków.");
  }

  const { env } = await getCloudflareContext({ async: true });
  const listing = await env.DB.prepare(
    `SELECT owner_id FROM listings WHERE id = ? LIMIT 1`,
  )
    .bind(listingId)
    .first<{ owner_id: string | null }>();

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

  const conflictingReservation = await env.DB.prepare(
    `SELECT id
     FROM reservations
     WHERE listing_id = ?
       AND status = 'accepted'
       AND completed_at IS NULL
       AND start_date <= ?
       AND end_date >= ?
     LIMIT 1`,
  )
    .bind(listingId, endDate, startDate)
    .first<{ id: number }>();

  if (conflictingReservation) {
    throw new Error("Wybrany termin jest już zarezerwowany.");
  }

  await env.DB.prepare(
    `INSERT INTO reservations (
       listing_id, requester_id, owner_id, start_date, end_date, note
     ) VALUES (?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      listingId,
      session.user.id,
      listing.owner_id,
      startDate,
      endDate,
      note || null,
    )
    .run();

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
    `SELECT id, listing_id, owner_id, start_date, end_date, status
     FROM reservations
     WHERE id = ?
     LIMIT 1`,
  )
    .bind(reservationId)
    .first<{
      id: number;
      listing_id: number;
      owner_id: string;
      start_date: string;
      end_date: string;
      status: string;
    }>();

  if (!reservation || reservation.owner_id !== session.user.id) {
    throw new Error("Nie masz dostępu do tej rezerwacji.");
  }

  if (reservation.status !== "pending") {
    throw new Error("Ta prośba została już rozpatrzona.");
  }

  if (response === "accepted") {
    await env.DB.batch([
      env.DB.prepare(
        `UPDATE reservations
         SET status = 'accepted', updated_at = datetime('now')
         WHERE id = ? AND owner_id = ? AND status = 'pending'`,
      ).bind(reservation.id, session.user.id),
      env.DB.prepare(
        `UPDATE reservations
         SET status = 'rejected', updated_at = datetime('now')
         WHERE listing_id = ?
           AND id != ?
           AND status = 'pending'
           AND start_date <= ?
           AND end_date >= ?`,
      ).bind(
        reservation.listing_id,
        reservation.id,
        reservation.end_date,
        reservation.start_date,
      ),
    ]);
  } else {
    await env.DB.prepare(
      `UPDATE reservations
       SET status = 'rejected', updated_at = datetime('now')
       WHERE id = ? AND owner_id = ? AND status = 'pending'`,
    )
      .bind(reservation.id, session.user.id)
      .run();
  }

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
    `SELECT listing_id
     FROM reservations
     WHERE id = ? AND requester_id = ?
       AND status IN ('pending', 'accepted')
       AND completed_at IS NULL
     LIMIT 1`,
  )
    .bind(reservationId, session.user.id)
    .first<{ listing_id: number }>();

  if (!reservation) {
    throw new Error("Nie można anulować tej rezerwacji.");
  }

  await env.DB.prepare(
    `UPDATE reservations
     SET status = 'cancelled', updated_at = datetime('now')
     WHERE id = ? AND requester_id = ?`,
  )
    .bind(reservationId, session.user.id)
    .run();

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
    `SELECT listing_id
     FROM reservations
     WHERE id = ?
       AND status = 'accepted'
       AND completed_at IS NULL
       AND (requester_id = ? OR owner_id = ?)
     LIMIT 1`,
  )
    .bind(reservationId, session.user.id, session.user.id)
    .first<{ listing_id: number }>();

  if (!reservation) {
    throw new Error("Nie można zakończyć tej rezerwacji.");
  }

  await env.DB.prepare(
    `UPDATE reservations
     SET completed_at = datetime('now'), updated_at = datetime('now')
     WHERE id = ? AND completed_at IS NULL`,
  )
    .bind(reservationId)
    .run();

  revalidateReservationPages(reservation.listing_id);
  redirect("/profil#rezerwacje");
}
