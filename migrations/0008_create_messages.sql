DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS conversations;

CREATE TABLE IF NOT EXISTS conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  listing_id INTEGER NOT NULL,
  buyer_id TEXT NOT NULL,
  seller_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
  UNIQUE (listing_id, buyer_id, seller_id)
);

CREATE INDEX IF NOT EXISTS conversations_buyer_id_idx
ON conversations (buyer_id);

CREATE INDEX IF NOT EXISTS conversations_seller_id_idx
ON conversations (seller_id);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id INTEGER NOT NULL,
  sender_id TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS messages_conversation_id_idx
ON messages (conversation_id, created_at);
