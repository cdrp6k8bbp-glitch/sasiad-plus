"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { redirect } from "next/navigation";

const CATEGORY_ICONS: Record<string, string> = {
  sprzet: "🔧",
  usluga: "🧰",
  pomoc: "🤝",
};

export async function addListing(formData: FormData) {
  const title = formData.get("title")?.toString().trim();
  const category = formData.get("category")?.toString();
  const description = formData.get("description")?.toString().trim();
  const price = formData.get("price")?.toString().trim();
  const location = formData.get("location")?.toString().trim();

  if (!title || !category || !price || !location) {
    throw new Error("Wypełnij wszystkie wymagane pola.");
  }

  const { env } = getCloudflareContext();
  const icon = CATEGORY_ICONS[category] ?? "📦";

  await env.DB.prepare(
    `INSERT INTO listings (title, category, description, price, location, icon)
     VALUES (?, ?, ?, ?, ?, ?)`
  )
    .bind(title, category, description ?? "", price, location, icon)
    .run();

  redirect("/?dodano=1");
}
