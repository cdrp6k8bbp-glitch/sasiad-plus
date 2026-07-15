export const CATEGORIES = {
  sprzet: {
    label: "Sprzęt",
    icon: "🛠️",
    subcategories: [
      "Wiertarki i młoty",
      "Szlifierki i piły",
      "Drabiny i rusztowania",
      "Myjki ciśnieniowe",
      "Odkurzacze przemysłowe",
      "Agregaty i osuszacze",
      "Inny sprzęt",
    ],
  },
  pomoc: {
    label: "Pomoc sąsiedzka",
    icon: "🤝",
    subcategories: [
      "Drobne remonty",
      "Skręcanie mebli",
      "Malowanie",
      "Pomoc przy przeprowadzce",
      "Zakupy i pomoc seniorom",
      "Inna pomoc",
    ],
  },
  zwierzeta: {
    label: "Zwierzęta",
    icon: "🐕",
    subcategories: [
      "Wyprowadzanie psa",
      "Opieka podczas urlopu",
      "Wizyty u kota",
      "Karmienie zwierząt",
      "Inna opieka",
    ],
  },
  dzieci: {
    label: "Opieka nad dziećmi",
    icon: "👶",
    subcategories: [
      "Opieka wieczorna",
      "Opieka weekendowa",
      "Opieka okazjonalna",
    ],
  },
  turystyka: {
    label: "Turystyka",
    icon: "🏕️",
    subcategories: [
      "Kampery",
      "Przyczepy kempingowe",
      "Namioty",
      "SUP-y",
      "Kajaki",
      "Rowery",
      "Pozostały sprzęt turystyczny",
    ],
  },
  ogrod: {
    label: "Ogród",
    icon: "🌿",
    subcategories: [
      "Kosiarki",
      "Glebogryzarki",
      "Wertykulatory",
      "Nożyce i pilarki",
      "Rozdrabniacze gałęzi",
      "Inny sprzęt ogrodowy",
    ],
  },
  dom: {
    label: "Dom",
    icon: "🏠",
    subcategories: [
      "Odkurzacze piorące",
      "Osuszacze",
      "Klimatyzatory",
      "Parownice",
      "Projektory",
      "Inne wyposażenie",
    ],
  },
} as const;

export type CategoryKey = keyof typeof CATEGORIES;

export function isCategoryKey(value: string): value is CategoryKey {
  return value in CATEGORIES;
}

export function isValidSubcategory(
  category: CategoryKey,
  subcategory: string,
): boolean {
  return CATEGORIES[category].subcategories.some(
    (item) => item === subcategory,
  );
}
