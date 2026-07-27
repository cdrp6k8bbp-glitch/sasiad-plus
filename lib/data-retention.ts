type RetentionSummary = {
  expiredSessions: number;
  expiredVerifications: number;
  authRateLimits: number;
  actionRateLimits: number;
  moderationDecisions: number;
  contentReports: number;
  listingReports: number;
  emailDeliveryEvents: number;
  emailDeliveries: number;
  operationalChecks: number;
};

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function deletedRows(result: D1Result<unknown>) {
  return Number(result.meta.changes ?? 0);
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Nieznany błąd retencji danych";
}

export async function runDataRetention(
  db: D1Database,
  now = new Date(),
): Promise<RetentionSummary> {
  const startedAt = now.toISOString();
  const authRateLimitCutoff = now.getTime() - DAY_IN_MS;
  const actionRateLimitCutoff = new Date(
    now.getTime() - 2 * DAY_IN_MS,
  ).toISOString();
  const moderationCutoffDate = new Date(now);
  moderationCutoffDate.setUTCFullYear(now.getUTCFullYear() - 3);
  const moderationCutoff = moderationCutoffDate.toISOString();
  const operationalCutoff = new Date(
    now.getTime() - 90 * DAY_IN_MS,
  ).toISOString();

  try {
    const results = await db.batch([
      db
        .prepare(
          `DELETE FROM "session"
           WHERE datetime("expiresAt") <= datetime(?)`,
        )
        .bind(startedAt),
      db
        .prepare(
          `DELETE FROM "verification"
           WHERE datetime("expiresAt") <= datetime(?)`,
        )
        .bind(startedAt),
      db
        .prepare(
          `DELETE FROM "rateLimit"
           WHERE "lastRequest" < ?`,
        )
        .bind(authRateLimitCutoff),
      db
        .prepare(
          `DELETE FROM action_rate_limits
           WHERE datetime(updated_at) < datetime(?)`,
        )
        .bind(actionRateLimitCutoff),
      db
        .prepare(
          `DELETE FROM moderation_decisions
           WHERE datetime(created_at) < datetime(?)`,
        )
        .bind(moderationCutoff),
      db
        .prepare(
          `DELETE FROM content_reports
           WHERE status != 'pending'
             AND datetime(updated_at) < datetime(?)`,
        )
        .bind(moderationCutoff),
      db
        .prepare(
          `DELETE FROM listing_reports
           WHERE status != 'pending'
             AND datetime(updated_at) < datetime(?)`,
        )
        .bind(moderationCutoff),
      db
        .prepare(
          `DELETE FROM email_delivery_events
           WHERE datetime(occurred_at) < datetime(?)`,
        )
        .bind(operationalCutoff),
      db
        .prepare(
          `DELETE FROM email_deliveries
           WHERE datetime(updated_at) < datetime(?)`,
        )
        .bind(operationalCutoff),
      db
        .prepare(
          `DELETE FROM operational_checks
           WHERE datetime(started_at) < datetime(?)`,
        )
        .bind(operationalCutoff),
    ]);

    const summary: RetentionSummary = {
      expiredSessions: deletedRows(results[0]),
      expiredVerifications: deletedRows(results[1]),
      authRateLimits: deletedRows(results[2]),
      actionRateLimits: deletedRows(results[3]),
      moderationDecisions: deletedRows(results[4]),
      contentReports: deletedRows(results[5]),
      listingReports: deletedRows(results[6]),
      emailDeliveryEvents: deletedRows(results[7]),
      emailDeliveries: deletedRows(results[8]),
      operationalChecks: deletedRows(results[9]),
    };
    const completedAt = new Date().toISOString();

    await db
      .prepare(
        `INSERT INTO data_retention_runs (
           started_at, completed_at, status, summary
         ) VALUES (?, ?, 'completed', ?)`,
      )
      .bind(startedAt, completedAt, JSON.stringify(summary))
      .run();

    console.log(
      JSON.stringify({
        event: "data_retention.completed",
        startedAt,
        completedAt,
        summary,
      }),
    );

    return summary;
  } catch (error) {
    const message = errorMessage(error);

    try {
      await db
        .prepare(
          `INSERT INTO data_retention_runs (
             started_at, completed_at, status, error_message
           ) VALUES (?, ?, 'failed', ?)`,
        )
        .bind(startedAt, new Date().toISOString(), message.slice(0, 1000))
        .run();
    } catch (logError) {
      console.error(
        JSON.stringify({
          event: "data_retention.audit_log_failed",
          error: errorMessage(logError),
        }),
      );
    }

    console.error(
      JSON.stringify({
        event: "data_retention.failed",
        startedAt,
        error: message,
      }),
    );
    throw error;
  }
}
