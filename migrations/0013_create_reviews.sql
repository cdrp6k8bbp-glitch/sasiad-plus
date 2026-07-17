ALTER TABLE reservations ADD COLUMN completed_at TEXT;

CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reservation_id INTEGER NOT NULL UNIQUE,
  listing_id INTEGER NOT NULL,
  reviewer_id TEXT NOT NULL,
  reviewed_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE,
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewer_id) REFERENCES "user"(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_id) REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS reviews_reviewed_idx
ON reviews (reviewed_id, created_at);
