"use client";

import { useState } from "react";

import { reportContent } from "@/app/zgloszenia/actions";

export default function ReportForm({
  targetType,
  targetId,
  label,
  compact = false,
}: {
  targetType: "profile" | "message" | "review";
  targetId: string | number;
  label: string;
  compact?: boolean;
}) {
  const fieldId = `report-${targetType}-${targetId}`;
  const [reason, setReason] = useState("");

  return (
    <details className="group">
      <summary className="cursor-pointer list-none text-sm font-bold text-slate-500 hover:text-red-700">
        ⚑ {label}
      </summary>
      <form
        action={reportContent}
        className={`mt-3 space-y-3 rounded-2xl border border-red-100 bg-red-50/70 ${
          compact ? "p-3" : "p-4"
        }`}
      >
        <input type="hidden" name="target_type" value={targetType} />
        <input type="hidden" name="target_id" value={targetId} />

        <div>
          <label
            htmlFor={`${fieldId}-reason`}
            className="text-sm font-bold text-slate-700"
          >
            Powód zgłoszenia
          </label>
          <select
            id={`${fieldId}-reason`}
            name="reason"
            required
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900"
          >
            <option value="" disabled>
              Wybierz powód
            </option>
            <option value="spam">Spam</option>
            <option value="harassment">Nękanie lub obrażanie</option>
            <option value="fraud">Podejrzenie oszustwa</option>
            <option value="prohibited">Niedozwolona treść</option>
            <option value="misleading">Treść wprowadza w błąd</option>
            <option value="hate">Mowa nienawiści</option>
            <option value="privacy">Naruszenie prywatności</option>
            <option value="other">Inny problem</option>
          </select>
        </div>

        <div>
          <label
            htmlFor={`${fieldId}-details`}
            className="text-sm font-bold text-slate-700"
          >
            Dodatkowe informacje
          </label>
          <textarea
            id={`${fieldId}-details`}
            name="details"
            rows={compact ? 2 : 3}
            required={reason === "other"}
            minLength={reason === "other" ? 10 : undefined}
            maxLength={1000}
            placeholder="Opisz krótko problem."
            className="mt-1 w-full resize-none rounded-xl border border-slate-300 bg-white p-3 text-slate-900"
          />
          <p className="mt-1 text-xs text-slate-500">
            Przy wyborze „Inny problem” opis jest wymagany.
          </p>
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-red-700 px-4 py-3 text-sm font-bold text-white hover:bg-red-800"
        >
          Wyślij zgłoszenie
        </button>
      </form>
    </details>
  );
}
