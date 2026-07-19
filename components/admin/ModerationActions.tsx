"use client";

import { moderateReport } from "@/app/admin/actions";

export default function ModerationActions({
  reportId,
  currentFilter,
  listingArchived,
}: {
  reportId: number;
  currentFilter: string;
  listingArchived: boolean;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      <form action={moderateReport}>
        <input type="hidden" name="report_id" value={reportId} />
        <input type="hidden" name="filter" value={currentFilter} />
        <button
          type="submit"
          name="moderation_action"
          value="review"
          className="w-full rounded-xl bg-green-700 px-4 py-3 text-sm font-bold text-white hover:bg-green-800"
        >
          ✓ Sprawdzone
        </button>
      </form>

      <form action={moderateReport}>
        <input type="hidden" name="report_id" value={reportId} />
        <input type="hidden" name="filter" value={currentFilter} />
        <button
          type="submit"
          name="moderation_action"
          value="dismiss"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
        >
          Odrzuć zgłoszenie
        </button>
      </form>

      <form
        action={moderateReport}
        onSubmit={(event) => {
          if (
            !window.confirm(
              "Czy na pewno zarchiwizować to ogłoszenie? Przestanie być widoczne w wynikach.",
            )
          ) {
            event.preventDefault();
          }
        }}
      >
        <input type="hidden" name="report_id" value={reportId} />
        <input type="hidden" name="filter" value={currentFilter} />
        <button
          type="submit"
          name="moderation_action"
          value="archive"
          disabled={listingArchived}
          className="w-full rounded-xl bg-red-700 px-4 py-3 text-sm font-bold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {listingArchived ? "Już zarchiwizowane" : "Archiwizuj ogłoszenie"}
        </button>
      </form>
    </div>
  );
}
