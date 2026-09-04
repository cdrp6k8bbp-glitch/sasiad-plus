import { describe, expect, test } from "vitest";
import {
  EMAIL_NOT_VERIFIED_ERROR_CODE,
  getLoginErrorMessage,
} from "@/lib/auth-errors";

describe("komunikaty logowania", () => {
  test("prosi o weryfikację tylko przy właściwym kodzie błędu", () => {
    expect(
      getLoginErrorMessage({
        code: EMAIL_NOT_VERIFIED_ERROR_CODE,
        status: 403,
      }),
    ).toContain("potwierdź adres e-mail");
  });

  test("nie myli innego błędu 403 z niepotwierdzonym adresem", () => {
    const message = getLoginErrorMessage({
      code: "FORBIDDEN",
      status: 403,
    });

    expect(message).not.toContain("potwierdź adres e-mail");
    expect(message).toBe(
      "Nie udało się zalogować. Spróbuj ponownie za chwilę.",
    );
  });
});
