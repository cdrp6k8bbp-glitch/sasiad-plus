"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

const REPORT_REASONS = new Set([
  "spam",
  "fraud",
  "prohibited",
  "misleading",
  "other",
]);

function positiveInteger(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string") return null;

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
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

  const reasonValue = formData.get("reason");
  const reason = typeof reasonValue === "string" ? reasonValue : "";
  const detailsValue = formData.get("details");
  const details =
    typeof detailsValue === "string" ? detailsValue.trim() : "";

  if (!REPORT_REASONS.has(reason)) {
    throw new Error("Wybierz prawidłowy powód zgłoszenia.");
  }

  if (details.length > 1000) {
    throw new Error("Opis zgłoszenia może mieć maksymalnie 1000 znaków.");
  }

  if (reason === "other" && details.length < 10) {
    throw new Error("Opisz problem w co najmniej 10 znakach.");
  }

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
