"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { authClient } from "@/lib/auth-client";
import TurnstileWidget, {
  resetTurnstile,
  TURNSTILE_ERROR_CODE,
} from "@/components/auth/TurnstileWidget";

const fieldClassName =
  "mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100";

export default function ForgotPasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const turnstileToken = String(
      formData.get("cf-turnstile-response") ?? "",
    ).trim();

    if (!turnstileToken) {
      setError("Poczekaj na zakończenie weryfikacji bezpieczeństwa.");
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await authClient.requestPasswordReset({
        email,
        redirectTo: "/reset-hasla",
        fetchOptions: {
          headers: { "x-turnstile-token": turnstileToken },
        },
      });

      if (result.error?.code === TURNSTILE_ERROR_CODE) {
        setError(
          "Weryfikacja bezpieczeństwa nie powiodła się. Spróbuj ponownie.",
        );
        return;
      }

      setIsComplete(true);
    } catch {
      // Pokazujemy tę samą odpowiedź, niezależnie od istnienia konta.
      setIsComplete(true);
    } finally {
      resetTurnstile();
      setIsSubmitting(false);
    }
  }

  if (isComplete) {
    return (
      <div className="mt-8 rounded-[32px] border border-green-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">
        <h2 className="text-xl font-black text-slate-900">Sprawdź swoją pocztę</h2>
        <p className="mt-3 leading-7 text-slate-600">
          Jeśli podany adres jest przypisany do konta, wysłaliśmy na niego link do ustawienia nowego hasła. Sprawdź też folder spam.
        </p>
        <Link href="/logowanie" className="mt-6 inline-flex font-bold text-green-700 hover:underline">
          Wróć do logowania
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5 rounded-[32px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">
      <div>
        <label htmlFor="email" className="text-sm font-bold text-slate-700">Adres e-mail</label>
        <input id="email" name="email" type="email" autoComplete="email" required className={fieldClassName} placeholder="anna@example.com" />
      </div>

      <TurnstileWidget />

      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700"
        >
          {error}
        </div>
      )}

      <button type="submit" disabled={isSubmitting} className="w-full rounded-2xl bg-green-700 px-6 py-4 font-black text-white transition hover:bg-green-800 disabled:cursor-wait disabled:opacity-60">
        {isSubmitting ? "Wysyłanie…" : "Wyślij link do zmiany hasła"}
      </button>

      <p className="text-center text-sm text-slate-600">
        <Link href="/logowanie" className="font-bold text-green-700 hover:underline">Wróć do logowania</Link>
      </p>
    </form>
  );
}
