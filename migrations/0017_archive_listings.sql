ALTER TABLE listings ADD COLUMN archived_at TEXT;

CREATE INDEX IF NOT EXISTS listings_archived_at_idx
ON listings (archived_at, created_at);
