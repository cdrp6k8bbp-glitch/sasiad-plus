import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  sendEmailVerificationEmail,
  sendPasswordResetEmail,
} from "@/lib/email";
import { deleteUserApplicationData } from "@/lib/account-deletion";
import {
  TURNSTILE_ERROR_CODE,
  TURNSTILE_ERROR_MESSAGE,
  verifyTurnstileRequest,
} from "@/lib/turnstile";
import {
  LEGAL_ACCEPTANCE_ERROR_CODE,
  LEGAL_ACCEPTANCE_ERROR_MESSAGE,
  PRIVACY_POLICY_VERSION,
  TERMS_VERSION,
} from "@/lib/legal";

type AuthEnv = CloudflareEnv & {
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  RESEND_API_KEY: string;
  TURNSTILE_SECRET?: string;
};

const { env, ctx } = await getCloudflareContext({ async: true });
const authEnv = env as AuthEnv;

export const auth = betterAuth({
  database: authEnv.DB,

  hooks: {
    before: createAuthMiddleware(async (context) => {
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
        !(await verifyTurnstileRequest(
          context.request,
          authEnv.TURNSTILE_SECRET,
        ))
      ) {
        throw APIError.from("FORBIDDEN", {
          code: TURNSTILE_ERROR_CODE,
          message: TURNSTILE_ERROR_MESSAGE,
        });
      }
    }),
  },

  user: {
    additionalFields: {
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
    },
    deleteUser: {
      enabled: true,
      beforeDelete: async (user) => {
        await deleteUserApplicationData(authEnv, user.id);
      },
    },
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 12,
    maxPasswordLength: 128,
    resetPasswordTokenExpiresIn: 60 * 60,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail({
        apiKey: authEnv.RESEND_API_KEY,
        recipient: user.email,
        resetUrl: url,
      });
    },
  },

  emailVerification: {
    expiresIn: 60 * 60,
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      ctx.waitUntil(
        sendEmailVerificationEmail({
          apiKey: authEnv.RESEND_API_KEY,
          recipient: user.email,
          verificationUrl: url,
        }),
      );
    },
  },

  rateLimit: {
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
  },

  advanced: {
    ipAddress: {
      ipAddressHeaders: ["cf-connecting-ip"],
    },
    useSecureCookies: true,
  },

  secret: authEnv.BETTER_AUTH_SECRET,
  baseURL: authEnv.BETTER_AUTH_URL,
});
