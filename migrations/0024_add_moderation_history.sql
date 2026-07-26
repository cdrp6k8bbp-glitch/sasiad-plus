PRAGMA defer_foreign_keys = ON;

CREATE TABLE notifications_v2 (
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
      'moderation_update'
    )
  ),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  href TEXT NOT NULL,
  read_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE
);

INSERT INTO notifications_v2 (
  id,
  user_id,
  type,
  title,
  body,
  href,
  read_at,
  created_at
)
SELECT
  id,
  user_id,
  type,
  title,
  body,
  href,
  read_at,
  created_at
FROM notifications;

DROP TABLE notifications;
ALTER TABLE notifications_v2 RENAME TO notifications;

CREATE INDEX idx_notifications_user_created
  ON notifications(user_id, created_at DESC);

CREATE INDEX idx_notifications_user_unread
  ON notifications(user_id, read_at);

CREATE TABLE moderation_decisions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  report_kind TEXT NOT NULL CHECK (
    report_kind IN ('listing', 'content')
  ),
  report_id INTEGER NOT NULL,
  moderator_id TEXT,
  reporter_id TEXT NOT NULL,
  reported_user_id TEXT NOT NULL,
  target_type TEXT NOT NULL CHECK (
    target_type IN ('listing', 'profile', 'message', 'review')
  ),
  target_id TEXT NOT NULL,
  decision TEXT NOT NULL CHECK (
    decision IN ('reviewed', 'dismissed', 'archived')
  ),
  justification TEXT NOT NULL CHECK (
    length(trim(justification)) BETWEEN 10 AND 1000
  ),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (moderator_id) REFERENCES "user"(id) ON DELETE SET NULL,
  UNIQUE (report_kind, report_id)
);

CREATE INDEX moderation_decisions_created_idx
  ON moderation_decisions(created_at DESC);

CREATE INDEX moderation_decisions_people_idx
  ON moderation_decisions(reporter_id, reported_user_id);

PRAGMA defer_foreign_keys = OFF;
