"use client";

import { FormEvent, useState } from "react";
import { authClient } from "@/lib/auth-client";

const fieldClassName =
  "mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100";

export default function SecurityForm() {
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [sessionMessage, setSessionMessage] = useState<string | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isRevokingSessions, setIsRevokingSessions] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  async function handlePasswordChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordError(null);
    setPasswordMessage(null);

    const form = event.currentTarget;
    const data = new FormData(form);
    const currentPassword = String(data.get("currentPassword") ?? "");
    const newPassword = String(data.get("newPassword") ?? "");
    const confirmPassword = String(data.get("confirmPassword") ?? "");

    if (newPassword.length < 12) {
      setPasswordError("Nowe hasło musi mieć co najmniej 12 znaków.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Nowe hasła nie są takie same.");
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError("Nowe hasło musi różnić się od obecnego.");
      return;
    }

    setIsChangingPassword(true);
    try {
      const result = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });

      if (result.error) {
        setPasswordError(
          result.error.status === 429
            ? "Za dużo prób. Odczekaj kilka minut i spróbuj ponownie."
            : "Nie udało się zmienić hasła. Sprawdź obecne hasło.",
        );
        return;
      }

      form.reset();
      setPasswordMessage(
        "Hasło zostało zmienione, a pozostałe urządzenia wylogowane.",
      );
    } catch {
      setPasswordError("Nie udało się połączyć z serwerem. Spróbuj ponownie.");
    } finally {
      setIsChangingPassword(false);
    }
  }

  async function handleRevokeSessions() {
    setSessionError(null);
    setSessionMessage(null);
    setIsRevokingSessions(true);

    try {
      const result = await authClient.revokeOtherSessions();
      if (result.error) {
        setSessionError("Nie udało się wylogować innych urządzeń.");
        return;
      }
      setSessionMessage("Pozostałe urządzenia zostały wylogowane.");
    } catch {
      setSessionError("Nie udało się połączyć z serwerem. Spróbuj ponownie.");
    } finally {
      setIsRevokingSessions(false);
    }
  }

  async function handleDeleteAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDeleteError(null);

    const data = new FormData(event.currentTarget);
    const password = String(data.get("deletePassword") ?? "");
    const confirmation = String(data.get("deleteConfirmation") ?? "").trim();

    if (confirmation !== "USUŃ KONTO") {
      setDeleteError('Wpisz dokładnie „USUŃ KONTO”, aby potwierdzić.');
      return;
    }

    setIsDeletingAccount(true);
    try {
      const result = await authClient.deleteUser({ password });
      if (result.error) {
        setDeleteError(
          result.error.status === 429
            ? "Za dużo prób. Odczekaj kilka minut i spróbuj ponownie."
            : "Nie udało się usunąć konta. Sprawdź hasło i spróbuj ponownie.",
        );
        return;
      }

      window.location.assign("/?konto=usuniete");
    } catch {
      setDeleteError("Nie udało się połączyć z serwerem. Spróbuj ponownie.");
    } finally {
      setIsDeletingAccount(false);
    }
  }

  return (
    <div className="mt-8 space-y-6">
      <form
        onSubmit={handlePasswordChange}
        className="rounded-[28px] border border-slate-200 p-5 sm:p-6"
      >
        <h2 className="text-2xl font-black">Zmień hasło</h2>
        <p className="mt-2 text-slate-500">
          Po zmianie hasła wszystkie pozostałe urządzenia zostaną wylogowane.
        </p>

        <div className="mt-6 space-y-5">
          <div>
            <label htmlFor="currentPassword" className="font-bold">
              Obecne hasło
            </label>
            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              required
              className={fieldClassName}
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="font-bold">
              Nowe hasło
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={12}
              maxLength={128}
              className={fieldClassName}
            />
            <p className="mt-2 text-sm text-slate-500">
              Co najmniej 12 znaków. Nie używaj hasła z innego serwisu.
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="font-bold">
              Powtórz nowe hasło
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={12}
              maxLength={128}
              className={fieldClassName}
            />
          </div>
        </div>

        {passwordError && (
          <p role="alert" className="mt-5 rounded-2xl bg-red-50 p-4 font-semibold text-red-700">
            {passwordError}
          </p>
        )}
        {passwordMessage && (
          <p role="status" className="mt-5 rounded-2xl bg-green-50 p-4 font-semibold text-green-800">
            ✓ {passwordMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={isChangingPassword}
          className="mt-6 rounded-full bg-green-700 px-6 py-3 font-bold text-white transition hover:bg-green-800 disabled:cursor-wait disabled:opacity-60"
        >
          {isChangingPassword ? "Zmieniam hasło…" : "Zmień hasło"}
        </button>
      </form>

      <section className="rounded-[28px] border border-slate-200 p-5 sm:p-6">
        <h2 className="text-2xl font-black">Zalogowane urządzenia</h2>
        <p className="mt-2 leading-7 text-slate-500">
          Jeśli korzystano z konta na obcym urządzeniu albo coś wzbudza Twoje
          podejrzenia, zakończ wszystkie sesje poza tą obecną.
        </p>

        {sessionError && (
          <p role="alert" className="mt-5 rounded-2xl bg-red-50 p-4 font-semibold text-red-700">
            {sessionError}
          </p>
        )}
        {sessionMessage && (
          <p role="status" className="mt-5 rounded-2xl bg-green-50 p-4 font-semibold text-green-800">
            ✓ {sessionMessage}
          </p>
        )}

        <button
          type="button"
          onClick={handleRevokeSessions}
          disabled={isRevokingSessions}
          className="mt-6 rounded-full border border-red-300 px-6 py-3 font-bold text-red-700 transition hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
        >
          {isRevokingSessions ? "Wylogowuję…" : "Wyloguj inne urządzenia"}
        </button>
      </section>

      <form
        onSubmit={handleDeleteAccount}
        className="rounded-[28px] border border-red-200 bg-red-50/50 p-5 sm:p-6"
      >
        <h2 className="text-2xl font-black text-red-800">Usuń konto</h2>
        <p className="mt-2 leading-7 text-slate-600">
          Ta operacja jest nieodwracalna. Usuniemy profil, ogłoszenia, zdjęcia,
          rozmowy, rezerwacje, opinie, ulubione i powiadomienia.
        </p>

        <div className="mt-6 space-y-5">
          <div>
            <label htmlFor="deletePassword" className="font-bold">
              Obecne hasło
            </label>
            <input
              id="deletePassword"
              name="deletePassword"
              type="password"
              autoComplete="current-password"
              required
              className={fieldClassName}
            />
          </div>

          <div>
            <label htmlFor="deleteConfirmation" className="font-bold">
              Wpisz USUŃ KONTO
            </label>
            <input
              id="deleteConfirmation"
              name="deleteConfirmation"
              required
              autoComplete="off"
              className={fieldClassName}
            />
          </div>
        </div>

        {deleteError && (
          <p
            role="alert"
            className="mt-5 rounded-2xl border border-red-200 bg-white p-4 font-semibold text-red-700"
          >
            {deleteError}
          </p>
        )}

        <button
          type="submit"
          disabled={isDeletingAccount}
          className="mt-6 rounded-full bg-red-700 px-6 py-3 font-bold text-white transition hover:bg-red-800 disabled:cursor-wait disabled:opacity-60"
        >
          {isDeletingAccount ? "Usuwam konto…" : "Usuń konto bezpowrotnie"}
        </button>
      </form>
    </div>
  );
}
