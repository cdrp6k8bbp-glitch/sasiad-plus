import { betterAuth } from "better-auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  sendEmailVerificationEmail,
  sendPasswordResetEmail,
} from "@/lib/email";
import { deleteUserApplicationData } from "@/lib/account-deletion";
import {
  AUTH_RATE_LIMIT_POLICY,
  createAuthBeforeHook,
  EMAIL_PASSWORD_POLICY,
  EMAIL_VERIFICATION_POLICY,
  LEGAL_USER_FIELDS,
} from "@/lib/auth-policy";
import { verifyTurnstileRequest } from "@/lib/turnstile";

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
    before: createAuthBeforeHook({
      turnstileSecret: authEnv.TURNSTILE_SECRET,
      verifyTurnstile: verifyTurnstileRequest,
    }),
  },

  user: {
    additionalFields: LEGAL_USER_FIELDS,
    deleteUser: {
      enabled: true,
      beforeDelete: async (user) => {
        await deleteUserApplicationData(authEnv, user.id);
      },
    },
  },

  emailAndPassword: {
    ...EMAIL_PASSWORD_POLICY,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail({
        apiKey: authEnv.RESEND_API_KEY,
        recipient: user.email,
        resetUrl: url,
      });
    },
  },

  emailVerification: {
    ...EMAIL_VERIFICATION_POLICY,
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

  rateLimit: AUTH_RATE_LIMIT_POLICY,

  advanced: {
    ipAddress: {
      ipAddressHeaders: ["cf-connecting-ip"],
    },
    useSecureCookies: true,
  },

  secret: authEnv.BETTER_AUTH_SECRET,
  baseURL: authEnv.BETTER_AUTH_URL,
});
