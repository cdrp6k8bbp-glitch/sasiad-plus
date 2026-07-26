import "server-only";

import { getCloudflareContext } from "@opennextjs/cloudflare";

export type ContentReportStatus = "pending" | "reviewed" | "dismissed";
export type ContentReportTarget = "profile" | "message" | "review";

export type ContentReport = {
  id: number;
  reporter_id: string;
  reported_user_id: string;
  target_type: ContentReportTarget;
  target_id: string;
  reason: string;
  details: string | null;
  content_snapshot: string | null;
  status: ContentReportStatus;
  created_at: string;
  updated_at: string;
  reporter_name: string;
  reporter_email: string;
  reported_user_name: string;
  reported_user_email: string;
};

export async function getContentReports(): Promise<ContentReport[]> {
  const { env } = await getCloudflareContext({ async: true });
  const result = await env.DB.prepare(
    `SELECT
       content_reports.id,
       content_reports.reporter_id,
       content_reports.reported_user_id,
       content_reports.target_type,
       content_reports.target_id,
       content_reports.reason,
       content_reports.details,
       content_reports.content_snapshot,
       content_reports.status,
       content_reports.created_at,
       content_reports.updated_at,
       reporter.name AS reporter_name,
       reporter.email AS reporter_email,
       reported_user.name AS reported_user_name,
       reported_user.email AS reported_user_email
     FROM content_reports
     JOIN "user" AS reporter ON reporter.id = content_reports.reporter_id
     JOIN "user" AS reported_user
       ON reported_user.id = content_reports.reported_user_id
     ORDER BY
       CASE content_reports.status
         WHEN 'pending' THEN 0
         WHEN 'reviewed' THEN 1
         ELSE 2
       END,
       content_reports.created_at DESC
     LIMIT 200`,
  ).all<ContentReport>();

  return result.results;
}
