import type { MetadataRoute } from "next";
import { getListings } from "@/lib/db";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

const publicPages: MetadataRoute.Sitemap = [
  { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1 },
  { url: absoluteUrl("/slupsk"), changeFrequency: "daily", priority: 0.95 },
  { url: absoluteUrl("/sprzet"), changeFrequency: "daily", priority: 0.9 },
  { url: absoluteUrl("/uslugi"), changeFrequency: "daily", priority: 0.9 },
  {
    url: absoluteUrl("/kategoria/zwierzeta"),
    changeFrequency: "daily",
    priority: 0.8,
  },
  {
    url: absoluteUrl("/kategoria/dzieci"),
    changeFrequency: "daily",
    priority: 0.8,
  },
  {
    url: absoluteUrl("/kategoria/turystyka"),
    changeFrequency: "daily",
    priority: 0.8,
  },
  {
    url: absoluteUrl("/kategoria/ogrod"),
    changeFrequency: "daily",
    priority: 0.8,
  },
  {
    url: absoluteUrl("/kategoria/dom"),
    changeFrequency: "daily",
    priority: 0.8,
  },
  {
    url: absoluteUrl("/rozwoj-osobisty"),
    changeFrequency: "daily",
    priority: 0.8,
  },
  {
    url: absoluteUrl("/regulamin"),
    changeFrequency: "monthly",
    priority: 0.3,
  },
  {
    url: absoluteUrl("/polityka-prywatnosci"),
    changeFrequency: "monthly",
    priority: 0.3,
  },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const listings = await getListings(undefined, 5000);

  return [
    ...publicPages,
    ...listings.map((listing) => ({
      url: absoluteUrl(`/ogloszenie/${listing.id}`),
      lastModified: new Date(listing.created_at),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
