"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { enforceRateLimits, RATE_LIMITS } from "@/lib/anti-spam";
import { auth } from "@/lib/auth";
import {
  CATEGORIES,
  isCategoryKey,
  isValidSubcategory,
} from "@/lib/categories";
import {
  availabilityDatesValue,
  availabilitySlotsValue,
  availabilityWeekdaysValue,
  readListingAvailability,
} from "@/lib/listing-availability";

function readRequiredText(formData: FormData, field: string): string {
  const value = formData.get(field);

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Brak wymaganego pola: ${field}`);
  }

  return value.trim();
}

function readOptionalText(formData: FormData, field: string): string | null {
  const value = formData.get(field);

  if (typeof value !== "string" || value.trim().length === 0) {
    return null;
  }

  return value.trim();
}

function readImageKeys(formData: FormData): string[] {
  const value = readOptionalText(formData, "image_keys");

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

export async function addListing(formData: FormData): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/logowanie?redirect=/dodaj");
  }

  const title = readRequiredText(formData, "title");
  const category = readRequiredText(formData, "category");
  const subcategory = readRequiredText(formData, "subcategory");
  const price = readRequiredText(formData, "price");
  const location = readRequiredText(formData, "location");

  const description = readOptionalText(formData, "description") ?? "";
  const imageKeys = readImageKeys(formData);
  const imageKey = imageKeys[0] ?? null;
  const availability = readListingAvailability(formData);

  if (!isCategoryKey(category)) {
    throw new Error("Wybrana kategoria jest nieprawidłowa.");
  }

  if (!isValidSubcategory(category, subcategory)) {
    throw new Error("Podkategoria nie pasuje do wybranej kategorii.");
  }

  const icon = CATEGORIES[category].icon;
  const { env } = await getCloudflareContext({ async: true });

  if (imageKeys.length > 0) {
    const uploadedImages = await Promise.all(
      imageKeys.map((currentImageKey) =>
        env.sasiad_plus_images.head(currentImageKey),
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
    await enforceRateLimits(env.DB, session.user.id, RATE_LIMITS.listing);

    await env.DB.prepare(
      `INSERT INTO listings (
        title,
        category,
        subcategory,
        description,
        price,
        location,
        icon,
        image_key,
        image_keys,
        owner_id,
        availability_slots,
        availability_dates,
        availability_weekdays,
        availability_start_time,
        availability_end_time
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        title,
        category,
        subcategory,
        description,
        price,
        location,
        icon,
        imageKey,
        imageKeys.length > 0 ? JSON.stringify(imageKeys) : null,
        session.user.id,
        availabilitySlotsValue(availability.slots),
        availabilityDatesValue(availability.dates),
        availabilityWeekdaysValue(availability.weekdays),
        availability.startTime,
        availability.endTime,
      )
      .run();
  } catch (error) {
    if (imageKeys.length > 0) {
      await Promise.all(
        imageKeys.map((currentImageKey) =>
          env.sasiad_plus_images.delete(currentImageKey),
        ),
      );
    }

    throw error;
  }

  revalidatePath("/");
  revalidatePath("/sprzet");
  revalidatePath("/uslugi");
  revalidatePath("/rozwoj-osobisty");
  revalidatePath("/profil");

  redirect("/?dodano=1");
}
