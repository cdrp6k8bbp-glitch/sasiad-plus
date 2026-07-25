ALTER TABLE reservations ADD COLUMN owner_completed_at TEXT;
ALTER TABLE reservations ADD COLUMN requester_completed_at TEXT;

UPDATE reservations
SET
  owner_completed_at = completed_at,
  requester_completed_at = completed_at
WHERE completed_at IS NOT NULL;
