ALTER TABLE listings
ADD COLUMN availability_weekdays TEXT NOT NULL DEFAULT '1,2,3,4,5,6,0';

ALTER TABLE listings
ADD COLUMN availability_start_time TEXT NOT NULL DEFAULT '00:00';

ALTER TABLE listings
ADD COLUMN availability_end_time TEXT NOT NULL DEFAULT '23:30';
