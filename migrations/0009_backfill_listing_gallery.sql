UPDATE listings
SET image_keys = json_array(image_key)
WHERE image_key IS NOT NULL
  AND (image_keys IS NULL OR image_keys = '');
