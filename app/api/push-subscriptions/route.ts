import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type { PushEnv } from "@/lib/push";

const MAX_REQUEST_BYTES = 8_192;
const BASE64URL_PATTERN = /^[A-Za-z0-9_-]+$/;

type SubscriptionInput = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
};

function noStoreJson(
  body: Record<string, boolean | string>,
  status = 200,
): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  return origin === new URL(request.url).origin;
}

function validSubscription(value: unknown): value is SubscriptionInput {
  if (!value || typeof value !== "object") return false;

  const candidate = value as {
    endpoint?: unknown;
    keys?: { p256dh?: unknown; auth?: unknown };
  };

  if (
    typeof candidate.endpoint !== "string" ||
    candidate.endpoint.length > 2_048
  ) {
    return false;
  }

  try {
    if (new URL(candidate.endpoint).protocol !== "https:") return false;
  } catch {
    return false;
  }

  const p256dh = candidate.keys?.p256dh;
  const auth = candidate.keys?.auth;

  return (
    typeof p256dh === "string" &&
    p256dh.length >= 40 &&
    p256dh.length <= 200 &&
    BASE64URL_PATTERN.test(p256dh) &&
    typeof auth === "string" &&
    auth.length >= 8 &&
    auth.length <= 100 &&
    BASE64URL_PATTERN.test(auth)
  );
}

async function authenticatedUser(request: Request) {
  return auth.api.getSession({ headers: request.headers });
}

async function requestJson(request: Request): Promise<unknown> {
  const contentLength = Number(request.headers.get("content-length") ?? "0");

  if (contentLength > MAX_REQUEST_BYTES) {
    throw new Error("request_too_large");
  }

  return request.json();
}

export async function GET(request: Request) {
  const session = await authenticatedUser(request);

  if (!session) {
    return noStoreJson({ error: "unauthorized" }, 401);
  }

  const { env: cloudflareEnv } = await getCloudflareContext({ async: true });
  const env = cloudflareEnv as PushEnv;

  if (!env.VAPID_PUBLIC_KEY) {
    return noStoreJson({ configured: false }, 503);
  }

  return noStoreJson({
    configured: true,
    publicKey: env.VAPID_PUBLIC_KEY,
  });
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return noStoreJson({ error: "invalid_origin" }, 403);
  }

  const session = await authenticatedUser(request);

  if (!session) {
    return noStoreJson({ error: "unauthorized" }, 401);
  }

  let input: unknown;

  try {
    input = await requestJson(request);
  } catch {
    return noStoreJson({ error: "invalid_request" }, 400);
  }

  if (!validSubscription(input)) {
    return noStoreJson({ error: "invalid_subscription" }, 400);
  }

  const { env } = await getCloudflareContext({ async: true });

  await env.DB.prepare(
    `INSERT INTO push_subscriptions (
       user_id,
       endpoint,
       p256dh,
       auth
     )
     VALUES (?, ?, ?, ?)
     ON CONFLICT(endpoint) DO UPDATE SET
       user_id = excluded.user_id,
       p256dh = excluded.p256dh,
       auth = excluded.auth,
       updated_at = datetime('now')`,
  )
    .bind(
      session.user.id,
      input.endpoint,
      input.keys.p256dh,
      input.keys.auth,
    )
    .run();

  return noStoreJson({ saved: true });
}

export async function DELETE(request: Request) {
  if (!sameOrigin(request)) {
    return noStoreJson({ error: "invalid_origin" }, 403);
  }

  const session = await authenticatedUser(request);

  if (!session) {
    return noStoreJson({ error: "unauthorized" }, 401);
  }

  let input: unknown;

  try {
    input = await requestJson(request);
  } catch {
    return noStoreJson({ error: "invalid_request" }, 400);
  }

  const endpoint =
    input &&
    typeof input === "object" &&
    "endpoint" in input &&
    typeof input.endpoint === "string"
      ? input.endpoint
      : "";

  if (!endpoint || endpoint.length > 2_048) {
    return noStoreJson({ error: "invalid_endpoint" }, 400);
  }

  const { env } = await getCloudflareContext({ async: true });

  await env.DB.prepare(
    `DELETE FROM push_subscriptions WHERE user_id = ? AND endpoint = ?`,
  )
    .bind(session.user.id, endpoint)
    .run();

  return noStoreJson({ removed: true });
}
