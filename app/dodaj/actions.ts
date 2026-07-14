"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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

export async function addListing(formData: FormData): Promise<void> {
  const title = readRequiredText(formData, "title");
  const category = readRequiredText(formData, "category");
  const price = readRequiredText(formData, "price");
  const location = readRequiredText(formData, "location");

  const descriptionValue = formData.get("description");
  const description =
    typeof descriptionValue === "string" ? descriptionValue.trim() : "";

  const icon = CATEGORY_ICONS[category] ?? "📦";

  const { env } = await getCloudflareContext({ async: true });

  await env.DB.prepare(
    `INSERT INTO listings (
      title,
      category,
      description,
      price,
      location,
      icon
    ) VALUES (?, ?, ?, ?, ?, ?)`,
  )
    .bind(title, category, description, price, location, icon)
    .run();

  revalidatePath("/");
  revalidatePath("/sprzet");
  revalidatePath("/uslugi");

  redirect("/?dodano=1");
}
