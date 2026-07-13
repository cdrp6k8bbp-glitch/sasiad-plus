CREATE TABLE IF NOT EXISTS listings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  price TEXT NOT NULL,
  location TEXT NOT NULL,
  icon TEXT DEFAULT '📦',
  created_at TEXT DEFAULT (datetime('now'))
);
