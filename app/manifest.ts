import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sąsiad+",
    short_name: "Sąsiad+",
    description: "Pożyczaj rzeczy i pomagaj sąsiadom w swojej okolicy.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7faf8",
    theme_color: "#15803d",
    lang: "pl",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
