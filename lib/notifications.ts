import { getCloudflareContext } from "@opennextjs/cloudflare";

export type NotificationType =
  | "reservation_created"
  | "reservation_accepted"
  | "reservation_rejected"
  | "reservation_cancelled"
  | "reservation_completed"
  | "review_received";

export type Notification = {
  id: number;
  type: NotificationType;
  title: string;
  body: string;
  href: string;
  read_at: string | null;
  created_at: string;
};

type NotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  href: string;
};

export function createNotificationStatement(
  db: D1Database,
  notification: NotificationInput,
): D1PreparedStatement {
  return db
    .prepare(
      `INSERT INTO notifications (user_id, type, title, body, href)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .bind(
      notification.userId,
      notification.type,
      notification.title,
      notification.body,
      notification.href,
    );
}

export async function getNotificationsForUser(
  userId: string,
  limit = 100,
): Promise<Notification[]> {
  const { env } = await getCloudflareContext({ async: true });
  const result = await env.DB.prepare(
    `SELECT id, type, title, body, href, read_at, created_at
     FROM notifications
     WHERE user_id = ?
     ORDER BY created_at DESC, id DESC
     LIMIT ?`,
  )
    .bind(userId, limit)
    .all<Notification>();

  return result.results;
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const { env } = await getCloudflareContext({ async: true });
  const result = await env.DB.prepare(
    `SELECT COUNT(*) AS unread_count
     FROM notifications
     WHERE user_id = ? AND read_at IS NULL`,
  )
    .bind(userId)
    .first<{ unread_count: number }>();

  return result?.unread_count ?? 0;
}
