import { APIError, createAuthMiddleware } from "better-auth/api";
import {
  LEGAL_ACCEPTANCE_ERROR_CODE,
  LEGAL_ACCEPTANCE_ERROR_MESSAGE,
  PRIVACY_POLICY_VERSION,
  TERMS_VERSION,
} from "@/lib/legal";
import {
  TURNSTILE_ERROR_CODE,
  TURNSTILE_ERROR_MESSAGE,
} from "@/lib/turnstile";

type VerifyTurnstile = (
  request: Request,
  secret: string | undefined,
) => Promise<boolean>;

export const LEGAL_USER_FIELDS = {
  termsAcceptedVersion: {
    type: "string",
    required: false,
    returned: false,
  },
  privacyAcknowledgedVersion: {
    type: "string",
    required: false,
    returned: false,
  },
  legalAcceptedAt: {
    type: "date",
    required: false,
    returned: false,
  },
} as const;

export const EMAIL_PASSWORD_POLICY = {
  enabled: true,
  requireEmailVerification: true,
  minPasswordLength: 12,
  maxPasswordLength: 128,
  resetPasswordTokenExpiresIn: 60 * 60,
  revokeSessionsOnPasswordReset: true,
} as const;

export const EMAIL_VERIFICATION_POLICY = {
  expiresIn: 60 * 60,
  sendOnSignUp: true,
  sendOnSignIn: true,
  autoSignInAfterVerification: true,
} as const;

export const AUTH_RATE_LIMIT_POLICY = {
  enabled: true,
  storage: "database",
  window: 60,
  max: 100,
  customRules: {
    "/sign-in/email": { window: 60, max: 5 },
    "/sign-up/email": { window: 60, max: 3 },
    "/change-password": { window: 300, max: 5 },
    "/delete-user": { window: 300, max: 3 },
    "/request-password-reset": { window: 60, max: 3 },
    "/reset-password": { window: 300, max: 5 },
  },
} as const;

export function createAuthBeforeHook({
  turnstileSecret,
  verifyTurnstile,
}: {
  turnstileSecret?: string;
  verifyTurnstile: VerifyTurnstile;
}) {
  return createAuthMiddleware(async (context) => {
    if (context.path === "/sign-up/email") {
      if (context.body.legalAcceptance !== true) {
        throw APIError.from("BAD_REQUEST", {
          code: LEGAL_ACCEPTANCE_ERROR_CODE,
          message: LEGAL_ACCEPTANCE_ERROR_MESSAGE,
        });
      }

      context.body.termsAcceptedVersion = TERMS_VERSION;
      context.body.privacyAcknowledgedVersion = PRIVACY_POLICY_VERSION;
      context.body.legalAcceptedAt = new Date();
    }

    if (
      context.path === "/update-user" &&
      (context.body.termsAcceptedVersion !== undefined ||
        context.body.privacyAcknowledgedVersion !== undefined ||
        context.body.legalAcceptedAt !== undefined)
    ) {
      throw APIError.from("FORBIDDEN", {
        code: "LEGAL_ACCEPTANCE_IMMUTABLE",
        message: "Danych akceptacji dokumentów nie można zmieniać.",
      });
    }

    if (
      ![
        "/sign-in/email",
        "/sign-up/email",
        "/request-password-reset",
      ].includes(context.path)
    ) {
      return;
    }

    if (
      !context.request ||
      !(await verifyTurnstile(context.request, turnstileSecret))
    ) {
      throw APIError.from("FORBIDDEN", {
        code: TURNSTILE_ERROR_CODE,
        message: TURNSTILE_ERROR_MESSAGE,
      });
    }
  });
}
