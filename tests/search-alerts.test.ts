import { describe, expect, it } from "vitest";
import { alertMatchesListing, type SearchAlert } from "@/lib/search-alerts";

const alert: SearchAlert = {
  id: 1,
  user_id: "szukajacy",
  query: "odkurzacz",
  categories: "dom",
  location: "Słupsk",
  radius: 25,
  kind: "alert",
  description: null,
  created_at: "2026-09-07T00:00:00.000Z",
};

const listing = {
  id: 10,
  title: "Odkurzacz piorący",
  description: "Do prania kanap i dywanów",
  subcategory: "Odkurzacze piorące",
  category: "dom",
  location: "Ustka",
  ownerId: "oferujacy",
};

describe("alerty wyszukiwania", () => {
  it("dopasowuje ofertę po frazie, kategorii i promieniu", () => {
    expect(alertMatchesListing(alert, listing)).toBe(true);
  });

  it("nie dopasowuje oferty spoza wybranego promienia", () => {
    expect(alertMatchesListing({ ...alert, radius: 10 }, listing)).toBe(false);
  });

  it("nie powiadamia autora o jego własnej ofercie", () => {
    expect(
      alertMatchesListing(alert, { ...listing, ownerId: alert.user_id }),
    ).toBe(false);
  });

  it("nie dopasowuje innej kategorii ani innej frazy", () => {
    expect(
      alertMatchesListing({ ...alert, categories: "ogrod" }, listing),
    ).toBe(false);
    expect(
      alertMatchesListing({ ...alert, query: "kosiarka" }, listing),
    ).toBe(false);
  });
});
