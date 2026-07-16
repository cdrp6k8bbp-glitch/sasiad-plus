"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "@/lib/auth-client";

export default function AuthNav() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

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
