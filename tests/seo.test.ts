import { describe, expect, it } from "vitest";
import { GUIDES } from "@/lib/guides";
import { priceAmountFromLabel } from "@/lib/seo";

describe("dane SEO ogłoszeń", () => {
  it("odczytuje cenę zapisaną z walutą i jednostką", () => {
    expect(priceAmountFromLabel("50 zł / dzień")).toBe("50.00");
  });

  it("obsługuje polski separator dziesiętny", () => {
    expect(priceAmountFromLabel("19,99 zł")).toBe("19.99");
  });

  it("pomija cenę do uzgodnienia", () => {
    expect(priceAmountFromLabel("do uzgodnienia")).toBeNull();
  });
});

describe("poradniki SEO", () => {
  it("udostępnia cztery poradniki z unikalnymi adresami", () => {
    expect(GUIDES).toHaveLength(4);
    expect(new Set(GUIDES.map((guide) => guide.slug)).size).toBe(GUIDES.length);
  });

  it("każdy poradnik ma opis, słowa kluczowe i pełną treść", () => {
    for (const guide of GUIDES) {
      expect(guide.description.length).toBeGreaterThan(80);
      expect(guide.description.length).toBeLessThanOrEqual(160);
      expect(guide.keywords.length).toBeGreaterThanOrEqual(3);
      expect(guide.sections.length).toBeGreaterThanOrEqual(4);
    }
  });
});
