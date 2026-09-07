import { describe, expect, it } from "vitest";
import {
  canonicalizeLocation,
  matchesLocationSearch,
  nearbyLocalities,
  parseSearchRadius,
  resolveLocality,
} from "@/lib/locations";

describe("lokalne wyszukiwanie", () => {
  it("ujednolica starsze określenia okolic Słupska", () => {
    expect(canonicalizeLocation("okolice Słupska")).toBe("Słupsk");
    expect(resolveLocality("SLUPSK")?.name).toBe("Słupsk");
  });

  it("uwzględnia pobliskie miejscowości w wybranym promieniu", () => {
    expect(matchesLocationSearch("Redzikowo", "Słupsk", 10)).toBe(true);
    expect(matchesLocationSearch("Ustka", "Słupsk", 10)).toBe(false);
    expect(matchesLocationSearch("Ustka", "Słupsk", 25)).toBe(true);
  });

  it("zachowuje wyszukiwanie tekstowe dla miejsc spoza słownika", () => {
    expect(matchesLocationSearch("Gdańsk Wrzeszcz", "Gdańsk", 10)).toBe(true);
  });

  it("odrzuca nieobsługiwany promień", () => {
    expect(parseSearchRadius("25")).toBe(25);
    expect(parseSearchRadius("100")).toBe(10);
  });

  it("podaje miejscowości położone w pobliżu", () => {
    const names = nearbyLocalities("Słupsk", 10).map((item) => item.name);
    expect(names).toContain("Słupsk");
    expect(names).toContain("Kobylnica");
    expect(names).not.toContain("Ustka");
  });
});
