import "server-only";

type RateLimitRule = {
  action: string;
  limit: number;
  windowSeconds: number;
  message: string;
};

export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RateLimitError";
  }
}

export const RATE_LIMITS = {
  report: [
    {
      action: "report:hour",
      limit: 10,
      windowSeconds: 60 * 60,
      message:
        "Wysłano zbyt wiele zgłoszeń. Spróbuj ponownie za około godzinę.",
    },
  ],
  startConversation: [
    {
      action: "conversation:hour",
      limit: 10,
      windowSeconds: 60 * 60,
      message:
        "Rozpoczęto zbyt wiele rozmów. Spróbuj ponownie za około godzinę.",
    },
  ],
  message: [
    {
      action: "message:10minutes",
      limit: 20,
      windowSeconds: 10 * 60,
      message:
        "Wysłano zbyt wiele wiadomości. Odczekaj kilka minut i spróbuj ponownie.",
    },
    {
      action: "message:day",
      limit: 200,
      windowSeconds: 24 * 60 * 60,
      message:
        "Osiągnięto dzienny limit wiadomości. Spróbuj ponownie jutro.",
    },
  ],
  review: [
    {
      action: "review:day",
      limit: 10,
      windowSeconds: 24 * 60 * 60,
      message: "Osiągnięto dzienny limit opinii. Spróbuj ponownie jutro.",
    },
  ],
  listing: [
    {
      action: "listing:hour",
      limit: 5,
      windowSeconds: 60 * 60,
      message:
        "Dodano zbyt wiele ogłoszeń. Spróbuj ponownie za około godzinę.",
    },
    {
      action: "listing:day",
      limit: 20,
      windowSeconds: 24 * 60 * 60,
      message:
        "Osiągnięto dzienny limit ogłoszeń. Spróbuj ponownie jutro.",
    },
  ],
  reservation: [
    {
      action: "reservation:hour",
      limit: 10,
      windowSeconds: 60 * 60,
      message:
        "Wysłano zbyt wiele próśb o rezerwację. Spróbuj ponownie za około godzinę.",
    },
    {
      action: "reservation:day",
      limit: 40,
      windowSeconds: 24 * 60 * 60,
      message:
        "Osiągnięto dzienny limit rezerwacji. Spróbuj ponownie jutro.",
    },
  ],
  imageUpload: [
    {
      action: "image-upload:hour",
      limit: 30,
      windowSeconds: 60 * 60,
      message:
        "Wysłano zbyt wiele zdjęć. Spróbuj ponownie za około godzinę.",
    },
    {
      action: "image-upload:day",
      limit: 100,
      windowSeconds: 24 * 60 * 60,
      message:
        "Osiągnięto dzienny limit zdjęć. Spróbuj ponownie jutro.",
    },
  ],
} satisfies Record<string, RateLimitRule[]>;

export async function enforceRateLimits(
  db: D1Database,
  userId: string,
  rules: readonly RateLimitRule[],
): Promise<void> {
  for (const rule of rules) {
    const bucket = Math.floor(Date.now() / 1000 / rule.windowSeconds);
    const [, countResult] = await db.batch<{ count: number }>([
      db
        .prepare(
          `INSERT INTO action_rate_limits (
             user_id, action, bucket, count, updated_at
           ) VALUES (?, ?, ?, 1, datetime('now'))
           ON CONFLICT(user_id, action, bucket) DO UPDATE SET
             count = action_rate_limits.count + 1,
             updated_at = datetime('now')`,
        )
        .bind(userId, rule.action, bucket),
      db
        .prepare(
          `SELECT count
           FROM action_rate_limits
           WHERE user_id = ?
             AND action = ?
             AND bucket = ?
           LIMIT 1`,
        )
        .bind(userId, rule.action, bucket),
    ]);
    const result = countResult.results[0];

    if (!result || Number(result.count) > rule.limit) {
      throw new RateLimitError(rule.message);
    }
  }
}
