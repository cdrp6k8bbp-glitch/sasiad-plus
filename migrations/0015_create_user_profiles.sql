CREATE TABLE user_profiles (
  user_id TEXT PRIMARY KEY,
  city TEXT,
  bio TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE
);
