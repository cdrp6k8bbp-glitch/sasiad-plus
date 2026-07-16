CREATE TABLE IF NOT EXISTS favorite_listings (
  user_id TEXT NOT NULL,
  listing_id INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, listing_id),
  FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE,
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS favorite_listings_user_id_idx
ON favorite_listings (user_id, created_at);

CREATE INDEX IF NOT EXISTS favorite_listings_listing_id_idx
ON favorite_listings (listing_id);
