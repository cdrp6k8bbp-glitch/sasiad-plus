import { getCloudflareContext } from "@opennextjs/cloudflare";
import { recordResendWebhookEvent } from "@/lib/email-delivery";
import { verifySvixWebhook } from "@/lib/webhook-signature";

type ResendWebhookEnv = CloudflareEnv & {
  RESEND_WEBHOOK_SECRET?: string;
};

function webhookHeaders(request: Request) {
  return {
    "svix-id": request.headers.get("svix-id") ?? "",
    "svix-timestamp": request.headers.get("svix-timestamp") ?? "",
    "svix-signature": request.headers.get("svix-signature") ?? "",
  };
}

export async function POST(request: Request) {
  const { env } = await getCloudflareContext({ async: true });
  const webhookEnv = env as ResendWebhookEnv;

  if (!webhookEnv.RESEND_WEBHOOK_SECRET) {
    console.error(
      JSON.stringify({ event: "resend.webhook_secret_missing" }),
    );
    return new Response("Webhook unavailable", { status: 503 });
  }

  const payload = await request.text();
  const headers = webhookHeaders(request);
  const verified = await verifySvixWebhook({
    payload,
    headers,
    secret: webhookEnv.RESEND_WEBHOOK_SECRET,
  });

  if (!verified) {
    console.warn(
      JSON.stringify({ event: "resend.webhook_signature_rejected" }),
    );
    return new Response("Invalid webhook", { status: 400 });
  }

  let event: unknown;
  try {
    event = JSON.parse(payload);
  } catch {
    console.warn(
      JSON.stringify({ event: "resend.webhook_payload_rejected" }),
    );
    return new Response("Invalid webhook", { status: 400 });
  }

  try {
    await recordResendWebhookEvent(
      webhookEnv.DB,
      headers["svix-id"],
      event as Parameters<typeof recordResendWebhookEvent>[2],
    );
  } catch (error) {
    console.error(
      JSON.stringify({
        event: "resend.webhook_storage_failed",
        message: error instanceof Error ? error.message : "unknown_error",
      }),
    );
    return new Response("Storage failed", { status: 500 });
  }

  return new Response("OK", { status: 200 });
}
