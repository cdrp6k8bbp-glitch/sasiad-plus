CREATE TABLE IF NOT EXISTS email_deliveries (
  provider_message_id TEXT PRIMARY KEY,
  email_kind TEXT NOT NULL DEFAULT 'unknown',
  status TEXT NOT NULL,
  accepted_at TEXT,
  last_event_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS email_deliveries_status_updated_idx
ON email_deliveries (status, updated_at DESC);

CREATE TABLE IF NOT EXISTS email_delivery_events (
  provider_event_id TEXT PRIMARY KEY,
  provider_message_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  occurred_at TEXT NOT NULL,
  received_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS email_delivery_events_message_idx
ON email_delivery_events (provider_message_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS email_delivery_events_occurred_idx
ON email_delivery_events (occurred_at DESC);

CREATE TABLE IF NOT EXISTS operational_checks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  started_at TEXT NOT NULL,
  completed_at TEXT,
  status TEXT NOT NULL CHECK (
    status IN ('ok', 'warning', 'failed')
  ),
  summary TEXT,
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS operational_checks_started_idx
ON operational_checks (started_at DESC);
