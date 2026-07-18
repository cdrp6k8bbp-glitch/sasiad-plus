"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function setFavorite(
  listingId: number,
  shouldBeFavorite: boolean,
): Promise<boolean> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    throw new Error("Zaloguj się, aby zapisywać ulubione ogłoszenia.");
  }

  if (!Number.isInteger(listingId) || listingId < 1) {
    throw new Error("Nieprawidłowe ogłoszenie.");
  }

  const { env } = await getCloudflareContext({ async: true });

  if (shouldBeFavorite) {
    const listing = await env.DB.prepare(
      `SELECT id
       FROM listings
       WHERE id = ? AND archived_at IS NULL
       LIMIT 1`,
    )
      .bind(listingId)
      .first<{ id: number }>();

    if (!listing) {
      throw new Error("To ogłoszenie już nie istnieje.");
    }

    await env.DB.prepare(
      `INSERT OR IGNORE INTO favorite_listings (user_id, listing_id)
       VALUES (?, ?)`,
    )
      .bind(session.user.id, listingId)
      .run();
  } else {
    await env.DB.prepare(
      `DELETE FROM favorite_listings WHERE user_id = ? AND listing_id = ?`,
    )
      .bind(session.user.id, listingId)
      .run();
  }

  revalidatePath("/");
  revalidatePath("/sprzet");
  revalidatePath("/uslugi");
  revalidatePath("/profil");
  revalidatePath(`/ogloszenie/${listingId}`);

  return shouldBeFavorite;
}
