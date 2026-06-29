-- 075_workspace_logos_allow_svg.sql
-- Allow SVG logos (vector, crisp on retina) and widen the size cap for
-- higher-resolution PNGs. SVGs are sanitized server-side before upload
-- (/api/workspace/logo) because workspace-logos is a public bucket.
update storage.buckets
set allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'],
    file_size_limit = 5242880  -- 5 MB
where id = 'workspace-logos';
