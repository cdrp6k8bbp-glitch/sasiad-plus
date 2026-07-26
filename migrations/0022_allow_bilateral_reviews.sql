PRAGMA defer_foreign_keys = on;

CREATE TABLE reviews_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reservation_id INTEGER NOT NULL,
  listing_id INTEGER NOT NULL,
  reviewer_id TEXT NOT NULL,
  reviewed_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (reservation_id, reviewer_id),
  FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE,
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewer_id) REFERENCES "user"(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_id) REFERENCES "user"(id) ON DELETE CASCADE
);

INSERT INTO reviews_new (
  id,
  reservation_id,
  listing_id,
  reviewer_id,
  reviewed_id,
  rating,
  body,
  created_at
)
SELECT
  id,
  reservation_id,
  listing_id,
  reviewer_id,
  reviewed_id,
  rating,
  body,
  created_at
FROM reviews;

DROP TABLE reviews;
ALTER TABLE reviews_new RENAME TO reviews;

CREATE INDEX reviews_reviewed_idx
ON reviews (reviewed_id, created_at);

PRAGMA defer_foreign_keys = off;
