import { beforeAll, describe, expect, test } from "vitest";
import { getTestInstance } from "better-auth/test";
import {
  createAuthBeforeHook,
  EMAIL_PASSWORD_POLICY,
  EMAIL_VERIFICATION_POLICY,
  LEGAL_USER_FIELDS,
} from "@/lib/auth-policy";
import {
  LEGAL_ACCEPTANCE_ERROR_CODE,
  PRIVACY_POLICY_VERSION,
  TERMS_VERSION,
} from "@/lib/legal";
import { ACCOUNT_ALREADY_EXISTS_ERROR_CODE } from "@/lib/auth-errors";

const baseURL = "http://localhost:3210";

async function createTestAuth() {
  return getTestInstance(
    {
      hooks: {
        before: createAuthBeforeHook({
          verifyTurnstile: async () => true,
        }),
      },
      user: {
        additionalFields: LEGAL_USER_FIELDS,
      },
      emailAndPassword: {
        ...EMAIL_PASSWORD_POLICY,
        sendResetPassword: async () => {},
      },
      emailVerification: {
        ...EMAIL_VERIFICATION_POLICY,
        sendVerificationEmail: async () => {},
      },
      rateLimit: {
        enabled: false,
      },
    },
    {
      port: 3210,
      disableTestUser: true,
    },
  );
}

describe("rejestracja i logowanie", () => {
  let testAuth: Awaited<ReturnType<typeof createTestAuth>>;

  beforeAll(async () => {
    testAuth = await createTestAuth();
  });

  async function authRequest(path: string, body: Record<string, unknown>) {
    return testAuth.customFetchImpl(`${baseURL}/api/auth${path}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "cf-connecting-ip": "127.0.0.1",
      },
      body: JSON.stringify(body),
    });
  }

  test("odrzuca rejestrację bez akceptacji dokumentów prawnych", async () => {
    const response = await authRequest("/sign-up/email", {
      name: "Anna Testowa",
      email: "brak-zgody@example.com",
      password: "BardzoDobreHaslo123!",
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      code: LEGAL_ACCEPTANCE_ERROR_CODE,
    });
  });

  test("odrzuca hasło krótsze niż 12 znaków", async () => {
    const response = await authRequest("/sign-up/email", {
      name: "Anna Testowa",
      email: "krotkie-haslo@example.com",
      password: "ZaKrotkie1",
      legalAcceptance: true,
    });

    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  test("zapisuje wersje dokumentów przy poprawnej rejestracji", async () => {
    const response = await authRequest("/sign-up/email", {
      name: "Anna Testowa",
      email: "anna@example.com",
      password: "BardzoDobreHaslo123!",
      legalAcceptance: true,
    });

    expect(response.status).toBe(200);

    const user = await testAuth.db.findOne<{
      termsAcceptedVersion: string;
      privacyAcknowledgedVersion: string;
      legalAcceptedAt: Date | string | null;
    }>({
      model: "user",
      where: [{ field: "email", value: "anna@example.com" }],
    });

    expect(user).toMatchObject({
      termsAcceptedVersion: TERMS_VERSION,
      privacyAcknowledgedVersion: PRIVACY_POLICY_VERSION,
    });
    expect(user?.legalAcceptedAt).toBeTruthy();
  });

  test("informuje, że konto z podanym adresem już istnieje", async () => {
    const response = await authRequest("/sign-up/email", {
      name: "Inna Anna",
      email: "anna@example.com",
      password: "InneBardzoDobreHaslo123!",
      legalAcceptance: true,
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      code: ACCOUNT_ALREADY_EXISTS_ERROR_CODE,
    });
  });

  test("blokuje logowanie przed weryfikacją e-maila i wpuszcza po niej", async () => {
    const beforeVerification = await authRequest("/sign-in/email", {
      email: "anna@example.com",
      password: "BardzoDobreHaslo123!",
    });
    expect(beforeVerification.status).toBe(403);

    await testAuth.db.update({
      model: "user",
      where: [{ field: "email", value: "anna@example.com" }],
      update: { emailVerified: true },
    });

    const afterVerification = await authRequest("/sign-in/email", {
      email: "anna@example.com",
      password: "BardzoDobreHaslo123!",
    });
    expect(afterVerification.status).toBe(200);
    await expect(afterVerification.json()).resolves.toMatchObject({
      user: { email: "anna@example.com" },
    });
  });
});
