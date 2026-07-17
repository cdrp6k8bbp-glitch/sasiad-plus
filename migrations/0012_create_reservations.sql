CREATE TABLE IF NOT EXISTS reservations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  listing_id INTEGER NOT NULL,
  requester_id TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
  FOREIGN KEY (requester_id) REFERENCES "user"(id) ON DELETE CASCADE,
  FOREIGN KEY (owner_id) REFERENCES "user"(id) ON DELETE CASCADE,
  CHECK (start_date <= end_date)
);

CREATE INDEX IF NOT EXISTS reservations_owner_idx
ON reservations (owner_id, status, created_at);

CREATE INDEX IF NOT EXISTS reservations_requester_idx
ON reservations (requester_id, status, created_at);

CREATE INDEX IF NOT EXISTS reservations_listing_dates_idx
ON reservations (listing_id, status, start_date, end_date);
