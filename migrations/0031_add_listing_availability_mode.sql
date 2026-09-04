ALTER TABLE listings
ADD COLUMN availability_mode TEXT NOT NULL DEFAULT 'specific'
CHECK (availability_mode IN ('specific', 'flexible'));

ALTER TABLE listings
ADD COLUMN availability_note TEXT;
