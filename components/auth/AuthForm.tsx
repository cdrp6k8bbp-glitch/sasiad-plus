"use client";

import Link from "next/link";
import { FormEvent, useCallback, useState } from "react";
import { signIn, signUp } from "@/lib/auth-client";
import TurnstileWidget, {
  resetTurnstile,
  TURNSTILE_ERROR_CODE,
} from "@/components/auth/TurnstileWidget";
import {
  LEGAL_ACCEPTANCE_ERROR_CODE,
  PRIVACY_POLICY_VERSION,
  TERMS_VERSION,
} from "@/lib/legal";
import {
  ACCOUNT_ALREADY_EXISTS_ERROR_CODE,
  ACCOUNT_ALREADY_EXISTS_ERROR_MESSAGE,
  getLoginErrorMessage,
} from "@/lib/auth-errors";
import {
  EMAIL_VERIFICATION_CALLBACK_URL,
  EMAIL_VERIFICATION_STORAGE_KEY,
  normalizeEmail,
} from "@/lib/email-verification";

type AuthFormProps = {
  mode: "login" | "register";
  redirectTo?: string;
};

const fieldClassName =
  "mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100";

export default function AuthForm({ mode, redirectTo = "/profil" }: AuthFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [accountAlreadyExists, setAccountAlreadyExists] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const isRegister = mode === "register";

  const handleTurnstileTokenChange = useCallback((token: string | null) => {
    setTurnstileToken(token);
    if (token) {
      setError((currentError) =>
        currentError === "Zabezpieczenie jeszcze się przygotowuje."
          ? null
          : currentError,
      );
    }
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setAccountAlreadyExists(false);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const legalAcceptance = formData.get("legalAcceptance") === "on";
    if (!turnstileToken) {
      setError("Zabezpieczenie jeszcze się przygotowuje.");
      setIsSubmitting(false);
      return;
    }

    if (isRegister && password.length < 12) {
      setError("Hasło musi mieć co najmniej 12 znaków.");
      setIsSubmitting(false);
      return;
    }

    const requestController = new AbortController();
    const requestTimeoutId = window.setTimeout(
      () => requestController.abort(),
      15_000,
    );

    try {
      const registrationPayload = {
        name: String(formData.get("name") ?? "").trim(),
        email,
        password,
        legalAcceptance,
        termsAcceptedVersion: TERMS_VERSION,
        privacyAcknowledgedVersion: PRIVACY_POLICY_VERSION,
        callbackURL: EMAIL_VERIFICATION_CALLBACK_URL,
        fetchOptions: {
          headers: { "x-turnstile-token": turnstileToken },
          signal: requestController.signal,
        },
      };

      const result = isRegister
        ? await signUp.email(registrationPayload)
        : await signIn.email({
            email,
            password,
            fetchOptions: {
              headers: { "x-turnstile-token": turnstileToken },
              signal: requestController.signal,
            },
          });

      if (result.error) {
        if (result.error.code === ACCOUNT_ALREADY_EXISTS_ERROR_CODE) {
          setAccountAlreadyExists(true);
          return;
        }

        if (result.error.code === LEGAL_ACCEPTANCE_ERROR_CODE) {
          setError(
            "Aby założyć konto, zaakceptuj regulamin i potwierdź zapoznanie się z polityką prywatności.",
          );
          return;
        }

        if (result.error.code === TURNSTILE_ERROR_CODE) {
          setError(
            "Weryfikacja bezpieczeństwa nie powiodła się. Spróbuj ponownie.",
          );
          return;
        }

        if (!isRegister) {
          setError(getLoginErrorMessage(result.error));
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
        window.sessionStorage.setItem(
          EMAIL_VERIFICATION_STORAGE_KEY,
          normalizeEmail(email),
        );
        window.location.assign("/sprawdz-email");
        return;
      }

      window.location.assign(redirectTo);
    } catch (caughtError) {
      if (
        caughtError instanceof DOMException &&
        caughtError.name === "AbortError"
      ) {
        setError(
          "Logowanie trwało zbyt długo. Odśwież stronę i spróbuj ponownie za chwilę.",
        );
      } else {
        setError("Nie udało się połączyć z serwerem. Spróbuj ponownie.");
      }
    } finally {
      window.clearTimeout(requestTimeoutId);
      setTurnstileToken(null);
      resetTurnstile();
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

      <TurnstileWidget onTokenChange={handleTurnstileTokenChange} />

      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700"
        >
          {error}
        </div>
      )}

      {accountAlreadyExists && (
        <div
          role="alert"
          className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950"
        >
          <p className="font-bold">{ACCOUNT_ALREADY_EXISTS_ERROR_MESSAGE}</p>
          <p className="mt-1">Zaloguj się albo ustaw nowe hasło.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/logowanie"
              className="rounded-xl bg-green-700 px-4 py-2 font-bold text-white hover:bg-green-800"
            >
              Zaloguj się
            </Link>
            <Link
              href="/nie-pamietam-hasla"
              className="rounded-xl border border-amber-400 bg-white px-4 py-2 font-bold text-amber-950 hover:bg-amber-100"
            >
              Ustaw nowe hasło
            </Link>
          </div>
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
        disabled={isSubmitting || Boolean(success) || !turnstileToken}
        className="w-full rounded-2xl bg-green-700 px-6 py-4 font-black text-white transition hover:bg-green-800 disabled:cursor-wait disabled:opacity-60"
      >
        {isSubmitting
          ? isRegister
            ? "Zakładamy konto…"
            : "Logujemy…"
          : !turnstileToken
            ? "Przygotowuję formularz…"
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
