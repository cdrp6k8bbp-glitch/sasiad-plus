"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { enforceRateLimits, RATE_LIMITS } from "@/lib/anti-spam";
import { auth } from "@/lib/auth";
import { isCategoryKey } from "@/lib/categories";
import { canonicalizeLocation, parseSearchRadius } from "@/lib/locations";

const ALLOWED_CATEGORIES = new Set([
  "sprzet",
  "pomoc",
  "usluga",
  "zwierzeta",
  "dzieci",
  "turystyka",
  "ogrod",
  "dom",
  "rozwoj",
]);

function text(formData: FormData, field: string, maxLength: number) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function categoriesValue(value: string) {
  return [...new Set(value.split(",").filter((item) => ALLOWED_CATEGORIES.has(item)))]
    .slice(0, 8)
    .join(",");
}

function safeReturnPath(value: string) {
  return value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

function withSavedFlag(path: string) {
  return `${path}${path.includes("?") ? "&" : "?"}alert=1`;
}

export async function saveSearchAlert(formData: FormData): Promise<void> {
  const returnPath = safeReturnPath(text(formData, "return_path", 500));
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect(`/logowanie?redirect=${encodeURIComponent(returnPath)}`);
  }

  const query = text(formData, "query", 120);
  const location = canonicalizeLocation(text(formData, "location", 120));
  const categories = categoriesValue(text(formData, "categories", 120));
  const radius = parseSearchRadius(text(formData, "radius", 3));

  if (!query && !location && !categories) {
    throw new Error("Wpisz czego szukasz, kategorię lub miejscowość.");
  }

  const { env } = await getCloudflareContext({ async: true });
  await enforceRateLimits(env.DB, session.user.id, RATE_LIMITS.searchAlert);
  await env.DB
    .prepare(
      `INSERT OR IGNORE INTO search_alerts
         (user_id, query, categories, location, radius, kind)
       VALUES (?, ?, ?, ?, ?, 'alert')`,
    )
    .bind(session.user.id, query, categories, location, radius)
    .run();

  redirect(withSavedFlag(returnPath));
}

export async function createDemand(formData: FormData): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/logowanie?redirect=/zapotrzebowania/dodaj");

  const query = text(formData, "query", 120);
  const category = text(formData, "category", 40);
  const location = canonicalizeLocation(text(formData, "location", 120));
  const radius = parseSearchRadius(text(formData, "radius", 3));
  const description = text(formData, "description", 1000);

  if (query.length < 3) throw new Error("Napisz, czego potrzebujesz.");
  if (!isCategoryKey(category)) throw new Error("Wybierz kategorię.");
  if (!location) throw new Error("Wybierz miejscowość.");

  const { env } = await getCloudflareContext({ async: true });
  await enforceRateLimits(env.DB, session.user.id, RATE_LIMITS.demand);
  await env.DB
    .prepare(
      `INSERT INTO search_alerts
         (user_id, query, categories, location, radius, kind, description)
       VALUES (?, ?, ?, ?, ?, 'demand', ?)`,
    )
    .bind(session.user.id, query, category, location, radius, description || null)
    .run();

  redirect("/zapotrzebowania?dodano=1");
}
