"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signUp } from "@/lib/auth-client";

type AuthFormProps = {
  mode: "login" | "register";
  redirectTo?: string;
};

const fieldClassName =
  "mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100";

export default function AuthForm({ mode, redirectTo = "/profil" }: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isRegister = mode === "register";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (isRegister && password.length < 12) {
      setError("Hasło musi mieć co najmniej 12 znaków.");
      setIsSubmitting(false);
      return;
    }

    try {
      const result = isRegister
        ? await signUp.email({
            name: String(formData.get("name") ?? "").trim(),
            email,
            password,
            callbackURL: redirectTo,
          })
        : await signIn.email({ email, password });

      if (result.error) {
        if (!isRegister && result.error.status === 403) {
          setError(
            "Najpierw potwierdź adres e-mail. Wysłaliśmy nowy link na Twoją skrzynkę.",
          );
          return;
        }

        setError(
          result.error.message ??
            (isRegister
              ? "Nie udało się utworzyć konta."
              : "Nieprawidłowy e-mail lub hasło."),
        );
        return;
      }

      if (isRegister) {
        setSuccess(
          "Sprawdź skrzynkę e-mail. Jeśli adres nie był wcześniej użyty, znajdziesz tam link aktywujący konto.",
        );
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("Nie udało się połączyć z serwerem. Spróbuj ponownie.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 space-y-5 rounded-[32px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8"
    >
      {isRegister && (
        <div>
          <label htmlFor="name" className="text-sm font-bold text-slate-700">
            Imię i nazwisko
          </label>
          <input
            id="name"
            name="name"
            autoComplete="name"
            required
            minLength={2}
            className={fieldClassName}
            placeholder="Anna Kowalska"
          />
        </div>
      )}

      <div>
        <label htmlFor="email" className="text-sm font-bold text-slate-700">
          Adres e-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={fieldClassName}
          placeholder="anna@example.com"
        />
      </div>

      <div>
        <div className="flex items-center justify-between gap-4">
          <label htmlFor="password" className="text-sm font-bold text-slate-700">
            Hasło
          </label>
          {!isRegister && (
            <Link
              href="/nie-pamietam-hasla"
              className="text-sm font-bold text-green-700 hover:underline"
            >
              Nie pamiętasz hasła?
            </Link>
          )}
        </div>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={isRegister ? "new-password" : "current-password"}
          required
          minLength={isRegister ? 12 : 1}
          maxLength={128}
          className={fieldClassName}
          placeholder={isRegister ? "Minimum 12 znaków" : "Twoje hasło"}
        />
        {isRegister && (
          <p className="mt-2 text-sm text-slate-500">
            Użyj co najmniej 12 znaków. Najbezpieczniejsza będzie długa,
            niepowtarzalna fraza.
          </p>
        )}
      </div>

      {isRegister && (
        <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
          <input
            name="legalAcceptance"
            type="checkbox"
            required
            className="mt-1 h-4 w-4 shrink-0 accent-green-700"
          />
          <span>
            Mam ukończone 18 lat albo — jeśli mam 16–17 lat — zgodę
            przedstawiciela ustawowego na korzystanie z platformy. Akceptuję{" "}
            <Link
              href="/regulamin"
              target="_blank"
              className="font-bold text-green-700 underline"
            >
              Regulamin
            </Link>{" "}
            i potwierdzam zapoznanie się z{" "}
            <Link
              href="/polityka-prywatnosci"
              target="_blank"
              className="font-bold text-green-700 underline"
            >
              Polityką prywatności
            </Link>
            .
          </span>
        </label>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-800"
        >
          {success}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || Boolean(success)}
        className="w-full rounded-2xl bg-green-700 px-6 py-4 font-black text-white transition hover:bg-green-800 disabled:cursor-wait disabled:opacity-60"
      >
        {isSubmitting
          ? "Proszę czekać…"
          : isRegister
            ? "Załóż konto"
            : "Zaloguj się"}
      </button>

      <p className="text-center text-sm text-slate-600">
        {isRegister ? "Masz już konto?" : "Nie masz jeszcze konta?"}{" "}
        <Link
          href={isRegister ? "/logowanie" : "/rejestracja"}
          className="font-bold text-green-700 hover:underline"
        >
          {isRegister ? "Zaloguj się" : "Załóż konto"}
        </Link>
      </p>
    </form>
  );
}
