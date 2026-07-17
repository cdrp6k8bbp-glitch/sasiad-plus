"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

function textValue(formData: FormData, field: string): string {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

export async function updateProfile(formData: FormData): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/logowanie?redirect=/profil/edytuj");
  }

  const name = textValue(formData, "name");
  const city = textValue(formData, "city");
  const bio = textValue(formData, "bio");

  if (name.length < 2 || name.length > 80) {
    throw new Error("Imię musi mieć od 2 do 80 znaków.");
  }

  if (city.length > 80) {
    throw new Error("Miejscowość może mieć maksymalnie 80 znaków.");
  }

  if (bio.length > 500) {
    throw new Error("Opis może mieć maksymalnie 500 znaków.");
  }

  const { env } = await getCloudflareContext({ async: true });
  await env.DB.batch([
    env.DB.prepare(
      `UPDATE "user"
       SET name = ?, "updatedAt" = ?
       WHERE id = ?`,
    ).bind(name, Date.now(), session.user.id),
    env.DB.prepare(
      `INSERT INTO user_profiles (user_id, city, bio, updated_at)
       VALUES (?, ?, ?, datetime('now'))
       ON CONFLICT(user_id) DO UPDATE SET
         city = excluded.city,
         bio = excluded.bio,
         updated_at = datetime('now')`,
    ).bind(session.user.id, city || null, bio || null),
  ]);

  revalidatePath("/");
  revalidatePath("/profil");
  revalidatePath("/sprzet");
  revalidatePath("/uslugi");
  revalidatePath(`/u/${session.user.id}`);
  redirect("/profil?zapisano=1");
}
