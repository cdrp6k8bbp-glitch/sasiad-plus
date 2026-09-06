"use client";

import Link from "next/link";
import {
  archiveListing,
  confirmListingFreshness,
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
    <div className={compact ? "grid gap-2" : "mt-6 grid gap-3"}>
      <form action={confirmListingFreshness} className="w-full">
        <input type="hidden" name="listing_id" value={listingId} />
        <input
          type="hidden"
          name="return_to"
          value={compact ? "profile" : "listing"}
        />
        <button
          type="submit"
          className={
            compact
              ? "w-full rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm font-bold text-green-800 hover:bg-green-100"
              : "w-full rounded-2xl border border-green-200 bg-green-50 px-6 py-4 font-bold text-green-800 hover:bg-green-100"
          }
        >
          ✓ Oferta nadal aktualna
        </button>
      </form>

      <Link
        href={`/ogloszenie/${listingId}/edytuj`}
        className={
          compact
            ? "w-full rounded-xl bg-green-700 px-3 py-2 text-center text-sm font-bold text-white hover:bg-green-800"
            : "w-full rounded-2xl bg-green-700 px-6 py-4 text-center font-bold text-white hover:bg-green-800"
        }
      >
        ✏️ Edytuj
      </Link>

      <form
        action={archiveListing}
        className="w-full"
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
