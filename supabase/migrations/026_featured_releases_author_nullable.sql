-- Make author_name nullable (previously NOT NULL DEFAULT 'Mix Architect')
ALTER TABLE featured_releases ALTER COLUMN author_name DROP NOT NULL;
ALTER TABLE featured_releases ALTER COLUMN author_name DROP DEFAULT;
