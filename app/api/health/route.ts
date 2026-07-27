import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function GET() {
  const checkedAt = new Date().toISOString();

  try {
    const { env } = await getCloudflareContext({ async: true });
    await env.DB.prepare("SELECT 1 AS ok").first();
    const retention = await env.DB
      .prepare(
        `SELECT status, started_at
         FROM data_retention_runs
         ORDER BY id DESC
         LIMIT 1`,
      )
      .first<{ status: string; started_at: string }>();
    const retentionIsCurrent =
      Boolean(retention) &&
      retention?.status === "completed" &&
      new Date(retention.started_at).getTime() >
        Date.now() - 36 * 60 * 60 * 1000;

    return Response.json(
      {
        status: retentionIsCurrent ? "ok" : "degraded",
        database: "ok",
        scheduledMaintenance: retentionIsCurrent ? "ok" : "stale",
        checkedAt,
      },
      {
        status: retentionIsCurrent ? 200 : 503,
        headers: { "cache-control": "no-store" },
      },
    );
  } catch (error) {
    console.error(
      JSON.stringify({
        event: "operations.public_health_failed",
        message: error instanceof Error ? error.message : "unknown_error",
      }),
    );

    return Response.json(
      {
        status: "error",
        database: "unavailable",
        scheduledMaintenance: "unknown",
        checkedAt,
      },
      {
        status: 503,
        headers: { "cache-control": "no-store" },
      },
    );
  }
}
