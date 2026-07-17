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

export async function createReview(formData: FormData): Promise<void> {
  const reservationId = positiveInteger(formData.get("reservation_id"));
  const rating = positiveInteger(formData.get("rating"));
  const bodyValue = formData.get("body");
  const body = typeof bodyValue === "string" ? bodyValue.trim() : "";
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/logowanie?redirect=/profil#rezerwacje");
  }

  if (!reservationId || !rating || rating > 5) {
    throw new Error("Wybierz ocenę od 1 do 5.");
  }

  if (body.length < 3 || body.length > 500) {
    throw new Error("Opinia musi mieć od 3 do 500 znaków.");
  }

  const { env } = await getCloudflareContext({ async: true });
  const reservation = await env.DB.prepare(
    `SELECT listing_id, requester_id, owner_id, status, completed_at
     FROM reservations
     WHERE id = ?
     LIMIT 1`,
  )
    .bind(reservationId)
    .first<{
      listing_id: number;
      requester_id: string;
      owner_id: string;
      status: string;
      completed_at: string | null;
    }>();

  if (
    !reservation ||
    reservation.requester_id !== session.user.id ||
    reservation.status !== "accepted" ||
    !reservation.completed_at
  ) {
    throw new Error("Nie możesz ocenić tej rezerwacji.");
  }

  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO reviews (
         reservation_id, listing_id, reviewer_id, reviewed_id, rating, body
       ) VALUES (?, ?, ?, ?, ?, ?)`,
    ).bind(
      reservationId,
      reservation.listing_id,
      session.user.id,
      reservation.owner_id,
      rating,
      body,
    ),
    createNotificationStatement(env.DB, {
      userId: reservation.owner_id,
      type: "review_received",
      title: "Nowa opinia",
      body: `${session.user.name} wystawił(a) Ci ocenę ${rating}/5.`,
      href: `/u/${reservation.owner_id}`,
    }),
  ]);

  revalidatePath("/profil");
  revalidatePath(`/u/${reservation.owner_id}`);
  revalidatePath(`/ogloszenie/${reservation.listing_id}`);
  redirect("/profil?oceniono=1#rezerwacje");
}
