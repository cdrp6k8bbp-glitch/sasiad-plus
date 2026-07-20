"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { authClient } from "@/lib/auth-client";

const fieldClassName =
  "mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100";

type ResetPasswordFormProps = {
  token?: string;
  invalidLink: boolean;
};

export default function ResetPasswordForm({ token, invalidLink }: ResetPasswordFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!token) {
      setError("Ten link jest nieprawidłowy lub wygasł.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const passwordConfirmation = String(formData.get("passwordConfirmation") ?? "");

    if (password.length < 12) {
      setError("Hasło musi mieć co najmniej 12 znaków.");
      return;
    }

    if (password !== passwordConfirmation) {
      setError("Podane hasła nie są takie same.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await authClient.resetPassword({ newPassword: password, token });

      if (result.error) {
        setError("Ten link jest nieprawidłowy lub wygasł. Poproś o nowy link.");
        return;
      }

      setIsComplete(true);
    } catch {
      setError("Nie udało się połączyć z serwerem. Spróbuj ponownie.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isComplete) {
    return (
      <div className="mt-8 rounded-[32px] border border-green-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">
        <h2 className="text-xl font-black text-slate-900">Hasło zostało zmienione</h2>
        <p className="mt-3 leading-7 text-slate-600">Możesz teraz zalogować się przy użyciu nowego hasła.</p>
        <Link href="/logowanie" className="mt-6 inline-flex rounded-2xl bg-green-700 px-6 py-3 font-black text-white transition hover:bg-green-800">Przejdź do logowania</Link>
      </div>
    );
  }

  if (invalidLink) {
    return (
      <div className="mt-8 rounded-[32px] border border-red-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">
        <h2 className="text-xl font-black text-slate-900">Link jest nieprawidłowy lub wygasł</h2>
        <p className="mt-3 leading-7 text-slate-600">Link działa tylko raz i jest ważny przez godzinę. Poproś o wysłanie nowego.</p>
        <Link href="/nie-pamietam-hasla" className="mt-6 inline-flex font-bold text-green-700 hover:underline">Wyślij nowy link</Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5 rounded-[32px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">
      <div>
        <label htmlFor="password" className="text-sm font-bold text-slate-700">Nowe hasło</label>
        <input id="password" name="password" type="password" autoComplete="new-password" required minLength={12} maxLength={128} className={fieldClassName} placeholder="Minimum 12 znaków" />
      </div>
      <div>
        <label htmlFor="passwordConfirmation" className="text-sm font-bold text-slate-700">Powtórz nowe hasło</label>
        <input id="passwordConfirmation" name="passwordConfirmation" type="password" autoComplete="new-password" required minLength={12} maxLength={128} className={fieldClassName} />
      </div>
      <p className="text-sm leading-6 text-slate-500">Użyj co najmniej 12 znaków. Najbezpieczniejsza będzie długa, niepowtarzalna fraza.</p>

      {error && (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>
      )}

      <button type="submit" disabled={isSubmitting} className="w-full rounded-2xl bg-green-700 px-6 py-4 font-black text-white transition hover:bg-green-800 disabled:cursor-wait disabled:opacity-60">
        {isSubmitting ? "Zapisywanie…" : "Ustaw nowe hasło"}
      </button>
    </form>
  );
}
