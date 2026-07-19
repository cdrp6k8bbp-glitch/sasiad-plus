"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";

const FILTERS = new Set(["pending", "reviewed", "dismissed", "all"]);
const ACTIONS = new Set(["review", "dismiss", "archive"]);

function positiveInteger(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string") return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function moderateReport(formData: FormData): Promise<void> {
  await requireAdmin();

  const reportId = positiveInteger(formData.get("report_id"));
  const actionValue = formData.get("moderation_action");
  const action = typeof actionValue === "string" ? actionValue : "";
  const filterValue = formData.get("filter");
  const filter =
    typeof filterValue === "string" && FILTERS.has(filterValue)
      ? filterValue
      : "pending";

  if (!reportId || !ACTIONS.has(action)) {
    throw new Error("Nieprawidłowe działanie moderacyjne.");
  }

  const { env } = await getCloudflareContext({ async: true });
  const report = await env.DB.prepare(
    `SELECT listing_id
     FROM listing_reports
     WHERE id = ?
     LIMIT 1`,
  )
    .bind(reportId)
    .first<{ listing_id: number }>();

  if (!report) {
    throw new Error("Zgłoszenie już nie istnieje.");
  }

  if (action === "archive") {
    await env.DB.batch([
      env.DB.prepare(
        `UPDATE listings
         SET archived_at = COALESCE(archived_at, datetime('now'))
         WHERE id = ?`,
      ).bind(report.listing_id),
      env.DB.prepare(
        `UPDATE listing_reports
         SET status = 'reviewed', updated_at = datetime('now')
         WHERE listing_id = ? AND status = 'pending'`,
      ).bind(report.listing_id),
    ]);
  } else {
    await env.DB.prepare(
      `UPDATE listing_reports
       SET status = ?, updated_at = datetime('now')
       WHERE id = ?`,
    )
      .bind(action === "review" ? "reviewed" : "dismissed", reportId)
      .run();
  }

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/sprzet");
  revalidatePath("/uslugi");
  revalidatePath(`/ogloszenie/${report.listing_id}`);
  redirect(`/admin?status=${filter}&zapisano=1`);
}
