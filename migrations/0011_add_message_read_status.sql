ALTER TABLE messages ADD COLUMN read_at TEXT;

UPDATE messages
SET read_at = created_at
WHERE read_at IS NULL;

CREATE INDEX IF NOT EXISTS messages_unread_idx
ON messages (conversation_id, read_at, sender_id);
