-- Add client_feedback email preference for portal approval/change-request notifications
ALTER TABLE email_preferences
  ADD COLUMN client_feedback boolean NOT NULL DEFAULT true;
