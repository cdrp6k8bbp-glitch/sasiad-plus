"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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

export async function addListing(formData: FormData): Promise<void> {
  const title = readRequiredText(formData, "title");
  const category = readRequiredText(formData, "category");
  const subcategory = readRequiredText(formData, "subcategory");
  const price = readRequiredText(formData, "price");
  const location = readRequiredText(formData, "location");

  const description = readOptionalText(formData, "description") ?? "";
  const imageKey = readOptionalText(formData, "image_key");

  if (!isCategoryKey(category)) {
    throw new Error("Wybrana kategoria jest nieprawidłowa.");
  }

  if (!isValidSubcategory(category, subcategory)) {
    throw new Error("Podkategoria nie pasuje do wybranej kategorii.");
  }

  if (imageKey && !imageKey.startsWith("listings/")) {
    throw new Error("Nieprawidłowy klucz zdjęcia.");
  }

  const icon = CATEGORIES[category].icon;
  const { env } = await getCloudflareContext({ async: true });

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
        image_key
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
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
      )
      .run();
  } catch (error) {
    if (imageKey) {
      await env.sasiad_plus_images.delete(imageKey);
    }

    throw error;
  }

  revalidatePath("/");
  revalidatePath("/sprzet");
  revalidatePath("/uslugi");

  redirect("/?dodano=1");
}