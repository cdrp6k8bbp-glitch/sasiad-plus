"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

function userIdFromForm(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

async function requireTargetUser(targetUserId: string) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect(`/logowanie?redirect=/u/${encodeURIComponent(targetUserId)}`);
  }

  if (!targetUserId || targetUserId === session.user.id) {
    throw new Error("Nie można zablokować własnego konta.");
  }

  const { env } = await getCloudflareContext({ async: true });
  const target = await env.DB.prepare(
    `SELECT id
     FROM "user"
     WHERE id = ?
     LIMIT 1`,
  )
    .bind(targetUserId)
    .first<{ id: string }>();

  if (!target) {
    throw new Error("Ten użytkownik już nie istnieje.");
  }

  return { db: env.DB, session };
}

export async function blockUser(formData: FormData): Promise<void> {
  const targetUserId = userIdFromForm(formData.get("user_id"));
  const returnTo =
    formData.get("return_to") === "/wiadomosci"
      ? "/wiadomosci?zablokowano=1"
      : `/u/${targetUserId}?blokada=1`;
  const { db, session } = await requireTargetUser(targetUserId);

  await db
    .prepare(
      `INSERT OR IGNORE INTO user_blocks (blocker_id, blocked_id)
       VALUES (?, ?)`,
    )
    .bind(session.user.id, targetUserId)
    .run();

  revalidatePath("/wiadomosci");
  revalidatePath("/ogloszenie/[id]", "page");
  revalidatePath(`/u/${targetUserId}`);
  redirect(returnTo);
}

export async function unblockUser(formData: FormData): Promise<void> {
  const targetUserId = userIdFromForm(formData.get("user_id"));
  const returnTo =
    formData.get("return_to") === "/profil/bezpieczenstwo"
      ? "/profil/bezpieczenstwo?odblokowano=1"
      : `/u/${targetUserId}?blokada=usunieta`;
  const { db, session } = await requireTargetUser(targetUserId);

  await db
    .prepare(
      `DELETE FROM user_blocks
       WHERE blocker_id = ? AND blocked_id = ?`,
    )
    .bind(session.user.id, targetUserId)
    .run();

  revalidatePath("/wiadomosci");
  revalidatePath("/ogloszenie/[id]", "page");
  revalidatePath("/profil/bezpieczenstwo");
  revalidatePath(`/u/${targetUserId}`);
  redirect(returnTo);
}
