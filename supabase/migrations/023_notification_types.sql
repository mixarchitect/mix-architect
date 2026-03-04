-- Add new notification types: audio_upload, collaborator_joined, export_complete
ALTER TABLE notifications DROP CONSTRAINT notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check
  CHECK (type IN (
    'comment',
    'portal_comment',
    'status_change',
    'payment_update',
    'approval',
    'audio_upload',
    'collaborator_joined',
    'export_complete'
  ));
