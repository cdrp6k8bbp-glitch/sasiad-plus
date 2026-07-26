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
    <form
      action={moderateReport}
      onSubmit={(event) => {
        const submitter = (event.nativeEvent as SubmitEvent)
          .submitter as HTMLButtonElement | null;

        if (
          submitter?.value === "archive" &&
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
      <label
        htmlFor={`listing-justification-${reportId}`}
        className="text-sm font-bold text-slate-700"
      >
        Uzasadnienie decyzji
      </label>
      <textarea
        id={`listing-justification-${reportId}`}
        name="justification"
        required
        minLength={10}
        maxLength={1000}
        rows={3}
        placeholder="Napisz, co zostało sprawdzone i dlaczego podejmujesz tę decyzję."
        className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 leading-6 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
      />
      <p className="mt-2 text-xs text-slate-500">
        Uzasadnienie zobaczą osoba zgłaszająca i właściciel ogłoszenia.
      </p>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <button
          type="submit"
          name="moderation_action"
          value="review"
          className="w-full rounded-xl bg-green-700 px-4 py-3 text-sm font-bold text-white hover:bg-green-800"
        >
          ✓ Zapisz jako sprawdzone
        </button>
        <button
          type="submit"
          name="moderation_action"
          value="dismiss"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
        >
          Odrzuć zgłoszenie
        </button>
        <button
          type="submit"
          name="moderation_action"
          value="archive"
          disabled={listingArchived}
          className="w-full rounded-xl bg-red-700 px-4 py-3 text-sm font-bold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {listingArchived ? "Już zarchiwizowane" : "Archiwizuj ogłoszenie"}
        </button>
      </div>
    </form>
  );
}
