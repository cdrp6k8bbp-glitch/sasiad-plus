"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { signOut } from "@/lib/auth-client";

export default function AuthNav({ userName }: { userName: string | null }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    if (!userName) return;

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
  }, [userName]);

  async function handleSignOut() {
    if (isSigningOut) return;

    setIsSigningOut(true);
    const result = await signOut();

    if (result.error) {
      setIsSigningOut(false);
      window.alert("Nie udało się wylogować. Spróbuj ponownie.");
      return;
    }

    window.location.replace("/");
  }

  if (!userName) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/logowanie"
          className="inline-flex min-h-11 items-center rounded-full px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
        >
          Zaloguj się
        </Link>

        <Link
          href="/rejestracja"
          className="hidden min-h-11 items-center rounded-full border border-green-700 px-4 py-2 text-sm font-bold text-green-700 transition hover:bg-green-50 sm:inline-flex"
        >
          Załóż konto
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <Link
        href="/profil#ulubione"
        className="hidden min-h-11 items-center rounded-full px-3 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50 lg:inline-flex"
      >
        ♥ Ulubione
      </Link>

      <Link
        href="/profil#rezerwacje"
        className="hidden min-h-11 items-center rounded-full px-3 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-50 xl:inline-flex"
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
        className="relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-full px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
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
        className="relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-full px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
      >
        <span aria-hidden="true" className="md:hidden">💬</span>
        <span className="hidden md:inline">Wiadomości</span>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-black text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Link>

      <details className="group relative sm:hidden">
        <summary className="flex min-h-11 cursor-pointer list-none items-center gap-1 rounded-full bg-green-50 px-3 py-2 text-sm font-bold text-green-800 transition hover:bg-green-100 [&::-webkit-details-marker]:hidden">
          Konto
          <span aria-hidden="true" className="transition group-open:rotate-180">⌄</span>
        </summary>

        <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
          <p className="truncate border-b border-slate-100 px-3 py-2 text-sm font-bold text-slate-900">
            {userName}
          </p>
          <Link href="/profil" className="flex min-h-11 items-center rounded-xl px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
            Mój profil
          </Link>
          <Link href="/profil#ulubione" className="flex min-h-11 items-center rounded-xl px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
            Ulubione
          </Link>
          <Link href="/profil#rezerwacje" className="flex min-h-11 items-center rounded-xl px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
            Rezerwacje
          </Link>
          <button
            type="button"
            disabled={isSigningOut}
            onClick={handleSignOut}
            className="flex min-h-11 w-full items-center rounded-xl px-3 py-2 text-left text-sm font-bold text-red-700 hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
          >
            {isSigningOut ? "Wylogowywanie…" : "Wyloguj"}
          </button>
        </div>
      </details>

      <div className="hidden items-center gap-2 sm:flex">
        <Link
          href="/profil"
          className="inline-flex min-h-11 max-w-36 items-center truncate rounded-full bg-green-50 px-4 py-2 text-sm font-bold text-green-800 transition hover:bg-green-100"
        >
          {userName}
        </Link>

        <button
          type="button"
          disabled={isSigningOut}
          onClick={handleSignOut}
          className="inline-flex min-h-11 items-center rounded-full px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-100 disabled:cursor-wait disabled:opacity-60"
        >
          {isSigningOut ? "Wylogowywanie…" : "Wyloguj"}
        </button>
      </div>
    </div>
  );
}
