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
        owner_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
  revalidatePath("/profil");

  redirect("/?dodano=1");
}
