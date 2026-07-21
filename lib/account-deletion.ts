import { parseListingImageKeys } from "@/lib/listing-images";

type ListingImages = {
  image_key: string | null;
  image_keys: string | null;
};

async function getUserImageKeys(env: CloudflareEnv, userId: string) {
  const keys = new Set<string>();
  const listings = await env.DB.prepare(
    `SELECT image_key, image_keys
     FROM listings
     WHERE owner_id = ?`,
  )
    .bind(userId)
    .all<ListingImages>();

  for (const listing of listings.results) {
    for (const key of parseListingImageKeys(
      listing.image_keys,
      listing.image_key,
    )) {
      keys.add(key);
    }
  }

  let cursor: string | undefined;
  do {
    const page = await env.sasiad_plus_images.list({
      prefix: "listings/",
      cursor,
      include: ["customMetadata"],
    });

    for (const image of page.objects) {
      if (image.customMetadata?.ownerId === userId) {
        keys.add(image.key);
      }
    }

    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);

  return [...keys];
}

async function deleteImages(env: CloudflareEnv, keys: string[]) {
  for (let index = 0; index < keys.length; index += 1000) {
    await env.sasiad_plus_images.delete(keys.slice(index, index + 1000));
  }
}

export async function deleteUserApplicationData(
  env: CloudflareEnv,
  userId: string,
) {
  const imageKeys = await getUserImageKeys(env, userId);
  await deleteImages(env, imageKeys);

  const ownedListings = `SELECT id FROM listings WHERE owner_id = ?`;
  const userConversations = `
    SELECT id FROM conversations WHERE buyer_id = ? OR seller_id = ?
  `;

  await env.DB.batch([
    env.DB.prepare(
      `DELETE FROM messages
       WHERE conversation_id IN (${userConversations})`,
    ).bind(userId, userId),
    env.DB.prepare(
      `DELETE FROM conversations
       WHERE buyer_id = ? OR seller_id = ?`,
    ).bind(userId, userId),
    env.DB.prepare(
      `DELETE FROM reviews
       WHERE reviewer_id = ?
          OR reviewed_id = ?
          OR listing_id IN (${ownedListings})`,
    ).bind(userId, userId, userId),
    env.DB.prepare(
      `DELETE FROM notifications WHERE user_id = ?`,
    ).bind(userId),
    env.DB.prepare(
      `DELETE FROM favorite_listings
       WHERE user_id = ? OR listing_id IN (${ownedListings})`,
    ).bind(userId, userId),
    env.DB.prepare(
      `DELETE FROM listing_reports
       WHERE reporter_id = ? OR listing_id IN (${ownedListings})`,
    ).bind(userId, userId),
    env.DB.prepare(
      `DELETE FROM reservations
       WHERE requester_id = ?
          OR owner_id = ?
          OR listing_id IN (${ownedListings})`,
    ).bind(userId, userId, userId),
    env.DB.prepare(`DELETE FROM user_profiles WHERE user_id = ?`).bind(userId),
    env.DB.prepare(`DELETE FROM listings WHERE owner_id = ?`).bind(userId),
  ]);
}
