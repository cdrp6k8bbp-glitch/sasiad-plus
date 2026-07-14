import { betterAuth } from "better-auth";

export const auth = betterAuth({
  database: {
    provider: "sqlite",
    url: "file:./better-auth-cli.sqlite",
  },

  emailAndPassword: {
    enabled: true,
  },

  secret:
    process.env.BETTER_AUTH_SECRET ??
    "tymczasowy-sekret-wylacznie-do-generowania-schematu",
});