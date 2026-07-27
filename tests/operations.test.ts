import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";
import {
  recordAcceptedEmail,
  recordResendWebhookEvent,
  runOperationalHealthCheck,
} from "@/lib/email-delivery";
import { verifySvixWebhook } from "@/lib/webhook-signature";
import { createTestDatabase } from "@/tests/support/d1";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));

function base64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64");
}

async function signature({
  payload,
  messageId,
  timestamp,
  secret,
}: {
  payload: string;
  messageId: string;
  timestamp: number;
  secret: Uint8Array;
}) {
  const key = await crypto.subtle.importKey(
    "raw",
    Uint8Array.from(secret).buffer,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const value = `${messageId}.${timestamp}.${payload}`;
  const signed = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value),
  );

  return `v1,${base64(new Uint8Array(signed))}`;
}

describe("monitoring operacyjny", () => {
  test("akceptuje poprawnie podpisany webhook i odrzuca zmienioną treść", async () => {
    const payload = JSON.stringify({
      type: "email.delivered",
      data: { email_id: "email-1" },
    });
    const timestamp = Math.floor(Date.now() / 1000);
    const messageId = "msg_test";
    const secretBytes = crypto.getRandomValues(new Uint8Array(32));
    const secret = `whsec_${base64(secretBytes)}`;
    const headers = {
      "svix-id": messageId,
      "svix-timestamp": String(timestamp),
      "svix-signature": await signature({
        payload,
        messageId,
        timestamp,
        secret: secretBytes,
      }),
    };

    await expect(
      verifySvixWebhook({ payload, headers, secret }),
    ).resolves.toBe(true);
    await expect(
      verifySvixWebhook({ payload: `${payload} `, headers, secret }),
    ).resolves.toBe(false);
  });

  test("zapisuje przyjęcie i końcowy status wiadomości bez adresu odbiorcy", async () => {
    const testDatabase = createTestDatabase(projectRoot);

    try {
      await recordAcceptedEmail(
        testDatabase.d1,
        "email-2",
        "email_verification",
        "2030-01-01T10:00:00.000Z",
      );
      await recordResendWebhookEvent(
        testDatabase.d1,
        "event-2",
        {
          type: "email.delivered",
          created_at: "2030-01-01T10:00:02.000Z",
          data: {
            email_id: "email-2",
            tags: { category: "email_verification" },
          },
        },
        "2030-01-01T10:00:03.000Z",
      );

      const delivery = testDatabase.database
        .prepare(
          `SELECT email_kind, status
           FROM email_deliveries
           WHERE provider_message_id = 'email-2'`,
        )
        .get();
      const columns = testDatabase.database
        .prepare("PRAGMA table_info(email_deliveries)")
        .all() as Array<{ name: string }>;

      expect(delivery).toEqual({
        email_kind: "email_verification",
        status: "delivered",
      });
      expect(columns.map((column) => column.name)).not.toContain("recipient");
    } finally {
      testDatabase.close();
    }
  });

  test("wykrywa problem z dostarczeniem i nie powiela alarmu co godzinę", async () => {
    const testDatabase = createTestDatabase(projectRoot);
    const now = new Date("2030-01-02T12:00:00.000Z");

    try {
      testDatabase.database
        .prepare(
          `INSERT INTO data_retention_runs (
             started_at, completed_at, status, summary
           ) VALUES (?, ?, 'completed', '{}')`,
        )
        .run(now.toISOString(), now.toISOString());
      await recordResendWebhookEvent(
        testDatabase.d1,
        "event-failed",
        {
          type: "email.failed",
          created_at: now.toISOString(),
          data: { email_id: "email-failed" },
        },
        now.toISOString(),
      );

      const first = await runOperationalHealthCheck(testDatabase.d1, now);
      const second = await runOperationalHealthCheck(
        testDatabase.d1,
        new Date(now.getTime() + 60 * 60 * 1000),
      );

      expect(first.status).toBe("warning");
      expect(first.shouldAlert).toBe(true);
      expect(second.status).toBe("warning");
      expect(second.shouldAlert).toBe(false);
    } finally {
      testDatabase.close();
    }
  });
});
