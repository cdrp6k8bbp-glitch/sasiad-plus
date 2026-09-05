export const SITE_NAME = "Sąsiad+";
export const SITE_URL = "https://sasiad-plus.com";
export const DEFAULT_DESCRIPTION =
  "Pożyczaj rzeczy, oferuj pomoc i korzystaj z usług zaufanych osób w swojej okolicy.";

export function absoluteUrl(path = "/"): string {
  return new URL(path, SITE_URL).toString();
}

export function listingImageUrl(imageKey: string): string {
  const encodedKey = imageKey
    .split("/")
    .map(encodeURIComponent)
    .join("/");

  return absoluteUrl(`/api/images/${encodedKey}`);
}

export function metadataDescription(value: string, maxLength = 160): string {
  const normalized = value.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
}

export function priceAmountFromLabel(value: string): string | null {
  const match = value
    .replace(/\s/g, "")
    .replace(",", ".")
    .match(/\d+(?:\.\d{1,2})?/);

  if (!match) {
    return null;
  }

  const amount = Number(match[0]);

  return Number.isFinite(amount) ? amount.toFixed(2) : null;
}
