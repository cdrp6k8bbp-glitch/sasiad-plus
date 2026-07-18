"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  CATEGORIES,
  isCategoryKey,
  isValidSubcategory,
} from "@/lib/categories";
import { parseListingImageKeys } from "@/lib/listing-images";

type CurrentListing = {
  owner_id: string | null;
  image_key: string | null;
  image_keys: string | null;
  archived_at: string | null;
};

function positiveInteger(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string") return null;

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function requiredText(formData: FormData, field: string): string {
  const value = formData.get(field);

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Brak wymaganego pola: ${field}`);
  }

  return value.trim();
}

function optionalText(formData: FormData, field: string): string | null {
  const value = formData.get(field);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function imageKeysFromForm(formData: FormData): string[] {
  const value = optionalText(formData, "image_keys");
  if (!value) return [];

  let imageKeys: unknown;
  try {
    imageKeys = JSON.parse(value);
  } catch {
    throw new Error("Nieprawidłowa lista zdjęć.");
  }

  if (
    !Array.isArray(imageKeys) ||
    imageKeys.length > 5 ||
    imageKeys.some(
      (imageKey) =>
        typeof imageKey !== "string" || !imageKey.startsWith("listings/"),
    )
  ) {
    throw new Error("Nieprawidłowa lista zdjęć.");
  }

  return [...new Set(imageKeys)];
}

function revalidateListingPages(listingId: number) {
  revalidatePath("/");
  revalidatePath("/sprzet");
  revalidatePath("/uslugi");
  revalidatePath("/profil");
  revalidatePath(`/ogloszenie/${listingId}`);
  revalidatePath("/wiadomosci");
}

export async function updateListing(
  listingId: number,
  formData: FormData,
): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect(`/logowanie?redirect=/ogloszenie/${listingId}/edytuj`);
  }

  const title = requiredText(formData, "title");
  const category = requiredText(formData, "category");
  const subcategory = requiredText(formData, "subcategory");
  const price = requiredText(formData, "price");
  const location = requiredText(formData, "location");
  const description = optionalText(formData, "description") ?? "";
  const imageKeys = imageKeysFromForm(formData);

  if (!isCategoryKey(category)) {
    throw new Error("Wybrana kategoria jest nieprawidłowa.");
  }

  if (!isValidSubcategory(category, subcategory)) {
    throw new Error("Podkategoria nie pasuje do wybranej kategorii.");
  }

  const { env } = await getCloudflareContext({ async: true });
  const currentListing = await env.DB.prepare(
    `SELECT owner_id, image_key, image_keys, archived_at
     FROM listings
     WHERE id = ?
     LIMIT 1`,
  )
    .bind(listingId)
    .first<CurrentListing>();

  if (!currentListing || currentListing.owner_id !== session.user.id) {
    throw new Error("Nie masz dostępu do edycji tego ogłoszenia.");
  }

  if (currentListing.archived_at) {
    throw new Error("Przywróć ogłoszenie przed jego edycją.");
  }

  const currentImageKeys = parseListingImageKeys(
    currentListing.image_keys,
    currentListing.image_key,
  );
  const newlyUploadedKeys = imageKeys.filter(
    (imageKey) => !currentImageKeys.includes(imageKey),
  );
  const removedImageKeys = currentImageKeys.filter(
    (imageKey) => !imageKeys.includes(imageKey),
  );

  if (newlyUploadedKeys.length > 0) {
    const uploadedImages = await Promise.all(
      newlyUploadedKeys.map((imageKey) =>
        env.sasiad_plus_images.head(imageKey),
      ),
    );

    if (
      uploadedImages.some(
        (image) => image?.customMetadata?.ownerId !== session.user.id,
      )
    ) {
      throw new Error("Nie można użyć wybranego zdjęcia.");
    }
  }

  try {
    await env.DB.prepare(
      `UPDATE listings
       SET title = ?,
           category = ?,
           subcategory = ?,
           description = ?,
           price = ?,
           location = ?,
           icon = ?,
           image_key = ?,
           image_keys = ?
       WHERE id = ? AND owner_id = ?`,
    )
      .bind(
        title,
        category,
        subcategory,
        description,
        price,
        location,
        CATEGORIES[category].icon,
        imageKeys[0] ?? null,
        imageKeys.length > 0 ? JSON.stringify(imageKeys) : null,
        listingId,
        session.user.id,
      )
      .run();
  } catch (error) {
    await Promise.all(
      newlyUploadedKeys.map((imageKey) =>
        env.sasiad_plus_images.delete(imageKey),
      ),
    );
    throw error;
  }

  await Promise.all(
    removedImageKeys.map((imageKey) =>
      env.sasiad_plus_images.delete(imageKey),
    ),
  );

  revalidateListingPages(listingId);
  redirect(`/ogloszenie/${listingId}?zapisano=1`);
}

export async function archiveListing(formData: FormData): Promise<void> {
  const listingId = positiveInteger(formData.get("listing_id"));
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/logowanie?redirect=/profil");
  }

  if (!listingId) {
    throw new Error("Nieprawidłowe ogłoszenie.");
  }

  const { env } = await getCloudflareContext({ async: true });
  const listing = await env.DB.prepare(
    `SELECT owner_id, image_key, image_keys, archived_at
     FROM listings
     WHERE id = ?
     LIMIT 1`,
  )
    .bind(listingId)
    .first<CurrentListing>();

  if (!listing || listing.owner_id !== session.user.id) {
    throw new Error("Nie masz dostępu do archiwizacji tego ogłoszenia.");
  }

  await env.DB.prepare(
    `UPDATE listings
     SET archived_at = COALESCE(archived_at, datetime('now'))
     WHERE id = ? AND owner_id = ?`,
  )
    .bind(listingId, session.user.id)
    .run();

  revalidateListingPages(listingId);
  redirect("/profil?zarchiwizowano=1");
}

export async function restoreListing(formData: FormData): Promise<void> {
  const listingId = positiveInteger(formData.get("listing_id"));
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/logowanie?redirect=/profil");
  }

  if (!listingId) {
    throw new Error("Nieprawidłowe ogłoszenie.");
  }

  const { env } = await getCloudflareContext({ async: true });
  const result = await env.DB.prepare(
    `UPDATE listings
     SET archived_at = NULL
     WHERE id = ? AND owner_id = ? AND archived_at IS NOT NULL`,
  )
    .bind(listingId, session.user.id)
    .run();

  if (!result.meta.changes) {
    throw new Error("Nie udało się przywrócić tego ogłoszenia.");
  }

  revalidateListingPages(listingId);
  redirect("/profil?przywrocono=1");
}
