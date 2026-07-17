"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

function positiveInteger(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string") return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function openNotification(formData: FormData): Promise<void> {
  const notificationId = positiveInteger(formData.get("notification_id"));
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/logowanie?redirect=/powiadomienia");
  }

  if (!notificationId) {
    redirect("/powiadomienia");
  }

  const { env } = await getCloudflareContext({ async: true });
  const notification = await env.DB.prepare(
    `SELECT href FROM notifications WHERE id = ? AND user_id = ? LIMIT 1`,
  )
    .bind(notificationId, session.user.id)
    .first<{ href: string }>();

  if (!notification) {
    redirect("/powiadomienia");
  }

  await env.DB.prepare(
    `UPDATE notifications
     SET read_at = COALESCE(read_at, datetime('now'))
     WHERE id = ? AND user_id = ?`,
  )
    .bind(notificationId, session.user.id)
    .run();

  revalidatePath("/powiadomienia");
  redirect(notification.href);
}

export async function markAllNotificationsRead(): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/logowanie?redirect=/powiadomienia");
  }

  const { env } = await getCloudflareContext({ async: true });
  await env.DB.prepare(
    `UPDATE notifications
     SET read_at = datetime('now')
     WHERE user_id = ? AND read_at IS NULL`,
  )
    .bind(session.user.id)
    .run();

  revalidatePath("/powiadomienia");
  redirect("/powiadomienia");
}
