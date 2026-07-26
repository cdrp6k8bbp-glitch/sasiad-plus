CREATE TABLE IF NOT EXISTS content_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reporter_id TEXT NOT NULL,
  reported_user_id TEXT NOT NULL,
  target_type TEXT NOT NULL CHECK (
    target_type IN ('profile', 'message', 'review')
  ),
  target_id TEXT NOT NULL,
  reason TEXT NOT NULL CHECK (
    reason IN (
      'spam',
      'harassment',
      'fraud',
      'prohibited',
      'misleading',
      'hate',
      'privacy',
      'other'
    )
  ),
  details TEXT,
  content_snapshot TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'reviewed', 'dismissed')
  ),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (reporter_id) REFERENCES "user"(id) ON DELETE CASCADE,
  FOREIGN KEY (reported_user_id) REFERENCES "user"(id) ON DELETE CASCADE,
  UNIQUE (reporter_id, target_type, target_id)
);

CREATE INDEX IF NOT EXISTS content_reports_status_created_idx
ON content_reports (status, created_at);

CREATE INDEX IF NOT EXISTS content_reports_reported_user_idx
ON content_reports (reported_user_id, created_at);

CREATE INDEX IF NOT EXISTS content_reports_target_idx
ON content_reports (target_type, target_id);

CREATE TABLE IF NOT EXISTS user_blocks (
  blocker_id TEXT NOT NULL,
  blocked_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (blocker_id, blocked_id),
  FOREIGN KEY (blocker_id) REFERENCES "user"(id) ON DELETE CASCADE,
  FOREIGN KEY (blocked_id) REFERENCES "user"(id) ON DELETE CASCADE,
  CHECK (blocker_id != blocked_id)
);

CREATE INDEX IF NOT EXISTS user_blocks_blocked_id_idx
ON user_blocks (blocked_id, blocker_id);

CREATE TABLE IF NOT EXISTS action_rate_limits (
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  bucket INTEGER NOT NULL,
  count INTEGER NOT NULL DEFAULT 1 CHECK (count > 0),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, action, bucket),
  FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS action_rate_limits_updated_idx
ON action_rate_limits (updated_at);
