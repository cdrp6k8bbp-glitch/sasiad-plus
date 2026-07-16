export function parseListingImageKeys(
  imageKeys: string | null,
  legacyImageKey: string | null,
): string[] {
  if (imageKeys) {
    try {
      const parsedImageKeys: unknown = JSON.parse(imageKeys);

      if (
        Array.isArray(parsedImageKeys) &&
        parsedImageKeys.length > 0 &&
        parsedImageKeys.length <= 5 &&
        parsedImageKeys.every(
          (imageKey) =>
            typeof imageKey === "string" && imageKey.startsWith("listings/"),
        )
      ) {
        return [...new Set(parsedImageKeys)];
      }
    } catch {
      // Starsze ogłoszenia korzystają z pojedynczego zdjęcia poniżej.
    }
  }

  return legacyImageKey?.startsWith("listings/") ? [legacyImageKey] : [];
}
