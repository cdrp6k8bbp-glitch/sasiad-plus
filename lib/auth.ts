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
  },

  secret: authEnv.BETTER_AUTH_SECRET,
  baseURL: authEnv.BETTER_AUTH_URL,
});