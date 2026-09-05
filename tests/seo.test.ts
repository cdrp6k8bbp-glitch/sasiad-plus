import { describe, expect, it } from "vitest";
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
