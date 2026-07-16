"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { setFavorite } from "@/app/ulubione/actions";

export default function FavoriteButton({
  listingId,
  initialIsFavorite = false,
  wide = false,
}: {
  listingId: number;
  initialIsFavorite?: boolean;
  wide?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending: isSessionPending } = useSession();
  const [isFavorite, setIsFavoriteState] = useState(initialIsFavorite);
  const [isSaving, startTransition] = useTransition();

  function handleClick() {
    if (isSessionPending) return;

    if (!session) {
      router.push(`/logowanie?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    const nextIsFavorite = !isFavorite;
    setIsFavoriteState(nextIsFavorite);

    startTransition(async () => {
      try {
        const savedState = await setFavorite(listingId, nextIsFavorite);
        setIsFavoriteState(savedState);
        router.refresh();
      } catch {
        setIsFavoriteState(!nextIsFavorite);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isSaving || isSessionPending}
      aria-label={
        isFavorite ? "Usuń z ulubionych" : "Dodaj do ulubionych"
      }
      aria-pressed={isFavorite}
      className={
        wide
          ? `mt-3 w-full rounded-2xl border px-6 py-4 font-bold transition disabled:opacity-60 ${
              isFavorite
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-slate-200 text-slate-700 hover:bg-slate-50"
            }`
          : `absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-xl shadow transition hover:scale-105 disabled:opacity-60 ${
              isFavorite ? "text-red-600" : "text-slate-700"
            }`
      }
    >
      {wide ? (isFavorite ? "♥ Zapisano w ulubionych" : "♡ Dodaj do ulubionych") : isFavorite ? "♥" : "♡"}
    </button>
  );
}
