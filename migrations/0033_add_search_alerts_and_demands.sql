CREATE TABLE search_alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  query TEXT NOT NULL DEFAULT '',
  categories TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  radius INTEGER NOT NULL DEFAULT 10 CHECK (radius IN (10, 25, 50)),
  kind TEXT NOT NULL DEFAULT 'alert' CHECK (kind IN ('alert', 'demand')),
  description TEXT,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  last_notified_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX search_alerts_unique_active_search
  ON search_alerts(user_id, query, categories, location, radius, kind)
  WHERE active = 1 AND kind = 'alert';

CREATE INDEX search_alerts_active_created
  ON search_alerts(active, created_at DESC);

PRAGMA defer_foreign_keys = ON;

CREATE TABLE notifications_v4 (
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
      'listing_archived',
      'search_match'
    )
  ),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  href TEXT NOT NULL,
  read_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE
);

INSERT INTO notifications_v4 (
  id, user_id, type, title, body, href, read_at, created_at
)
SELECT id, user_id, type, title, body, href, read_at, created_at
FROM notifications;

DROP TABLE notifications;
ALTER TABLE notifications_v4 RENAME TO notifications;

CREATE INDEX idx_notifications_user_created
  ON notifications(user_id, created_at DESC);

CREATE INDEX idx_notifications_user_unread
  ON notifications(user_id, read_at);

PRAGMA defer_foreign_keys = OFF;
