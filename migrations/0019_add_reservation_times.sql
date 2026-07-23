ALTER TABLE reservations
ADD COLUMN start_time TEXT NOT NULL DEFAULT '00:00';

ALTER TABLE reservations
ADD COLUMN end_time TEXT NOT NULL DEFAULT '23:59';

CREATE INDEX IF NOT EXISTS reservations_listing_schedule_idx
ON reservations (
  listing_id,
  status,
  start_date,
  start_time,
  end_date,
  end_time
);
