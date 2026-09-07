export const SEARCH_RADII = [10, 25, 50] as const;

export type SearchRadius = (typeof SEARCH_RADII)[number];

export type Locality = {
  name: string;
  latitude: number;
  longitude: number;
  aliases?: readonly string[];
};

export const LOCALITIES: readonly Locality[] = [
  { name: "Słupsk", latitude: 54.4641, longitude: 17.0287, aliases: ["okolice słupska", "slupsk", "okolice slupska"] },
  { name: "Kobylnica", latitude: 54.4396, longitude: 17.0013 },
  { name: "Redzikowo", latitude: 54.4726, longitude: 17.1187 },
  { name: "Siemianice", latitude: 54.5012, longitude: 17.0318 },
  { name: "Bierkowo", latitude: 54.4594, longitude: 16.9357 },
  { name: "Włynkówko", latitude: 54.5024, longitude: 16.9747, aliases: ["wlynkowko"] },
  { name: "Bolesławice", latitude: 54.4518, longitude: 16.9517, aliases: ["boleslawice"] },
  { name: "Krępa Słupska", latitude: 54.4123, longitude: 17.0628, aliases: ["krepa slupska"] },
  { name: "Ustka", latitude: 54.5805, longitude: 16.8619 },
  { name: "Rowy", latitude: 54.6643, longitude: 17.0547 },
  { name: "Smołdzino", latitude: 54.6639, longitude: 17.2137, aliases: ["smoldzino"] },
  { name: "Dębnica Kaszubska", latitude: 54.3783, longitude: 17.1616, aliases: ["debnica kaszubska"] },
  { name: "Damnica", latitude: 54.5014, longitude: 17.2717 },
  { name: "Główczyce", latitude: 54.6193, longitude: 17.3726, aliases: ["glowczyce"] },
  { name: "Postomino", latitude: 54.4932, longitude: 16.7136 },
  { name: "Sławno", latitude: 54.3628, longitude: 16.6789, aliases: ["slawno"] },
  { name: "Darłowo", latitude: 54.4209, longitude: 16.4107, aliases: ["darlowo"] },
  { name: "Bytów", latitude: 54.1706, longitude: 17.4919, aliases: ["bytow"] },
  { name: "Lębork", latitude: 54.5392, longitude: 17.7501, aliases: ["lebork"] },
] as const;

export function normalizeLocation(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase("pl")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function resolveLocality(value: string): Locality | null {
  const normalized = normalizeLocation(value);
  if (!normalized) return null;

  return (
    LOCALITIES.find((locality) => {
      const names = [locality.name, ...(locality.aliases ?? [])];
      return names.some((name) => normalizeLocation(name) === normalized);
    }) ?? null
  );
}

export function canonicalizeLocation(value: string): string {
  return resolveLocality(value)?.name ?? value.trim();
}

export function parseSearchRadius(value?: string | string[]): SearchRadius {
  const firstValue = Array.isArray(value) ? value[0] : value;
  const parsed = Number(firstValue);
  return SEARCH_RADII.includes(parsed as SearchRadius)
    ? (parsed as SearchRadius)
    : 10;
}

export function distanceInKilometres(
  first: Pick<Locality, "latitude" | "longitude">,
  second: Pick<Locality, "latitude" | "longitude">,
): number {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitudeDelta = toRadians(second.latitude - first.latitude);
  const longitudeDelta = toRadians(second.longitude - first.longitude);
  const firstLatitude = toRadians(first.latitude);
  const secondLatitude = toRadians(second.latitude);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(firstLatitude) *
      Math.cos(secondLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;

  return 6371 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

export function nearbyLocalities(value: string, radius: SearchRadius): Locality[] {
  const origin = resolveLocality(value);
  if (!origin) return [];

  return LOCALITIES.filter(
    (locality) => distanceInKilometres(origin, locality) <= radius,
  ).sort(
    (first, second) =>
      distanceInKilometres(origin, first) - distanceInKilometres(origin, second),
  );
}

export function matchesLocationSearch(
  listingLocation: string,
  selectedLocation: string,
  radius: SearchRadius,
): boolean {
  if (!selectedLocation.trim()) return true;

  const selected = resolveLocality(selectedLocation);
  const listing = resolveLocality(listingLocation);

  if (selected && listing) {
    return distanceInKilometres(selected, listing) <= radius;
  }

  const selectedNormalized = normalizeLocation(selectedLocation);
  const listingNormalized = normalizeLocation(listingLocation);
  return (
    listingNormalized.includes(selectedNormalized) ||
    selectedNormalized.includes(listingNormalized)
  );
}

export function nearestLocality(
  latitude: number,
  longitude: number,
): { locality: Locality; distance: number } {
  const point = { latitude, longitude };
  const [locality] = [...LOCALITIES].sort(
    (first, second) =>
      distanceInKilometres(point, first) - distanceInKilometres(point, second),
  );

  return { locality, distance: distanceInKilometres(point, locality) };
}
