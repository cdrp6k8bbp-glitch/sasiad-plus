import { DatabaseSync } from "node:sqlite";
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  database: new DatabaseSync("auth-cli.db"),

  emailAndPassword: {
    enabled: true,
  },

  secret: "temporary-cli-secret-at-least-32-characters-long",
  baseURL: "http://localhost:3000",
});
