"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { authClient } from "@/lib/auth-client";
import {
  EMAIL_VERIFICATION_CALLBACK_URL,
  EMAIL_VERIFICATION_RESEND_DELAY_SECONDS,
  EMAIL_VERIFICATION_STORAGE_KEY,
  getWebmailUrl,
  maskEmail,
} from "@/lib/email-verification";

export default function VerificationPending() {
  const [email, setEmail] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(
    EMAIL_VERIFICATION_RESEND_DELAY_SECONDS,
  );
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setEmail(
        window.sessionStorage.getItem(EMAIL_VERIFICATION_STORAGE_KEY) ?? "",
      );
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1_000);

    return () => window.clearInterval(intervalId);
  }, [secondsLeft]);

  const webmailUrl = useMemo(() => getWebmailUrl(email), [email]);

  async function resendVerificationEmail() {
    if (!email || secondsLeft > 0 || isSending) {
      return;
    }

    setIsSending(true);
    setMessage(null);
    setError(null);

    const result = await authClient.sendVerificationEmail({
      email,
      callbackURL: EMAIL_VERIFICATION_CALLBACK_URL,
    });

    if (result.error) {
      setError(
        result.error.status === 429
          ? "Link był wysyłany zbyt często. Odczekaj chwilę i spróbuj ponownie."
          : "Nie udało się wysłać linku. Spróbuj ponownie za chwilę.",
      );
    } else {
      setMessage("Nowy link aktywacyjny został wysłany.");
      setSecondsLeft(EMAIL_VERIFICATION_RESEND_DELAY_SECONDS);
    }

    setIsSending(false);
  }

  function correctEmail() {
    window.sessionStorage.removeItem(EMAIL_VERIFICATION_STORAGE_KEY);
  }

  return (
    <div className="mt-8 rounded-[32px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
        ✉️
      </div>

      <h1 className="mt-6 text-center text-3xl font-black tracking-tight">
        Sprawdź skrzynkę e-mail
      </h1>
      <p className="mt-3 text-center leading-7 text-slate-600">
        Wysłaliśmy link aktywacyjny
        {email ? (
          <>
            {" "}na <strong className="text-slate-900">{maskEmail(email)}</strong>
          </>
        ) : null}
        . Kliknij go, aby potwierdzić adres i dokończyć tworzenie profilu.
      </p>

      <ol className="mt-6 space-y-3 rounded-2xl bg-slate-50 p-5 text-sm leading-6 text-slate-700">
        <li><strong>1.</strong> Otwórz wiadomość od Sąsiad+.</li>
        <li><strong>2.</strong> Kliknij „Potwierdź adres e-mail”.</li>
        <li><strong>3.</strong> Wrócisz do aplikacji i uzupełnisz profil.</li>
      </ol>

      <p className="mt-5 text-sm leading-6 text-slate-500">
        Nie widzisz wiadomości? Sprawdź folder Spam lub Oferty. Dostarczenie
        może potrwać kilka minut.
      </p>

      {message && (
        <p role="status" className="mt-4 rounded-2xl bg-green-50 p-4 text-sm font-bold text-green-800">
          {message}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-4 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">
          {error}
        </p>
      )}

      <div className="mt-6 grid gap-3">
        {webmailUrl && (
          <a
            href={webmailUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl bg-green-700 px-6 py-4 text-center font-black text-white hover:bg-green-800"
          >
            Otwórz skrzynkę e-mail
          </a>
        )}

        <button
          type="button"
          onClick={resendVerificationEmail}
          disabled={!email || secondsLeft > 0 || isSending}
          className="rounded-2xl border border-green-700 bg-white px-6 py-4 font-black text-green-700 hover:bg-green-50 disabled:cursor-wait disabled:border-slate-300 disabled:text-slate-400"
        >
          {isSending
            ? "Wysyłamy…"
            : secondsLeft > 0
              ? `Wyślij link ponownie za ${secondsLeft} s`
              : "Wyślij link ponownie"}
        </button>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-3 text-sm font-bold">
        <Link href="/rejestracja" onClick={correctEmail} className="text-green-700 hover:underline">
          Popraw adres e-mail
        </Link>
        <Link href="/logowanie" className="text-slate-600 hover:underline">
          Przejdź do logowania
        </Link>
      </div>
    </div>
  );
}
