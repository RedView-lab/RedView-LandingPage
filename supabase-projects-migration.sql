-- ============================================================
-- RedView Projects Schema
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query).
-- Safe to re-run: every statement is idempotent.
--
-- Depends on:
--   - public.handle_updated_at()  (created in supabase-migration.sql)
-- ============================================================

-- 1. Projects table
--    One row per user-owned project. The full editor state lives in `data`
--    as JSONB so we can evolve the in-app schema without DB migrations.
CREATE TABLE IF NOT EXISTS public.projects (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL DEFAULT 'Nouveau projet',
  data        JSONB       NOT NULL DEFAULT '{}'::jsonb,
  size_bytes  INTEGER     NOT NULL DEFAULT 0,
  privacy     TEXT        NOT NULL DEFAULT 'private'
              CHECK (privacy IN ('private', 'public')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id
  ON public.projects (user_id);

CREATE INDEX IF NOT EXISTS idx_projects_user_updated_at
  ON public.projects (user_id, updated_at DESC);

-- 2. Row Level Security: a user can only touch their own rows.
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own projects"    ON public.projects;
DROP POLICY IF EXISTS "Users can insert own projects"  ON public.projects;
DROP POLICY IF EXISTS "Users can update own projects"  ON public.projects;
DROP POLICY IF EXISTS "Users can delete own projects"  ON public.projects;

CREATE POLICY "Users can view own projects"
  ON public.projects
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects"
  ON public.projects
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON public.projects
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON public.projects
  FOR DELETE
  USING (auth.uid() = user_id);

-- 3. updated_at trigger (re-uses the function defined in
--    supabase-migration.sql).
DROP TRIGGER IF EXISTS set_projects_updated_at ON public.projects;
CREATE TRIGGER set_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 4. Storage bucket for project thumbnails (private, owner-scoped).
--    The first INSERT silently no-ops if the bucket already exists.
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-thumbnails', 'project-thumbnails', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: thumbnails live under `<user_id>/<project_id>.png`
-- so the first folder segment must equal the caller's auth.uid().
DROP POLICY IF EXISTS "Users can read own project thumbnails"
  ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own project thumbnails"
  ON storage.objects;
DROP POLICY IF EXISTS "Users can update own project thumbnails"
  ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own project thumbnails"
  ON storage.objects;

CREATE POLICY "Users can read own project thumbnails"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'project-thumbnails'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can upload own project thumbnails"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'project-thumbnails'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own project thumbnails"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'project-thumbnails'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own project thumbnails"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'project-thumbnails'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
