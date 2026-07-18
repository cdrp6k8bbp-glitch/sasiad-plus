CREATE TABLE IF NOT EXISTS "rateLimit" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "key" TEXT NOT NULL UNIQUE,
  "count" INTEGER NOT NULL,
  "lastRequest" INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS "rateLimit_lastRequest_idx"
ON "rateLimit" ("lastRequest");
