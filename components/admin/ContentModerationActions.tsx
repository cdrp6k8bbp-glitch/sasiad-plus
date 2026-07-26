import { moderateContentReport } from "@/app/admin/actions";

export default function ContentModerationActions({
  reportId,
  currentFilter,
}: {
  reportId: number;
  currentFilter: string;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <form action={moderateContentReport}>
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

      <form action={moderateContentReport}>
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
    </div>
  );
}
