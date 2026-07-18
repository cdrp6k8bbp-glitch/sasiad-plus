"use client";

import Link from "next/link";
import {
  archiveListing,
  restoreListing,
} from "@/app/ogloszenie/actions";

export default function ListingOwnerActions({
  listingId,
  compact = false,
  isArchived = false,
}: {
  listingId: number;
  compact?: boolean;
  isArchived?: boolean;
}) {
  if (isArchived) {
    return (
      <form action={restoreListing} className={compact ? "w-full" : "mt-6 w-full"}>
        <input type="hidden" name="listing_id" value={listingId} />
        <button
          type="submit"
          className={
            compact
              ? "w-full rounded-xl bg-green-700 px-3 py-2 text-sm font-bold text-white hover:bg-green-800"
              : "w-full rounded-2xl bg-green-700 px-6 py-4 font-bold text-white hover:bg-green-800"
          }
        >
          ↩️ Przywróć ogłoszenie
        </button>
      </form>
    );
  }

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
        action={archiveListing}
        className={compact ? "flex-1" : "w-full"}
        onSubmit={(event) => {
          if (!window.confirm("Czy przenieść to ogłoszenie do archiwum? Możesz je później przywrócić.")) {
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
          📦 Archiwizuj
        </button>
      </form>
    </div>
  );
}
