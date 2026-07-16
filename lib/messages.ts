import { getCloudflareContext } from "@opennextjs/cloudflare";

export type ConversationSummary = {
  id: number;
  listing_id: number;
  listing_title: string;
  other_user_name: string;
  last_message: string | null;
  updated_at: string;
};

export type Conversation = {
  id: number;
  listing_id: number;
  listing_title: string;
  buyer_id: string;
  buyer_name: string;
  seller_id: string;
  seller_name: string;
  updated_at: string;
};

export type Message = {
  id: number;
  sender_id: string;
  sender_name: string;
  body: string;
  created_at: string;
};

export async function getConversationsForUser(
  userId: string,
): Promise<ConversationSummary[]> {
  const { env } = await getCloudflareContext({ async: true });

  const result = await env.DB.prepare(
    `SELECT
       conversations.id,
       conversations.listing_id,
       listings.title AS listing_title,
       CASE
         WHEN conversations.buyer_id = ? THEN seller.name
         ELSE buyer.name
       END AS other_user_name,
       (
         SELECT messages.body
         FROM messages
         WHERE messages.conversation_id = conversations.id
         ORDER BY messages.created_at DESC, messages.id DESC
         LIMIT 1
       ) AS last_message,
       conversations.updated_at
     FROM conversations
     JOIN listings ON listings.id = conversations.listing_id
     JOIN "user" AS buyer ON buyer.id = conversations.buyer_id
     JOIN "user" AS seller ON seller.id = conversations.seller_id
     WHERE conversations.buyer_id = ? OR conversations.seller_id = ?
     ORDER BY conversations.updated_at DESC, conversations.id DESC`,
  )
    .bind(userId, userId, userId)
    .all<ConversationSummary>();

  return result.results;
}

export async function getConversationForUser(
  conversationId: number,
  userId: string,
): Promise<Conversation | null> {
  const { env } = await getCloudflareContext({ async: true });

  const conversation = await env.DB.prepare(
    `SELECT
       conversations.id,
       conversations.listing_id,
       listings.title AS listing_title,
       conversations.buyer_id,
       buyer.name AS buyer_name,
       conversations.seller_id,
       seller.name AS seller_name,
       conversations.updated_at
     FROM conversations
     JOIN listings ON listings.id = conversations.listing_id
     JOIN "user" AS buyer ON buyer.id = conversations.buyer_id
     JOIN "user" AS seller ON seller.id = conversations.seller_id
     WHERE conversations.id = ?
       AND (conversations.buyer_id = ? OR conversations.seller_id = ?)
     LIMIT 1`,
  )
    .bind(conversationId, userId, userId)
    .first<Conversation>();

  return conversation ?? null;
}

export async function getMessages(
  conversationId: number,
): Promise<Message[]> {
  const { env } = await getCloudflareContext({ async: true });

  const result = await env.DB.prepare(
    `SELECT
       messages.id,
       messages.sender_id,
       "user".name AS sender_name,
       messages.body,
       messages.created_at
     FROM messages
     JOIN "user" ON "user".id = messages.sender_id
     WHERE messages.conversation_id = ?
     ORDER BY messages.created_at ASC, messages.id ASC`,
  )
    .bind(conversationId)
    .all<Message>();

  return result.results;
}
