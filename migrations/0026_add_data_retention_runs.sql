CREATE TABLE IF NOT EXISTS data_retention_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  started_at TEXT NOT NULL,
  completed_at TEXT,
  status TEXT NOT NULL CHECK (
    status IN ('completed', 'failed')
  ),
  summary TEXT,
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS data_retention_runs_started_idx
ON data_retention_runs (started_at DESC);
