-- Add calendar feed token to user_defaults for iCal subscription feeds
ALTER TABLE user_defaults ADD COLUMN calendar_feed_token text UNIQUE;
