import { getCloudflareContext } from "@opennextjs/cloudflare";

export type ListingReportStatus = "pending" | "reviewed" | "dismissed";

export type ListingReport = {
  id: number;
  listing_id: number;
  reporter_id: string;
  reason: string;
  details: string | null;
  status: ListingReportStatus;
  created_at: string;
  updated_at: string;
  listing_title: string;
  listing_location: string;
  listing_archived_at: string | null;
  reporter_name: string;
  reporter_email: string;
};

export async function getListingReports(): Promise<ListingReport[]> {
  const { env } = await getCloudflareContext({ async: true });
  const result = await env.DB.prepare(
    `SELECT
       listing_reports.id,
       listing_reports.listing_id,
       listing_reports.reporter_id,
       listing_reports.reason,
       listing_reports.details,
       listing_reports.status,
       listing_reports.created_at,
       listing_reports.updated_at,
       listings.title AS listing_title,
       listings.location AS listing_location,
       listings.archived_at AS listing_archived_at,
       reporter.name AS reporter_name,
       reporter.email AS reporter_email
     FROM listing_reports
     JOIN listings ON listings.id = listing_reports.listing_id
     JOIN "user" AS reporter ON reporter.id = listing_reports.reporter_id
     ORDER BY
       CASE listing_reports.status
         WHEN 'pending' THEN 0
         WHEN 'reviewed' THEN 1
         ELSE 2
       END,
       listing_reports.created_at DESC
     LIMIT 200`,
  ).all<ListingReport>();

  return result.results;
}
