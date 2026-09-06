ALTER TABLE listings
ADD COLUMN freshness_confirmed_at TEXT;

ALTER TABLE listings
ADD COLUMN freshness_reminded_at TEXT;

UPDATE listings
SET freshness_confirmed_at = datetime('now')
WHERE freshness_confirmed_at IS NULL;

CREATE INDEX idx_listings_freshness
  ON listings(archived_at, freshness_confirmed_at);

PRAGMA defer_foreign_keys = ON;

CREATE TABLE notifications_v3 (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (
    type IN (
      'reservation_created',
      'reservation_accepted',
      'reservation_rejected',
      'reservation_cancelled',
      'reservation_completed',
      'review_received',
      'moderation_update',
      'listing_freshness_reminder',
      'listing_archived'
    )
  ),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  href TEXT NOT NULL,
  read_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE
);

INSERT INTO notifications_v3 (
  id, user_id, type, title, body, href, read_at, created_at
)
SELECT id, user_id, type, title, body, href, read_at, created_at
FROM notifications;

DROP TABLE notifications;
ALTER TABLE notifications_v3 RENAME TO notifications;

CREATE INDEX idx_notifications_user_created
  ON notifications(user_id, created_at DESC);

CREATE INDEX idx_notifications_user_unread
  ON notifications(user_id, read_at);

PRAGMA defer_foreign_keys = OFF;
