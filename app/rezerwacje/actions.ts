"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { sendReservationUpdateEmail } from "@/lib/email";
import { createNotificationStatement } from "@/lib/notifications";
import { sendPushNotification, type PushEnv } from "@/lib/push";

type ReservationNotificationEnv = PushEnv & {
  BETTER_AUTH_URL: string;
  RESEND_API_KEY: string;
};

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
  revalidatePath("/rozwoj-osobisty");
  revalidatePath("/profil");
  revalidatePath(`/ogloszenie/${listingId}`);
}

function queueReservationUpdates({
  ctx,
  env,
  recipientId,
  recipient,
  subject,
  heading,
  body,
}: {
  ctx: ExecutionContext;
  env: ReservationNotificationEnv;
  recipientId: string;
  recipient: string;
  subject: string;
  heading: string;
  body: string;
}) {
  const actionUrl = `${env.BETTER_AUTH_URL.replace(/\/$/, "")}/profil#rezerwacje`;

  ctx.waitUntil(
    sendReservationUpdateEmail({
      apiKey: env.RESEND_API_KEY,
      recipient,
      subject,
      heading,
      body,
      actionUrl,
    }).catch((error: unknown) => {
      console.error(
        JSON.stringify({
          event: "reservation_email_background_failed",
          message: error instanceof Error ? error.message : "unknown_error",
        }),
      );
    }),
  );

  ctx.waitUntil(
    sendPushNotification(env, {
      userId: recipientId,
      title: heading,
      body,
      url: "/profil#rezerwacje",
      tag: `reservation-${heading.toLowerCase().replaceAll(" ", "-")}`,
    }).catch((error: unknown) => {
      console.error(
        JSON.stringify({
          event: "reservation_push_background_failed",
          message: error instanceof Error ? error.message : "unknown_error",
        }),
      );
    }),
  );
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

  const { env: cloudflareEnv, ctx } = await getCloudflareContext({ async: true });
  const env = cloudflareEnv as ReservationNotificationEnv;
  const listing = await env.DB.prepare(
    `SELECT
       listings.owner_id,
       listings.title,
       owner.email AS owner_email
     FROM listings
     JOIN "user" AS owner ON owner.id = listings.owner_id
     WHERE listings.id = ? AND listings.archived_at IS NULL
     LIMIT 1`,
  )
    .bind(listingId)
    .first<{ owner_id: string | null; title: string; owner_email: string }>();

  if (!listing?.owner_id) {
    throw new Error("To ogłoszenie nie przyjmuje jeszcze rezerwacji.");
  }

  if (listing.owner_id === session.user.id) {
    throw new Error("Nie można rezerwować własnego ogłoszenia.");
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
     )
     AND NOT EXISTS (
       SELECT 1
       FROM reservations AS requester_conflict
       WHERE requester_conflict.listing_id = ?
         AND requester_conflict.requester_id = ?
         AND requester_conflict.status IN ('pending', 'accepted')
         AND requester_conflict.completed_at IS NULL
         AND datetime(requester_conflict.start_date || ' ' || requester_conflict.start_time) < datetime(?)
         AND datetime(requester_conflict.end_date || ' ' || requester_conflict.end_time) > datetime(?)
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
      listingId,
      session.user.id,
      endDateTime,
      startDateTime,
    )
    .run();

  if (insertResult.meta.changes !== 1) {
    throw new Error(
      "Wybrany termin jest już zajęty albo pokrywa się z Twoją inną rezerwacją.",
    );
  }

  const reservationPeriod = formatReservationPeriod(
    startDate,
    startTime,
    endDate,
    endTime,
  );

  await createNotificationStatement(env.DB, {
    userId: listing.owner_id,
    type: "reservation_created",
    title: "Nowa prośba o rezerwację",
    body: `${session.user.name} chce zarezerwować „${listing.title}” w terminie ${reservationPeriod}.`,
    href: "/profil#rezerwacje",
  }).run();

  queueReservationUpdates({
    ctx,
    env,
    recipientId: listing.owner_id,
    recipient: listing.owner_email,
    subject: `Nowa prośba o rezerwację: ${listing.title}`,
    heading: "Nowa prośba o rezerwację",
    body: `${session.user.name} chce zarezerwować „${listing.title}” w terminie ${reservationPeriod}.`,
  });

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

  const { env: cloudflareEnv, ctx } = await getCloudflareContext({ async: true });
  const env = cloudflareEnv as ReservationNotificationEnv;
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
       listings.title AS listing_title,
       requester.email AS requester_email
     FROM reservations
     JOIN listings ON listings.id = reservations.listing_id
     JOIN "user" AS requester ON requester.id = reservations.requester_id
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
      requester_email: string;
    }>();

  if (!reservation || reservation.owner_id !== session.user.id) {
    throw new Error("Nie masz dostępu do tej rezerwacji.");
  }

  if (reservation.status !== "pending") {
    throw new Error("Ta prośba została już rozpatrzona.");
  }

  let automaticallyRejected: Array<{
    requester_id: string;
    requester_email: string;
    start_date: string;
    end_date: string;
    start_time: string;
    end_time: string;
  }> = [];

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

    const conflictingResult = await env.DB.prepare(
      `SELECT
         conflicting.requester_id,
         requester.email AS requester_email,
         conflicting.start_date,
         conflicting.end_date,
         conflicting.start_time,
         conflicting.end_time
       FROM reservations AS conflicting
       JOIN "user" AS requester ON requester.id = conflicting.requester_id
       WHERE conflicting.listing_id = ?
         AND conflicting.id != ?
         AND conflicting.status = 'pending'
         AND datetime(conflicting.start_date || ' ' || conflicting.start_time) < datetime(?)
         AND datetime(conflicting.end_date || ' ' || conflicting.end_time) > datetime(?)`,
    )
      .bind(
        reservation.listing_id,
        reservation.id,
        endDateTime,
        startDateTime,
      )
      .all<(typeof automaticallyRejected)[number]>();

    automaticallyRejected = conflictingResult.results;

    if (automaticallyRejected.length > 0) {
      await env.DB.batch([
        env.DB.prepare(
          `UPDATE reservations
           SET status = 'rejected', updated_at = datetime('now')
           WHERE listing_id = ?
             AND id != ?
             AND status = 'pending'
             AND datetime(start_date || ' ' || start_time) < datetime(?)
             AND datetime(end_date || ' ' || end_time) > datetime(?)`,
        ).bind(
          reservation.listing_id,
          reservation.id,
          endDateTime,
          startDateTime,
        ),
        ...automaticallyRejected.map((conflicting) =>
          createNotificationStatement(env.DB, {
            userId: conflicting.requester_id,
            type: "reservation_rejected",
            title: "Termin rezerwacji jest już zajęty",
            body: `Termin Twojej prośby dotyczącej „${reservation.listing_title}” został zajęty przez inną zaakceptowaną rezerwację. Wybierz inny termin.`,
            href: `/ogloszenie/${reservation.listing_id}`,
          }),
        ),
      ]);
    }
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

  const responseAccepted = response === "accepted";
  queueReservationUpdates({
    ctx,
    env,
    recipientId: reservation.requester_id,
    recipient: reservation.requester_email,
    subject: responseAccepted
      ? `Rezerwacja zaakceptowana: ${reservation.listing_title}`
      : `Rezerwacja odrzucona: ${reservation.listing_title}`,
    heading: responseAccepted
      ? "Rezerwacja zaakceptowana"
      : "Rezerwacja odrzucona",
    body: responseAccepted
      ? `Twoja rezerwacja „${reservation.listing_title}” została zaakceptowana.`
      : `Twoja prośba dotycząca „${reservation.listing_title}” została odrzucona.`,
  });

  for (const conflicting of automaticallyRejected) {
    const conflictingPeriod = formatReservationPeriod(
      conflicting.start_date,
      conflicting.start_time,
      conflicting.end_date,
      conflicting.end_time,
    );

    queueReservationUpdates({
      ctx,
      env,
      recipientId: conflicting.requester_id,
      recipient: conflicting.requester_email,
      subject: `Termin jest już zajęty: ${reservation.listing_title}`,
      heading: "Termin rezerwacji jest już zajęty",
      body: `Termin ${conflictingPeriod} w rezerwacji „${reservation.listing_title}” został zajęty przez inną zaakceptowaną rezerwację. Wybierz inny termin.`,
    });
  }

  revalidateReservationPages(reservation.listing_id);
  redirect(
    `/profil?rezerwacja=${
      response === "accepted" ? "zaakceptowana" : "odrzucona"
    }#rezerwacje`,
  );
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

  const { env: cloudflareEnv, ctx } = await getCloudflareContext({ async: true });
  const env = cloudflareEnv as ReservationNotificationEnv;
  const reservation = await env.DB.prepare(
    `SELECT
       reservations.listing_id,
       reservations.owner_id,
       reservations.requester_id,
       listings.title AS listing_title,
       owner.email AS owner_email,
       requester.email AS requester_email
     FROM reservations
     JOIN listings ON listings.id = reservations.listing_id
     JOIN "user" AS owner ON owner.id = reservations.owner_id
     JOIN "user" AS requester ON requester.id = reservations.requester_id
     WHERE reservations.id = ?
       AND (reservations.requester_id = ? OR reservations.owner_id = ?)
       AND reservations.status IN ('pending', 'accepted')
       AND reservations.completed_at IS NULL
     LIMIT 1`,
  )
    .bind(reservationId, session.user.id, session.user.id)
    .first<{
      listing_id: number;
      owner_id: string;
      requester_id: string;
      listing_title: string;
      owner_email: string;
      requester_email: string;
    }>();

  if (!reservation) {
    throw new Error("Nie można anulować tej rezerwacji.");
  }

  const recipientId =
    session.user.id === reservation.owner_id
      ? reservation.requester_id
      : reservation.owner_id;
  const recipientEmail =
    session.user.id === reservation.owner_id
      ? reservation.requester_email
      : reservation.owner_email;

  await env.DB.batch([
    env.DB.prepare(
      `UPDATE reservations
       SET status = 'cancelled', updated_at = datetime('now')
       WHERE id = ?
         AND (requester_id = ? OR owner_id = ?)
         AND status IN ('pending', 'accepted')
         AND completed_at IS NULL`,
    ).bind(reservationId, session.user.id, session.user.id),
    createNotificationStatement(env.DB, {
      userId: recipientId,
      type: "reservation_cancelled",
      title: "Rezerwacja anulowana",
      body: `${session.user.name} anulował(a) rezerwację „${reservation.listing_title}”.`,
      href: "/profil#rezerwacje",
    }),
  ]);

  queueReservationUpdates({
    ctx,
    env,
    recipientId,
    recipient: recipientEmail,
    subject: `Rezerwacja anulowana: ${reservation.listing_title}`,
    heading: "Rezerwacja anulowana",
    body: `${session.user.name} anulował(a) rezerwację „${reservation.listing_title}”.`,
  });

  revalidateReservationPages(reservation.listing_id);
  redirect("/profil?rezerwacja=anulowana#rezerwacje");
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

  const { env: cloudflareEnv, ctx } = await getCloudflareContext({ async: true });
  const env = cloudflareEnv as ReservationNotificationEnv;
  const reservation = await env.DB.prepare(
    `SELECT
       reservations.listing_id,
       reservations.requester_id,
       reservations.owner_id,
       listings.title AS listing_title,
       requester.email AS requester_email,
       owner.email AS owner_email,
       reservations.owner_completed_at,
       reservations.requester_completed_at
     FROM reservations
     JOIN listings ON listings.id = reservations.listing_id
     JOIN "user" AS requester ON requester.id = reservations.requester_id
     JOIN "user" AS owner ON owner.id = reservations.owner_id
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
      requester_email: string;
      owner_email: string;
      owner_completed_at: string | null;
      requester_completed_at: string | null;
    }>();

  if (!reservation) {
    throw new Error("Nie można zakończyć tej rezerwacji.");
  }

  const recipientId =
    session.user.id === reservation.owner_id
      ? reservation.requester_id
      : reservation.owner_id;
  const recipientEmail =
    session.user.id === reservation.owner_id
      ? reservation.requester_email
      : reservation.owner_email;
  const isOwner = session.user.id === reservation.owner_id;
  const confirmationColumn = isOwner
    ? "owner_completed_at"
    : "requester_completed_at";
  const alreadyConfirmed = isOwner
    ? reservation.owner_completed_at
    : reservation.requester_completed_at;

  if (alreadyConfirmed) {
    throw new Error("Zakończenie tej rezerwacji zostało już przez Ciebie potwierdzone.");
  }

  const confirmationResult = await env.DB.prepare(
    `UPDATE reservations
     SET ${confirmationColumn} = datetime('now'), updated_at = datetime('now')
     WHERE id = ?
       AND status = 'accepted'
       AND completed_at IS NULL
       AND ${confirmationColumn} IS NULL`,
  )
    .bind(reservationId)
    .run();

  if (confirmationResult.meta.changes !== 1) {
    throw new Error("Nie można potwierdzić zakończenia tej rezerwacji.");
  }

  const completionResult = await env.DB.prepare(
    `UPDATE reservations
     SET completed_at = datetime('now'), updated_at = datetime('now')
     WHERE id = ?
       AND status = 'accepted'
       AND completed_at IS NULL
       AND owner_completed_at IS NOT NULL
       AND requester_completed_at IS NOT NULL`,
  )
    .bind(reservationId)
    .run();

  const completionState = await env.DB.prepare(
    `SELECT completed_at
     FROM reservations
     WHERE id = ?
     LIMIT 1`,
  )
    .bind(reservationId)
    .first<{ completed_at: string | null }>();
  const isCompleted = Boolean(completionState?.completed_at);

  if (completionResult.meta.changes === 1) {
    await createNotificationStatement(env.DB, {
      userId: recipientId,
      type: "reservation_completed",
      title: "Transakcja zakończona",
      body: `Obie strony potwierdziły zakończenie rezerwacji „${reservation.listing_title}”.`,
      href: "/profil#rezerwacje",
    }).run();

    queueReservationUpdates({
      ctx,
      env,
      recipientId,
      recipient: recipientEmail,
      subject: `Rezerwacja zakończona: ${reservation.listing_title}`,
      heading: "Rezerwacja zakończona",
      body: `Obie strony potwierdziły zakończenie rezerwacji „${reservation.listing_title}”.`,
    });
  } else if (!isCompleted) {
    await createNotificationStatement(env.DB, {
      userId: recipientId,
      type: "reservation_completed",
      title: "Potwierdź zakończenie rezerwacji",
      body: `${session.user.name} potwierdził(a) zakończenie rezerwacji „${reservation.listing_title}”. Potwierdź ją również w swoim profilu.`,
      href: "/profil#rezerwacje",
    }).run();

    queueReservationUpdates({
      ctx,
      env,
      recipientId,
      recipient: recipientEmail,
      subject: `Potwierdź zakończenie: ${reservation.listing_title}`,
      heading: "Potwierdź zakończenie rezerwacji",
      body: `${session.user.name} potwierdził(a) zakończenie rezerwacji „${reservation.listing_title}”. Potwierdź ją również w swoim profilu.`,
    });
  }

  revalidateReservationPages(reservation.listing_id);
  redirect(
    `/profil?rezerwacja=${
      isCompleted ? "zakonczona" : "potwierdzona"
    }#rezerwacje`,
  );
}
