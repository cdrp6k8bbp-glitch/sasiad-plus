CREATE TABLE IF NOT EXISTS listing_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  listing_id INTEGER NOT NULL,
  reporter_id TEXT NOT NULL,
  reason TEXT NOT NULL CHECK (
    reason IN ('spam', 'fraud', 'prohibited', 'misleading', 'other')
  ),
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'reviewed', 'dismissed')
  ),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
  FOREIGN KEY (reporter_id) REFERENCES "user"(id) ON DELETE CASCADE,
  UNIQUE (listing_id, reporter_id)
);

CREATE INDEX IF NOT EXISTS listing_reports_status_created_idx
ON listing_reports (status, created_at);

CREATE INDEX IF NOT EXISTS listing_reports_listing_id_idx
ON listing_reports (listing_id);
