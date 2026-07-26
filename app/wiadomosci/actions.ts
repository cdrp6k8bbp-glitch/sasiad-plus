"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { enforceRateLimits, RATE_LIMITS } from "@/lib/anti-spam";
import { auth } from "@/lib/auth";
import { areUsersBlocked } from "@/lib/user-blocks";

function positiveInteger(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string") return null;

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function startConversation(formData: FormData): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() });
  const listingId = positiveInteger(formData.get("listing_id"));

  if (!session) {
    redirect(
      listingId
        ? `/logowanie?redirect=/ogloszenie/${listingId}`
        : "/logowanie?redirect=/wiadomosci",
    );
  }

  if (!listingId) {
    throw new Error("Nieprawidłowe ogłoszenie.");
  }

  const { env } = await getCloudflareContext({ async: true });
  const listing = await env.DB.prepare(
    `SELECT owner_id
     FROM listings
     WHERE id = ? AND archived_at IS NULL
     LIMIT 1`,
  )
    .bind(listingId)
    .first<{ owner_id: string | null }>();

  if (!listing?.owner_id) {
    throw new Error("To ogłoszenie nie ma jeszcze właściciela konta.");
  }

  if (listing.owner_id === session.user.id) {
    throw new Error("Nie można rozpocząć rozmowy z samym sobą.");
  }

  if (
    await areUsersBlocked(env.DB, session.user.id, listing.owner_id)
  ) {
    throw new Error(
      "Nie możesz rozpocząć rozmowy z tym użytkownikiem, ponieważ jedno z Was zablokowało kontakt.",
    );
  }

  const existingConversation = await env.DB.prepare(
    `SELECT id
     FROM conversations
     WHERE listing_id = ? AND buyer_id = ? AND seller_id = ?
     LIMIT 1`,
  )
    .bind(listingId, session.user.id, listing.owner_id)
    .first<{ id: number }>();

  if (existingConversation) {
    redirect(`/wiadomosci/${existingConversation.id}`);
  }

  await enforceRateLimits(
    env.DB,
    session.user.id,
    RATE_LIMITS.startConversation,
  );

  await env.DB.prepare(
    `INSERT OR IGNORE INTO conversations (listing_id, buyer_id, seller_id)
     VALUES (?, ?, ?)`,
  )
    .bind(listingId, session.user.id, listing.owner_id)
    .run();

  const conversation = await env.DB.prepare(
    `SELECT id
     FROM conversations
     WHERE listing_id = ? AND buyer_id = ? AND seller_id = ?
     LIMIT 1`,
  )
    .bind(listingId, session.user.id, listing.owner_id)
    .first<{ id: number }>();

  if (!conversation) {
    throw new Error("Nie udało się rozpocząć rozmowy.");
  }

  redirect(`/wiadomosci/${conversation.id}`);
}

export async function sendMessage(
  conversationId: number,
  formData: FormData,
): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect(`/logowanie?redirect=/wiadomosci/${conversationId}`);
  }

  const bodyValue = formData.get("body");
  const body = typeof bodyValue === "string" ? bodyValue.trim() : "";

  if (body.length === 0 || body.length > 2000) {
    throw new Error("Wiadomość musi mieć od 1 do 2000 znaków.");
  }

  const { env } = await getCloudflareContext({ async: true });
  const conversation = await env.DB.prepare(
    `SELECT id, buyer_id, seller_id
     FROM conversations
     WHERE id = ? AND (buyer_id = ? OR seller_id = ?)
     LIMIT 1`,
  )
    .bind(conversationId, session.user.id, session.user.id)
    .first<{ id: number; buyer_id: string; seller_id: string }>();

  if (!conversation) {
    throw new Error("Nie masz dostępu do tej rozmowy.");
  }

  const otherUserId =
    conversation.buyer_id === session.user.id
      ? conversation.seller_id
      : conversation.buyer_id;

  if (await areUsersBlocked(env.DB, session.user.id, otherUserId)) {
    throw new Error(
      "Nie możesz wysłać wiadomości, ponieważ jedno z Was zablokowało kontakt.",
    );
  }

  await enforceRateLimits(env.DB, session.user.id, RATE_LIMITS.message);

  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO messages (conversation_id, sender_id, body)
       VALUES (?, ?, ?)`,
    ).bind(conversationId, session.user.id, body),
    env.DB.prepare(
      `UPDATE conversations
       SET updated_at = datetime('now')
       WHERE id = ?`,
    ).bind(conversationId),
  ]);

  revalidatePath("/wiadomosci");
  revalidatePath(`/wiadomosci/${conversationId}`);
}
