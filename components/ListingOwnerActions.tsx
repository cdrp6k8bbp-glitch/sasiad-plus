"use client";

import Link from "next/link";
import { deleteListing } from "@/app/ogloszenie/actions";

export default function ListingOwnerActions({
  listingId,
  compact = false,
}: {
  listingId: number;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "flex gap-2" : "mt-6 grid gap-3"}>
      <Link
        href={`/ogloszenie/${listingId}/edytuj`}
        className={
          compact
            ? "flex-1 rounded-xl bg-green-700 px-3 py-2 text-center text-sm font-bold text-white hover:bg-green-800"
            : "w-full rounded-2xl bg-green-700 px-6 py-4 text-center font-bold text-white hover:bg-green-800"
        }
      >
        ✏️ Edytuj
      </Link>

      <form
        action={deleteListing}
        className={compact ? "flex-1" : "w-full"}
        onSubmit={(event) => {
          if (!window.confirm("Czy na pewno chcesz usunąć to ogłoszenie? Tej operacji nie można cofnąć.")) {
            event.preventDefault();
          }
        }}
      >
        <input type="hidden" name="listing_id" value={listingId} />
        <button
          type="submit"
          className={
            compact
              ? "w-full rounded-xl border border-red-200 px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-50"
              : "w-full rounded-2xl border border-red-200 px-6 py-4 font-bold text-red-700 hover:bg-red-50"
          }
        >
          🗑️ Usuń
        </button>
      </form>
    </div>
  );
}
