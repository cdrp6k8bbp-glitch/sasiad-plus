ALTER TABLE listings ADD COLUMN owner_id TEXT;

CREATE INDEX IF NOT EXISTS listings_owner_id_idx
ON listings (owner_id);
