import { getCloudflareContext } from "@opennextjs/cloudflare";

export type EmailDeliveryStatus =
  | "accepted"
  | "scheduled"
  | "sent"
  | "delivered"
  | "delivery_delayed"
  | "bounced"
  | "complained"
  | "failed"
  | "suppressed"
  | "opened"
  | "clicked"
  | "unknown";

export type EmailDeliveryRow = {
  provider_message_id: string;
  email_kind: string;
  status: EmailDeliveryStatus;
  accepted_at: string | null;
  last_event_at: string;
  updated_at: string;
};

export type OperationalCheckRow = {
  id: number;
  started_at: string;
  completed_at: string | null;
  status: "ok" | "warning" | "failed";
  summary: string | null;
  error_message: string | null;
};

type ResendWebhookEvent = {
  type?: string;
  created_at?: string;
  data?: {
    email_id?: string;
    tags?: Record<string, string> | Array<{ name?: string; value?: string }>;
  };
};

type ResendTags =
  | Record<string, string>
  | Array<{ name?: string; value?: string }>
  | undefined;

type OperationalSummary = {
  emailProblemsLast24Hours: number;
  staleEmails: number;
  webhookEventsObserved: number;
  latestRetentionStatus: string | null;
  latestRetentionStartedAt: string | null;
};

export type OperationalHealthResult = {
  status: "ok" | "warning";
  issues: string[];
  summary: OperationalSummary;
  shouldAlert: boolean;
};

const PROBLEM_STATUSES: EmailDeliveryStatus[] = [
  "bounced",
  "complained",
  "failed",
  "suppressed",
];

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Nieznany błąd monitoringu";
}

function emailStatus(eventType: string): EmailDeliveryStatus {
  const status = eventType.replace(/^email\./, "");

  switch (status) {
    case "scheduled":
    case "sent":
    case "delivered":
    case "delivery_delayed":
    case "bounced":
    case "complained":
    case "failed":
    case "suppressed":
    case "opened":
    case "clicked":
      return status;
    default:
      return "unknown";
  }
}

function emailKind(tags: ResendTags): string {
  if (Array.isArray(tags)) {
    return (
      tags.find((tag) => tag.name === "category")?.value?.slice(0, 80) ??
      "unknown"
    );
  }

  if (tags && typeof tags === "object") {
    return String(tags.category ?? "unknown").slice(0, 80);
  }

  return "unknown";
}

