"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { createNotificationStatement } from "@/lib/notifications";

const FILTERS = new Set(["pending", "reviewed", "dismissed", "all"]);
const ACTIONS = new Set(["review", "dismiss", "archive"]);

type ListingModerationAction = "review" | "dismiss" | "archive";
type ContentModerationAction = "review" | "dismiss";

type ListingReportRow = {
  listing_id: number;
  reporter_id: string;
  status: "pending" | "reviewed" | "dismissed";
  owner_id: string;
  listing_title: string;
};

type ContentReportRow = {
  reporter_id: string;
  reported_user_id: string;
  target_type: "profile" | "message" | "review";
  target_id: string;
  status: "pending" | "reviewed" | "dismissed";
};

function positiveInteger(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string") return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function moderationFilter(formData: FormData): string {
  const value = formData.get("filter");
  return typeof value === "string" && FILTERS.has(value) ? value : "pending";
}

function moderationJustification(formData: FormData): string {
  const value = formData.get("justification");
  const justification = typeof value === "string" ? value.trim() : "";

  if (justification.length < 10) {
    throw new Error("Uzasadnienie musi mieć co najmniej 10 znaków.");
  }

  if (justification.length > 1000) {
    throw new Error("Uzasadnienie może mieć maksymalnie 1000 znaków.");
  }

  return justification;
}

function listingReporterMessage(
  action: ListingModerationAction,
  title: string,
  justification: string,
): string {
  if (action === "archive") {
    return `Twoje zgłoszenie ogłoszenia „${title}” zostało rozpatrzone, a ogłoszenie zarchiwizowano. Uzasadnienie: ${justification}`;
  }

  if (action === "dismiss") {
    return `Twoje zgłoszenie ogłoszenia „${title}” zostało odrzucone. Uzasadnienie: ${justification}`;
  }

  return `Twoje zgłoszenie ogłoszenia „${title}” zostało sprawdzone. Uzasadnienie: ${justification}`;
}

function listingOwnerMessage(
  action: ListingModerationAction,
  title: string,
  justification: string,
): string {
  if (action === "archive") {
    return `Twoje ogłoszenie „${title}” zostało zarchiwizowane po moderacji. Uzasadnienie: ${justification}`;
  }

  if (action === "dismiss") {
    return `Zgłoszenie dotyczące Twojego ogłoszenia „${title}” zostało odrzucone. Nie podjęto działania wobec ogłoszenia. Uzasadnienie: ${justification}`;
  }

  return `Moderator sprawdził zgłoszenie dotyczące Twojego ogłoszenia „${title}”. Uzasadnienie: ${justification}`;
}

function contentTargetLabel(
  targetType: ContentReportRow["target_type"],
): string {
  if (targetType === "message") return "wiadomości";
  if (targetType === "review") return "opinii";
  return "profilu";
}

export async function moderateReport(formData: FormData): Promise<void> {
  const session = await requireAdmin();
  const reportId = positiveInteger(formData.get("report_id"));
  const actionValue = formData.get("moderation_action");
  const action =
    typeof actionValue === "string" && ACTIONS.has(actionValue)
      ? (actionValue as ListingModerationAction)
      : null;
  const filter = moderationFilter(formData);
  const justification = moderationJustification(formData);

  if (!reportId || !action) {
    throw new Error("Nieprawidłowe działanie moderacyjne.");
  }

  const { env } = await getCloudflareContext({ async: true });
  const report = await env.DB.prepare(
    `SELECT
       listing_reports.listing_id,
       listing_reports.reporter_id,
       listing_reports.status,
       listings.owner_id,
       listings.title AS listing_title
     FROM listing_reports
     JOIN listings ON listings.id = listing_reports.listing_id
     WHERE listing_reports.id = ?
     LIMIT 1`,
  )
    .bind(reportId)
    .first<ListingReportRow>();

  if (!report) {
    throw new Error("Zgłoszenie już nie istnieje.");
  }

  if (report.status !== "pending") {
    throw new Error("To zgłoszenie zostało już rozpatrzone.");
  }

  const decision =
    action === "archive"
      ? "archived"
      : action === "dismiss"
        ? "dismissed"
        : "reviewed";
  const nextStatus = action === "dismiss" ? "dismissed" : "reviewed";
  const listingHref = `/ogloszenie/${report.listing_id}`;
  const statements: D1PreparedStatement[] = [
    env.DB.prepare(
      `INSERT INTO moderation_decisions (
         report_kind,
         report_id,
         moderator_id,
         reporter_id,
         reported_user_id,
         target_type,
         target_id,
         decision,
         justification
       ) VALUES ('listing', ?, ?, ?, ?, 'listing', ?, ?, ?)`,
    ).bind(
      reportId,
      session.user.id,
      report.reporter_id,
      report.owner_id,
      String(report.listing_id),
      decision,
      justification,
    ),
    createNotificationStatement(env.DB, {
      userId: report.reporter_id,
      type: "moderation_update",
      title: "Decyzja w sprawie Twojego zgłoszenia",
      body: listingReporterMessage(
        action,
        report.listing_title,
        justification,
      ),
      href: listingHref,
    }),
  ];

  if (report.owner_id !== report.reporter_id) {
    statements.push(
      createNotificationStatement(env.DB, {
        userId: report.owner_id,
        type: "moderation_update",
        title: "Aktualizacja moderacji Twojego ogłoszenia",
        body: listingOwnerMessage(action, report.listing_title, justification),
        href: listingHref,
      }),
    );
  }

  if (action === "archive") {
    statements.push(
      env.DB.prepare(
        `UPDATE listings
         SET archived_at = COALESCE(archived_at, datetime('now'))
         WHERE id = ?`,
      ).bind(report.listing_id),
    );
  }

  statements.push(
    env.DB.prepare(
      `UPDATE listing_reports
       SET status = ?, updated_at = datetime('now')
       WHERE id = ? AND status = 'pending'`,
    ).bind(nextStatus, reportId),
  );

  await env.DB.batch(statements);

  revalidatePath("/admin");
  revalidatePath("/powiadomienia");
  revalidatePath("/");
  revalidatePath("/sprzet");
  revalidatePath("/uslugi");
  revalidatePath("/rozwoj-osobisty");
  revalidatePath(`/ogloszenie/${report.listing_id}`);
  redirect(`/admin?status=${filter}&zapisano=1`);
}

