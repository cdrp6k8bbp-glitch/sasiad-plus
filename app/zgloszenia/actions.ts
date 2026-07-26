"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { enforceRateLimits, RATE_LIMITS } from "@/lib/anti-spam";
import { auth } from "@/lib/auth";

const REPORT_REASONS = new Set([
  "spam",
  "fraud",
  "prohibited",
  "misleading",
  "other",
]);

const CONTENT_REPORT_REASONS = new Set([
  "spam",
  "harassment",
  "fraud",
  "prohibited",
  "misleading",
  "hate",
  "privacy",
  "other",
]);

const CONTENT_TARGET_TYPES = new Set(["profile", "message", "review"]);

function positiveInteger(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string") return null;

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function contentTargetId(value: FormDataEntryValue | null): string {
  if (typeof value !== "string") return "";
  const targetId = value.trim();
  return targetId.length <= 128 ? targetId : "";
}

function validateReportInput(
  formData: FormData,
  reasons: ReadonlySet<string>,
): { reason: string; details: string } {
  const reasonValue = formData.get("reason");
  const reason = typeof reasonValue === "string" ? reasonValue : "";
  const detailsValue = formData.get("details");
  const details =
    typeof detailsValue === "string" ? detailsValue.trim() : "";

  if (!reasons.has(reason)) {
    throw new Error("Wybierz prawidłowy powód zgłoszenia.");
  }

  if (details.length > 1000) {
    throw new Error("Opis zgłoszenia może mieć maksymalnie 1000 znaków.");
  }

  if (reason === "other" && details.length < 10) {
    throw new Error("Opisz problem w co najmniej 10 znakach.");
  }

  return { reason, details };
}

export async function reportListing(formData: FormData): Promise<void> {
  const listingId = positiveInteger(formData.get("listing_id"));
  const session = await auth.api.getSession({ headers: await headers() });

  if (!listingId) {
    throw new Error("Nieprawidłowe ogłoszenie.");
  }

  if (!session) {
    redirect(`/logowanie?redirect=/ogloszenie/${listingId}`);
  }

  const { reason, details } = validateReportInput(formData, REPORT_REASONS);

  const { env } = await getCloudflareContext({ async: true });
  const listing = await env.DB.prepare(
    `SELECT owner_id, archived_at
     FROM listings
     WHERE id = ?
     LIMIT 1`,
  )
    .bind(listingId)
    .first<{ owner_id: string | null; archived_at: string | null }>();

  if (!listing || listing.archived_at) {
    throw new Error("Tego ogłoszenia nie można już zgłosić.");
  }

  if (listing.owner_id === session.user.id) {
    throw new Error("Nie można zgłosić własnego ogłoszenia.");
  }

  await enforceRateLimits(env.DB, session.user.id, RATE_LIMITS.report);

  const result = await env.DB.prepare(
    `INSERT OR IGNORE INTO listing_reports (
       listing_id, reporter_id, reason, details
     ) VALUES (?, ?, ?, ?)`,
  )
    .bind(listingId, session.user.id, reason, details || null)
    .run();

  redirect(
    `/ogloszenie/${listingId}?zgloszono=${result.meta.changes ? "1" : "istnieje"}`,
  );
}

export async function reportContent(formData: FormData): Promise<void> {
  const targetTypeValue = formData.get("target_type");
  const targetType =
    typeof targetTypeValue === "string" ? targetTypeValue : "";
  const targetId = contentTargetId(formData.get("target_id"));
  const session = await auth.api.getSession({ headers: await headers() });

  if (!CONTENT_TARGET_TYPES.has(targetType) || !targetId) {
    throw new Error("Nieprawidłowy cel zgłoszenia.");
  }

  if (!session) {
    redirect("/logowanie");
  }

  const { reason, details } = validateReportInput(
    formData,
    CONTENT_REPORT_REASONS,
  );
  const { env } = await getCloudflareContext({ async: true });

  let reportedUserId = "";
  let contentSnapshot: string | null = null;
  let redirectPath = "/";

  if (targetType === "profile") {
    const profile = await env.DB.prepare(
      `SELECT
         "user".id,
         "user".name,
         user_profiles.city,
         user_profiles.bio
       FROM "user"
       LEFT JOIN user_profiles ON user_profiles.user_id = "user".id
       WHERE "user".id = ?
       LIMIT 1`,
    )
      .bind(targetId)
      .first<{
        id: string;
        name: string;
        city: string | null;
        bio: string | null;
      }>();

    if (!profile) {
      throw new Error("Ten profil już nie istnieje.");
    }

    reportedUserId = profile.id;
    contentSnapshot = [
      `Profil: ${profile.name}`,
      profile.city ? `Miejscowość: ${profile.city}` : null,
      profile.bio ? `Opis: ${profile.bio}` : null,
    ]
      .filter(Boolean)
      .join("\n");
    redirectPath = `/u/${profile.id}`;
  } else if (targetType === "message") {
    const messageId = Number(targetId);

    if (!Number.isInteger(messageId) || messageId < 1) {
      throw new Error("Nieprawidłowa wiadomość.");
    }

    const message = await env.DB.prepare(
      `SELECT
         messages.sender_id,
         messages.body,
         messages.conversation_id
       FROM messages
       JOIN conversations ON conversations.id = messages.conversation_id
       WHERE messages.id = ?
         AND (conversations.buyer_id = ? OR conversations.seller_id = ?)
       LIMIT 1`,
    )
      .bind(messageId, session.user.id, session.user.id)
      .first<{
        sender_id: string;
        body: string;
        conversation_id: number;
      }>();

    if (!message) {
      throw new Error("Ta wiadomość już nie istnieje lub nie masz do niej dostępu.");
    }

    reportedUserId = message.sender_id;
    contentSnapshot = message.body;
    redirectPath = `/wiadomosci/${message.conversation_id}`;
  } else {
    const reviewId = Number(targetId);

    if (!Number.isInteger(reviewId) || reviewId < 1) {
      throw new Error("Nieprawidłowa opinia.");
    }

    const review = await env.DB.prepare(
      `SELECT reviewer_id, reviewed_id, rating, body
       FROM reviews
       WHERE id = ?
       LIMIT 1`,
    )
      .bind(reviewId)
      .first<{
        reviewer_id: string;
        reviewed_id: string;
        rating: number;
        body: string;
      }>();

    if (!review) {
      throw new Error("Ta opinia już nie istnieje.");
    }

    reportedUserId = review.reviewer_id;
    contentSnapshot = `Ocena: ${review.rating}/5\n${review.body}`;
    redirectPath = `/u/${review.reviewed_id}`;
  }

  if (reportedUserId === session.user.id) {
    throw new Error("Nie można zgłosić własnej treści.");
  }

  await enforceRateLimits(env.DB, session.user.id, RATE_LIMITS.report);

  const result = await env.DB.prepare(
    `INSERT OR IGNORE INTO content_reports (
       reporter_id,
       reported_user_id,
       target_type,
       target_id,
       reason,
       details,
       content_snapshot
     ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      session.user.id,
      reportedUserId,
      targetType,
      targetId,
      reason,
      details || null,
      contentSnapshot,
    )
    .run();

  const separator = redirectPath.includes("?") ? "&" : "?";
  redirect(
    `${redirectPath}${separator}zgloszono=${
      result.meta.changes ? "1" : "istnieje"
    }`,
  );
}
