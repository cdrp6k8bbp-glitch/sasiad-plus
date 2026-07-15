"use client";

import { useState } from "react";
import { CATEGORIES, type CategoryKey } from "@/lib/categories";

export default function CategoryFields() {
  const [category, setCategory] = useState<CategoryKey | "">("");
  const [subcategory, setSubcategory] = useState("");

  const subcategories = category
    ? CATEGORIES[category].subcategories
    : [];

  return (
    <div className="space-y-5">
      <div>
        <label
          htmlFor="category"
          className="mb-2 block text-sm font-bold text-slate-700"
        >
          Kategoria
        </label>

        <select
          id="category"
          name="category"
          required
          value={category}
          onChange={(event) => {
            setCategory(event.target.value as CategoryKey | "");
            setSubcategory("");
          }}
          className="w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100"
        >
          <option value="">Wybierz kategorię</option>

          {Object.entries(CATEGORIES).map(([value, item]) => (
            <option key={value} value={value}>
              {item.icon} {item.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="subcategory"
          className="mb-2 block text-sm font-bold text-slate-700"
        >
          Podkategoria
        </label>

        <select
          id="subcategory"
          name="subcategory"
          required
          disabled={!category}
          value={subcategory}
          onChange={(event) => setSubcategory(event.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900 outline-none transition disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 focus:border-green-600 focus:ring-4 focus:ring-green-100"
        >
          <option value="">
            {category
              ? "Wybierz podkategorię"
              : "Najpierw wybierz kategorię"}
          </option>

          {subcategories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
