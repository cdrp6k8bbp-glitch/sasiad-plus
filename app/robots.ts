import type { MetadataRoute } from "next";
import { absoluteUrl, SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/api/",
        "/dodaj",
        "/logowanie",
        "/nie-pamietam-hasla",
        "/powiadomienia",
        "/profil/",
        "/rejestracja",
        "/reset-hasla",
        "/u/",
        "/wiadomosci/",
        "/sprawdz-email",
        "/email-potwierdzony",
      ],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE_URL,
  };
}
