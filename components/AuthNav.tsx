"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "@/lib/auth-client";

export default function AuthNav() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    if (!session) return;

    let isActive = true;

    async function loadUnreadCount() {
      try {
        const [messagesResponse, notificationsResponse] = await Promise.all([
          fetch("/api/unread-messages", { cache: "no-store" }),
          fetch("/api/unread-notifications", { cache: "no-store" }),
        ]);

        if (messagesResponse.ok) {
          const result = (await messagesResponse.json()) as { unreadCount?: number };
          if (isActive && typeof result.unreadCount === "number") {
            setUnreadCount(result.unreadCount);
          }
        }

        if (notificationsResponse.ok) {
          const result = (await notificationsResponse.json()) as {
            unreadCount?: number;
          };
          if (isActive && typeof result.unreadCount === "number") {
            setNotificationCount(result.unreadCount);
          }
        }
      } catch {
        // Brak połączenia nie powinien blokować nawigacji.
      }
    }

    void loadUnreadCount();
    const intervalId = window.setInterval(loadUnreadCount, 30_000);

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
    };
  }, [session]);

  if (isPending) {
    return (
      <span
        aria-label="Sprawdzanie sesji"
        className="h-10 w-24 animate-pulse rounded-full bg-slate-100"
      />
    );
  }

  if (!session) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/logowanie"
          className="rounded-full px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
        >
          Zaloguj się
        </Link>

        <Link
          href="/rejestracja"
          className="hidden rounded-full border border-green-700 px-4 py-2 text-sm font-bold text-green-700 transition hover:bg-green-50 sm:inline-flex"
        >
          Załóż konto
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/profil#ulubione"
        className="hidden rounded-full px-3 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50 lg:inline-flex"
      >
        ♥ Ulubione
      </Link>

      <Link
        href="/profil#rezerwacje"
        className="hidden rounded-full px-3 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-50 xl:inline-flex"
      >
        Rezerwacje
      </Link>

      <Link
        href="/powiadomienia"
        aria-label={
          notificationCount > 0
            ? `Powiadomienia, nieprzeczytane: ${notificationCount}`
            : "Powiadomienia"
        }
        className="relative inline-flex rounded-full px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
      >
        <span aria-hidden="true" className="md:hidden">🔔</span>
        <span className="hidden md:inline">Powiadomienia</span>
        {notificationCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-black text-white">
            {notificationCount > 99 ? "99+" : notificationCount}
          </span>
        )}
      </Link>

      <Link
        href="/wiadomosci"
        aria-label={
          unreadCount > 0
            ? `Wiadomości, nieprzeczytane: ${unreadCount}`
            : "Wiadomości"
        }
        className="relative inline-flex rounded-full px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
      >
        <span aria-hidden="true" className="md:hidden">💬</span>
        <span className="hidden md:inline">Wiadomości</span>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-black text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Link>

      <Link
        href="/profil"
        className="max-w-36 truncate rounded-full bg-green-50 px-4 py-2 text-sm font-bold text-green-800 transition hover:bg-green-100"
      >
        {session.user.name}
      </Link>

      <button
        type="button"
        onClick={async () => {
          await signOut();
          router.push("/");
          router.refresh();
        }}
        className="hidden rounded-full px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-100 sm:inline-flex"
      >
        Wyloguj
      </button>
    </div>
  );
}
