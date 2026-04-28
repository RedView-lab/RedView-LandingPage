-- ============================================================
-- RedView Itinerary FIT Storage
-- Run this in Supabase SQL Editor after supabase-projects-migration.sql.
-- Safe to re-run: every statement is idempotent.
--
-- Purpose:
--   - store uploaded FIT files outside `public.projects.data`
--   - keep files private and owner-scoped
--   - path layout: <user_id>/<project_id>/<itinerary_id>--NN--filename.fit
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('itinerary-fit-files', 'itinerary-fit-files', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users can read own itinerary fit files"
  ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own itinerary fit files"
  ON storage.objects;
DROP POLICY IF EXISTS "Users can update own itinerary fit files"
  ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own itinerary fit files"
  ON storage.objects;

CREATE POLICY "Users can read own itinerary fit files"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'itinerary-fit-files'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can upload own itinerary fit files"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'itinerary-fit-files'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own itinerary fit files"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'itinerary-fit-files'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'itinerary-fit-files'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own itinerary fit files"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'itinerary-fit-files'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
