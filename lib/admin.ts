import { getCloudflareContext } from "@opennextjs/cloudflare";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";

type AdminEnv = CloudflareEnv & {
  ADMIN_EMAILS?: string;
};

export function isAdminEmail(
  email: string,
  configuredEmails: string | undefined,
): boolean {
  const normalizedEmail = email.trim().toLocaleLowerCase("pl");

  return (configuredEmails ?? "")
    .split(",")
    .map((value) => value.trim().toLocaleLowerCase("pl"))
    .filter(Boolean)
    .includes(normalizedEmail);
}

export async function isCurrentUserAdmin(email: string): Promise<boolean> {
  const { env } = await getCloudflareContext({ async: true });
  return isAdminEmail(email, (env as AdminEnv).ADMIN_EMAILS);
}

export async function requireAdmin(redirectPath = "/admin") {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect(`/logowanie?redirect=${encodeURIComponent(redirectPath)}`);
  }

  if (!(await isCurrentUserAdmin(session.user.email))) {
    notFound();
  }

  return session;
}
