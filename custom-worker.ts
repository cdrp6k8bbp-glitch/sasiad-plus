// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore `.open-next/worker.js` is generated during the build.
import handler from "./.open-next/worker.js";
import { runDataRetention } from "./lib/data-retention";
import { runOperationalHealthCheck } from "./lib/email-delivery";
import {
  sendListingFreshnessEmail,
  sendOperationalAlertEmail,
} from "./lib/email";
import { runListingFreshnessMaintenance } from "./lib/listing-freshness";
import { sendPushNotification, type PushEnv } from "./lib/push";

type OperationsEnv = CloudflareEnv & {
  ALERT_EMAIL?: string;
  BETTER_AUTH_URL: string;
  RESEND_API_KEY: string;
};

const DAILY_MAINTENANCE_CRONS = new Set([
  "17 2 * * *",
  "47 2 * * *",
]);

export default {
  fetch: handler.fetch,

  async scheduled(controller, env) {
    const operationsEnv = env as OperationsEnv;
    const scheduledAt = new Date(controller.scheduledTime);

    if (DAILY_MAINTENANCE_CRONS.has(controller.cron)) {
      await runDataRetention(operationsEnv.DB, scheduledAt);
      const freshness = await runListingFreshnessMaintenance(
        operationsEnv.DB,
        scheduledAt,
      );
      const baseUrl = operationsEnv.BETTER_AUTH_URL.replace(/\/$/, "");

      await Promise.all(
        freshness.reminded.map(async (listing) => {
          const body = `Potwierdź aktualność oferty „${listing.title}”, aby pozostała widoczna.`;
          await Promise.allSettled([
            operationsEnv.RESEND_API_KEY
              ? sendListingFreshnessEmail({
                  apiKey: operationsEnv.RESEND_API_KEY,
                  db: operationsEnv.DB,
                  recipient: listing.email,
                  listingTitle: listing.title,
                  actionUrl: `${baseUrl}/ogloszenie/${listing.listingId}`,
                })
              : Promise.resolve(),
            sendPushNotification(operationsEnv as PushEnv, {
              userId: listing.userId,
              title: "Czy ogłoszenie jest nadal aktualne?",
              body,
              url: `/ogloszenie/${listing.listingId}`,
              tag: `listing-freshness-${listing.listingId}`,
            }),
          ]);
        }),
      );
    }

    const health = await runOperationalHealthCheck(
      operationsEnv.DB,
      scheduledAt,
    );

    if (
      health.shouldAlert &&
      operationsEnv.ALERT_EMAIL &&
      operationsEnv.RESEND_API_KEY
    ) {
      await sendOperationalAlertEmail({
        apiKey: operationsEnv.RESEND_API_KEY,
        db: operationsEnv.DB,
        recipient: operationsEnv.ALERT_EMAIL,
        issues: health.issues,
        actionUrl: `${operationsEnv.BETTER_AUTH_URL.replace(/\/$/, "")}/admin/operacje`,
      });
    }
  },
} satisfies ExportedHandler<CloudflareEnv>;

// OpenNext cache support requires these generated Durable Object exports.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore `.open-next/worker.js` is generated during the build.
export { BucketCachePurge, DOQueueHandler, DOShardedTagCache } from "./.open-next/worker.js";
