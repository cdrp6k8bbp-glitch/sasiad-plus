-- The production schema was applied before Wrangler's migration ledger was
-- kept up to date. Run this only after verifying that every listed schema
-- change already exists in the target database.
INSERT OR IGNORE INTO d1_migrations (name) VALUES
  ('0002_add_listing_image.sql'),
  ('0003_add_subcategory.sql'),
  ('0004_add_listing_images.sql'),
  ('0006_better_auth.sql'),
  ('0007_add_listing_owner.sql'),
  ('0008_create_messages.sql'),
  ('0009_backfill_listing_gallery.sql'),
  ('0010_create_favorites.sql'),
  ('0011_add_message_read_status.sql'),
  ('0012_create_reservations.sql'),
  ('0013_create_reviews.sql'),
  ('0014_create_notifications.sql'),
  ('0015_create_user_profiles.sql'),
  ('0016_create_auth_rate_limit.sql'),
  ('0017_archive_listings.sql');
