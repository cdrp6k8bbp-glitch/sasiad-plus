import "server-only";

import { getCloudflareContext } from "@opennextjs/cloudflare";

export type UserBlockState = {
  blockedByViewer: boolean;
  viewerBlockedByUser: boolean;
};

export type BlockedUser = {
  id: string;
  name: string;
  blocked_at: string;
};

export async function areUsersBlocked(
  db: D1Database,
  firstUserId: string,
  secondUserId: string,
): Promise<boolean> {
  const result = await db
    .prepare(
      `SELECT 1 AS blocked
       FROM user_blocks
       WHERE (blocker_id = ? AND blocked_id = ?)
          OR (blocker_id = ? AND blocked_id = ?)
       LIMIT 1`,
    )
    .bind(firstUserId, secondUserId, secondUserId, firstUserId)
    .first<{ blocked: number }>();

  return Boolean(result?.blocked);
}

export async function getUserBlockState(
  viewerId: string,
  userId: string,
): Promise<UserBlockState> {
  const { env } = await getCloudflareContext({ async: true });
  const result = await env.DB.prepare(
    `SELECT
       EXISTS (
         SELECT 1
         FROM user_blocks
         WHERE blocker_id = ? AND blocked_id = ?
       ) AS blocked_by_viewer,
       EXISTS (
         SELECT 1
         FROM user_blocks
         WHERE blocker_id = ? AND blocked_id = ?
       ) AS viewer_blocked_by_user`,
  )
    .bind(viewerId, userId, userId, viewerId)
    .first<{
      blocked_by_viewer: number;
      viewer_blocked_by_user: number;
    }>();

  return {
    blockedByViewer: Boolean(result?.blocked_by_viewer),
    viewerBlockedByUser: Boolean(result?.viewer_blocked_by_user),
  };
}

export async function getBlockedUsers(userId: string): Promise<BlockedUser[]> {
  const { env } = await getCloudflareContext({ async: true });
  const result = await env.DB.prepare(
    `SELECT
       blocked_user.id,
       blocked_user.name,
       user_blocks.created_at AS blocked_at
     FROM user_blocks
     JOIN "user" AS blocked_user ON blocked_user.id = user_blocks.blocked_id
     WHERE user_blocks.blocker_id = ?
     ORDER BY user_blocks.created_at DESC`,
  )
    .bind(userId)
    .all<BlockedUser>();

  return result.results;
}
