import * as webPush from "web-push";

export type PushEnv = CloudflareEnv & {
  BETTER_AUTH_URL: string;
  VAPID_PUBLIC_KEY?: string;
  VAPID_PRIVATE_KEY?: string;
};

type PushMessage = {
  userId: string;
  title: string;
  body: string;
  url: string;
  tag?: string;
};

type StoredPushSubscription = {
  endpoint: string;
  p256dh: string;
  auth: string;
};

async function sendToSubscription(
  env: PushEnv,
  subscription: StoredPushSubscription,
  payload: string,
): Promise<boolean> {
  const request = webPush.generateRequestDetails(
    {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      },
    },
    payload,
    {
      TTL: 5 * 60,
      urgency: "high",
      vapidDetails: {
        subject: env.BETTER_AUTH_URL,
        publicKey: env.VAPID_PUBLIC_KEY!,
        privateKey: env.VAPID_PRIVATE_KEY!,
      },
    },
  );
  const requestHeaders = new Headers(request.headers);
  let requestBody: ArrayBuffer | null = null;

  requestHeaders.delete("Content-Length");

  if (request.body) {
    requestBody = new ArrayBuffer(request.body.byteLength);
    new Uint8Array(requestBody).set(request.body);
  }

  const response = await fetch(request.endpoint, {
    method: request.method,
    headers: requestHeaders,
    body: requestBody,
  });

  if (response.ok) {
    return true;
  }

  if (response.status === 404 || response.status === 410) {
    await env.DB.prepare(
      `DELETE FROM push_subscriptions WHERE endpoint = ?`,
    )
      .bind(subscription.endpoint)
      .run();
    return false;
  }

  console.error(
    JSON.stringify({
      event: "push_delivery_failed",
      status: response.status,
    }),
  );
  return false;
}

export async function sendPushNotification(
  env: PushEnv,
  message: PushMessage,
): Promise<void> {
  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) {
    console.log(
      JSON.stringify({
        event: "push_delivery_skipped",
        reason: "missing_vapid_configuration",
      }),
    );
    return;
  }

  const result = await env.DB.prepare(
    `SELECT endpoint, p256dh, auth
     FROM push_subscriptions
     WHERE user_id = ?
     ORDER BY updated_at DESC
     LIMIT 10`,
  )
    .bind(message.userId)
    .all<StoredPushSubscription>();

  if (result.results.length === 0) {
    return;
  }

  const payload = JSON.stringify({
    title: message.title.slice(0, 100),
    body: message.body.slice(0, 500),
    url: message.url.startsWith("/") ? message.url : "/powiadomienia",
    tag: message.tag?.slice(0, 100),
  });

  await Promise.all(
    result.results.map(async (subscription) => {
      try {
        await sendToSubscription(env, subscription, payload);
      } catch (error: unknown) {
        console.error(
          JSON.stringify({
            event: "push_delivery_exception",
            message: error instanceof Error ? error.message : "unknown_error",
          }),
        );
      }
    }),
  );
}