export async function moderateContentReport(
  formData: FormData,
): Promise<void> {
  const session = await requireAdmin();
  const reportId = positiveInteger(formData.get("report_id"));
  const actionValue = formData.get("moderation_action");
  const action =
    actionValue === "review" || actionValue === "dismiss"
      ? (actionValue as ContentModerationAction)
      : null;
  const filter = moderationFilter(formData);
  const justification = moderationJustification(formData);

  if (!reportId || !action) {
    throw new Error("Nieprawidłowe działanie moderacyjne.");
  }

  const { env } = await getCloudflareContext({ async: true });
  const report = await env.DB.prepare(
    `SELECT reporter_id, reported_user_id, target_type, target_id, status
     FROM content_reports
     WHERE id = ?
     LIMIT 1`,
  )
    .bind(reportId)
    .first<ContentReportRow>();

  if (!report) {
    throw new Error("Zgłoszenie już nie istnieje.");
  }

  if (report.status !== "pending") {
    throw new Error("To zgłoszenie zostało już rozpatrzone.");
  }

  const decision = action === "review" ? "reviewed" : "dismissed";
  const targetLabel = contentTargetLabel(report.target_type);
  const reporterBody =
    action === "review"
      ? `Twoje zgłoszenie dotyczące ${targetLabel} zostało sprawdzone. Uzasadnienie: ${justification}`
      : `Twoje zgłoszenie dotyczące ${targetLabel} zostało odrzucone. Uzasadnienie: ${justification}`;
  const reportedUserBody =
    action === "review"
      ? `Moderator sprawdził zgłoszenie dotyczące Twojej treści (${targetLabel}). Uzasadnienie: ${justification}`
      : `Zgłoszenie dotyczące Twojej treści (${targetLabel}) zostało odrzucone. Uzasadnienie: ${justification}`;
  const statements: D1PreparedStatement[] = [
    env.DB.prepare(
      `INSERT INTO moderation_decisions (
         report_kind,
         report_id,
         moderator_id,
         reporter_id,
         reported_user_id,
         target_type,
         target_id,
         decision,
         justification
       ) VALUES ('content', ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(
      reportId,
      session.user.id,
      report.reporter_id,
      report.reported_user_id,
      report.target_type,
      report.target_id,
      decision,
      justification,
    ),
    createNotificationStatement(env.DB, {
      userId: report.reporter_id,
      type: "moderation_update",
      title: "Decyzja w sprawie Twojego zgłoszenia",
      body: reporterBody,
      href: "/powiadomienia",
    }),
  ];

  if (report.reported_user_id !== report.reporter_id) {
    statements.push(
      createNotificationStatement(env.DB, {
        userId: report.reported_user_id,
        type: "moderation_update",
        title: "Aktualizacja moderacji Twojej treści",
        body: reportedUserBody,
        href: "/powiadomienia",
      }),
    );
  }

  statements.push(
    env.DB.prepare(
      `UPDATE content_reports
       SET status = ?, updated_at = datetime('now')
       WHERE id = ? AND status = 'pending'`,
    ).bind(decision, reportId),
  );

  await env.DB.batch(statements);

  revalidatePath("/admin");
  revalidatePath("/powiadomienia");
  redirect(`/admin?status=${filter}&zapisano=1`);
}
