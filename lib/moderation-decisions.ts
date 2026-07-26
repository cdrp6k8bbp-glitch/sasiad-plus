import "server-only";

import { getCloudflareContext } from "@opennextjs/cloudflare";

export type ModerationDecision = {
  id: number;
  report_kind: "listing" | "content";
  report_id: number;
  moderator_id: string | null;
  moderator_name: string | null;
  target_type: "listing" | "profile" | "message" | "review";
  decision: "reviewed" | "dismissed" | "archived";
  justification: string;
  created_at: string;
};

export async function getModerationDecisions(
  limit = 200,
): Promise<ModerationDecision[]> {
  const { env } = await getCloudflareContext({ async: true });
  const result = await env.DB.prepare(
    `SELECT
       moderation_decisions.id,
       moderation_decisions.report_kind,
       moderation_decisions.report_id,
       moderation_decisions.moderator_id,
       moderator.name AS moderator_name,
       moderation_decisions.target_type,
       moderation_decisions.decision,
       moderation_decisions.justification,
       moderation_decisions.created_at
     FROM moderation_decisions
     LEFT JOIN "user" AS moderator
       ON moderator.id = moderation_decisions.moderator_id
     ORDER BY moderation_decisions.created_at DESC,
       moderation_decisions.id DESC
     LIMIT ?`,
  )
    .bind(limit)
    .all<ModerationDecision>();

  return result.results;
}
