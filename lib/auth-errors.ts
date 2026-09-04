export const ACCOUNT_ALREADY_EXISTS_ERROR_CODE = "ACCOUNT_ALREADY_EXISTS";

export const ACCOUNT_ALREADY_EXISTS_ERROR_MESSAGE =
  "Konto z tym adresem e-mail już istnieje.";

export const EMAIL_NOT_VERIFIED_ERROR_CODE = "EMAIL_NOT_VERIFIED";

type AuthError = {
  code?: string;
  message?: string;
  status?: number;
};

export function getLoginErrorMessage(error: AuthError) {
  if (error.code === EMAIL_NOT_VERIFIED_ERROR_CODE) {
    return "Najpierw potwierdź adres e-mail. Wysłaliśmy nowy link na Twoją skrzynkę.";
  }

  if (error.status === 403) {
    return "Nie udało się zalogować. Spróbuj ponownie za chwilę.";
  }

  return error.message ?? "Nieprawidłowy e-mail lub hasło.";
}
