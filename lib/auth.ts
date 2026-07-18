import { betterAuth } from "better-auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";

type AuthEnv = CloudflareEnv & {
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
};

const { env } = await getCloudflareContext({ async: true });
const authEnv = env as AuthEnv;

export const auth = betterAuth({
  database: authEnv.DB,

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 12,
    maxPasswordLength: 128,
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