export async function recordAcceptedEmail(
  db: D1Database,
  providerMessageId: string,
  kind: string,
  acceptedAt = new Date().toISOString(),
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO email_deliveries (
         provider_message_id, email_kind, status, accepted_at,
         last_event_at, updated_at
       ) VALUES (?, ?, 'accepted', ?, ?, ?)
       ON CONFLICT(provider_message_id) DO UPDATE SET
         email_kind = CASE
           WHEN email_deliveries.email_kind = 'unknown' THEN excluded.email_kind
           ELSE email_deliveries.email_kind
         END,
         accepted_at = COALESCE(email_deliveries.accepted_at, excluded.accepted_at),
         updated_at = excluded.updated_at`,
    )
    .bind(
      providerMessageId,
      kind.slice(0, 80),
      acceptedAt,
      acceptedAt,
      acceptedAt,
    )
    .run();
}

export async function recordResendWebhookEvent(
  db: D1Database,
  providerEventId: string,
  event: ResendWebhookEvent,
  receivedAt = new Date().toISOString(),
): Promise<void> {
  const eventType = event.type ?? "";
  const providerMessageId = event.data?.email_id ?? "";

  if (!eventType.startsWith("email.") || !providerMessageId) {
    return;
  }

  const occurredAt = event.created_at ?? receivedAt;
  const status = emailStatus(eventType);
  const kind = emailKind(event.data?.tags);

  await db.batch([
    db
      .prepare(
        `INSERT INTO email_delivery_events (
           provider_event_id, provider_message_id, event_type,
           occurred_at, received_at
         ) VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(provider_event_id) DO NOTHING`,
      )
      .bind(
        providerEventId.slice(0, 200),
        providerMessageId.slice(0, 200),
        eventType.slice(0, 80),
        occurredAt,
        receivedAt,
      ),
    db
      .prepare(
        `INSERT INTO email_deliveries (
           provider_message_id, email_kind, status,
           last_event_at, updated_at
         ) VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(provider_message_id) DO UPDATE SET
           email_kind = CASE
             WHEN email_deliveries.email_kind = 'unknown' THEN excluded.email_kind
             ELSE email_deliveries.email_kind
           END,
           status = CASE
             WHEN datetime(excluded.last_event_at) >= datetime(email_deliveries.last_event_at)
               THEN excluded.status
             ELSE email_deliveries.status
           END,
           last_event_at = CASE
             WHEN datetime(excluded.last_event_at) >= datetime(email_deliveries.last_event_at)
               THEN excluded.last_event_at
             ELSE email_deliveries.last_event_at
           END,
           updated_at = excluded.updated_at`,
      )
      .bind(
        providerMessageId.slice(0, 200),
        kind,
        status,
        occurredAt,
        receivedAt,
      ),
  ]);
}

export async function runOperationalHealthCheck(
  db: D1Database,
  now = new Date(),
): Promise<OperationalHealthResult> {
  const startedAt = now.toISOString();
  const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const staleCutoff = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();
  const retentionCutoff = new Date(
    now.getTime() - 36 * 60 * 60 * 1000,
  ).toISOString();

  try {
    const [problems, webhookEvents, stale, retention, previousCheck] =
      await db.batch<{
        count?: number;
        status?: string;
        started_at?: string;
      }>([
        db
          .prepare(
            `SELECT COUNT(*) AS count
             FROM email_deliveries
             WHERE status IN (${PROBLEM_STATUSES.map(() => "?").join(", ")})
               AND datetime(updated_at) >= datetime(?)`,
          )
          .bind(...PROBLEM_STATUSES, last24Hours),
        db.prepare(
          `SELECT COUNT(*) AS count
           FROM email_delivery_events`,
        ),
        db
          .prepare(
            `SELECT COUNT(*) AS count
             FROM email_deliveries
             WHERE status IN ('accepted', 'scheduled', 'sent', 'delivery_delayed')
               AND datetime(last_event_at) < datetime(?)`,
          )
          .bind(staleCutoff),
        db.prepare(
          `SELECT status, started_at
           FROM data_retention_runs
           ORDER BY id DESC
           LIMIT 1`,
        ),
        db.prepare(
          `SELECT status, started_at
           FROM operational_checks
           ORDER BY id DESC
           LIMIT 1`,
        ),
      ]);

    const problemCount = Number(problems.results[0]?.count ?? 0);
    const webhookEventCount = Number(webhookEvents.results[0]?.count ?? 0);
    const staleCount =
      webhookEventCount > 0 ? Number(stale.results[0]?.count ?? 0) : 0;
    const latestRetention = retention.results[0];
    const previous = previousCheck.results[0];
    const issues: string[] = [];

    if (problemCount > 0) {
      issues.push(
        `${problemCount} wiadomości e-mail ma status wymagający sprawdzenia w ostatnich 24 godzinach.`,
      );
    }

    if (staleCount > 0) {
      issues.push(
        `${staleCount} wiadomości e-mail nie otrzymało końcowego statusu przez ponad 2 godziny.`,
      );
    }

    if (
      !latestRetention ||
      latestRetention.status !== "completed" ||
      !latestRetention.started_at ||
      new Date(latestRetention.started_at).getTime() <
        new Date(retentionCutoff).getTime()
    ) {
      issues.push("Codzienne czyszczenie danych nie zakończyło się prawidłowo.");
    }

    const status = issues.length === 0 ? "ok" : "warning";
    const summary: OperationalSummary = {
      emailProblemsLast24Hours: problemCount,
      staleEmails: staleCount,
      webhookEventsObserved: webhookEventCount,
      latestRetentionStatus: latestRetention?.status ?? null,
      latestRetentionStartedAt: latestRetention?.started_at ?? null,
    };
    const previousStartedAt = previous?.started_at
      ? new Date(previous.started_at).getTime()
      : 0;
    const shouldAlert =
      status === "warning" &&
      (previous?.status !== "warning" ||
        previousStartedAt < now.getTime() - 24 * 60 * 60 * 1000);

    await db
      .prepare(
        `INSERT INTO operational_checks (
           started_at, completed_at, status, summary
         ) VALUES (?, ?, ?, ?)`,
      )
      .bind(
        startedAt,
        new Date().toISOString(),
        status,
        JSON.stringify(summary),
      )
      .run();

    console.log(
      JSON.stringify({
        event: "operations.health_check_completed",
        status,
        issues,
        summary,
      }),
    );

    return { status, issues, summary, shouldAlert };
  } catch (error) {
    const message = errorMessage(error);

    try {
      await db
        .prepare(
          `INSERT INTO operational_checks (
             started_at, completed_at, status, error_message
           ) VALUES (?, ?, 'failed', ?)`,
        )
        .bind(startedAt, new Date().toISOString(), message.slice(0, 1000))
        .run();
    } catch (auditError) {
      console.error(
        JSON.stringify({
          event: "operations.health_check_audit_failed",
          error: errorMessage(auditError),
        }),
      );
    }

    console.error(
      JSON.stringify({
        event: "operations.health_check_failed",
        error: message,
      }),
    );
    throw error;
  }
}

export async function getOperationalDashboard(): Promise<{
  deliveries: EmailDeliveryRow[];
  checks: OperationalCheckRow[];
  webhookEventCount: number;
  problemCount: number;
}> {
  const { env } = await getCloudflareContext({ async: true });
  const [deliveries, checks, webhookEvents, problems] = await env.DB.batch([
    env.DB.prepare(
      `SELECT provider_message_id, email_kind, status, accepted_at,
              last_event_at, updated_at
       FROM email_deliveries
       ORDER BY datetime(updated_at) DESC
       LIMIT 30`,
    ),
    env.DB.prepare(
      `SELECT id, started_at, completed_at, status, summary, error_message
       FROM operational_checks
       ORDER BY id DESC
       LIMIT 20`,
    ),
    env.DB.prepare(
      `SELECT COUNT(*) AS count
       FROM email_delivery_events`,
    ),
    env.DB.prepare(
      `SELECT COUNT(*) AS count
       FROM email_deliveries
       WHERE status IN ('bounced', 'complained', 'failed', 'suppressed')`,
    ),
  ]);

  return {
    deliveries: deliveries.results as EmailDeliveryRow[],
    checks: checks.results as OperationalCheckRow[],
    webhookEventCount: Number(
      (webhookEvents.results[0] as { count?: number } | undefined)?.count ?? 0,
    ),
    problemCount: Number(
      (problems.results[0] as { count?: number } | undefined)?.count ?? 0,
    ),
  };
}
