"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const CATEGORY_ICONS: Record<string, string> = {
  sprzet: "🛠️",
  usluga: "🤝",
  pomoc: "🤝",
  zwierzeta: "🐕",
  dzieci: "👶",
  turystyka: "🏕️",
  ogrod: "🌿",
  dom: "🏠",
};

function readRequiredText(formData: FormData, field: string): string {
  const value = formData.get(field);

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Brak wymaganego pola: ${field}`);
  }

  return value.trim();
}

function getFileExtension(file: File): string {
  if (file.type === "image/jpeg") return "jpg";
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "bin";
}

async function uploadImage(formData: FormData): Promise<string | null> {
  const image = formData.get("image");

  if (!(image instanceof File) || image.size === 0) {
    return null;
  }

  if (!ACCEPTED_IMAGE_TYPES.has(image.type)) {
    throw new Error("Obsługiwane są tylko obrazy JPG, PNG i WEBP.");
  }

  if (image.size > MAX_IMAGE_SIZE) {
    throw new Error("Plik jest zbyt duży. Maksymalny rozmiar to 5 MB.");
  }

  const { env } = await getCloudflareContext({ async: true });
  const imageKey = `listings/${crypto.randomUUID()}.${getFileExtension(image)}`;

  await env.sasiad_plus_images.put(imageKey, image.stream(), {
    httpMetadata: {
      contentType: image.type,
    },
    customMetadata: {
      originalName: image.name.slice(0, 200),
    },
  });

  return imageKey;
}

export async function addListing(formData: FormData): Promise<void> {
  const title = readRequiredText(formData, "title");
  const category = readRequiredText(formData, "category");
  const price = readRequiredText(formData, "price");
  const location = readRequiredText(formData, "location");

  const descriptionValue = formData.get("description");
  const description =
    typeof descriptionValue === "string" ? descriptionValue.trim() : "";

  const icon = CATEGORY_ICONS[category] ?? "📦";
  const imageKey = await uploadImage(formData);

  const { env } = await getCloudflareContext({ async: true });

  try {
    await env.DB.prepare(
      `INSERT INTO listings (
        title,
        category,
        description,
        price,
        location,
        icon,
        image_key
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(title, category, description, price, location, icon, imageKey)
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
