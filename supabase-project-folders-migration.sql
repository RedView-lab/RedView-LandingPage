-- ============================================================
-- RedView Project Folders Schema
-- Run after supabase-projects-migration.sql.
-- Safe to re-run: every statement is idempotent.
--
-- Depends on:
--   - public.handle_updated_at()  (created in supabase-migration.sql)
--   - public.projects             (created in supabase-projects-migration.sql)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.project_folders (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_folder_id  UUID        NULL REFERENCES public.project_folders(id) ON DELETE CASCADE,
  name              TEXT        NOT NULL DEFAULT 'Nouveau dossier',
  privacy           TEXT        NOT NULL DEFAULT 'private'
                    CHECK (privacy IN ('private', 'public')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_folders_user_id
  ON public.project_folders (user_id);

CREATE INDEX IF NOT EXISTS idx_project_folders_parent_folder_id
  ON public.project_folders (parent_folder_id);

CREATE INDEX IF NOT EXISTS idx_project_folders_user_parent_updated_at
  ON public.project_folders (user_id, parent_folder_id, updated_at DESC);

ALTER TABLE public.project_folders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own project folders" ON public.project_folders;
DROP POLICY IF EXISTS "Users can insert own project folders" ON public.project_folders;
DROP POLICY IF EXISTS "Users can update own project folders" ON public.project_folders;
DROP POLICY IF EXISTS "Users can delete own project folders" ON public.project_folders;

CREATE POLICY "Users can view own project folders"
  ON public.project_folders
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own project folders"
  ON public.project_folders
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND (
      parent_folder_id IS NULL
      OR EXISTS (
        SELECT 1
        FROM public.project_folders parent
        WHERE parent.id = parent_folder_id
          AND parent.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update own project folders"
  ON public.project_folders
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND (
      parent_folder_id IS NULL
      OR EXISTS (
        SELECT 1
        FROM public.project_folders parent
        WHERE parent.id = parent_folder_id
          AND parent.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete own project folders"
  ON public.project_folders
  FOR DELETE
  USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS set_project_folders_updated_at ON public.project_folders;
CREATE TRIGGER set_project_folders_updated_at
  BEFORE UPDATE ON public.project_folders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS folder_id UUID NULL REFERENCES public.project_folders(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_projects_folder_id
  ON public.projects (folder_id);

CREATE INDEX IF NOT EXISTS idx_projects_user_folder_updated_at
  ON public.projects (user_id, folder_id, updated_at DESC);

CREATE OR REPLACE FUNCTION public.delete_project_folder(target_folder_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  target_owner UUID;
  folder_has_projects BOOLEAN;
  folder_has_children BOOLEAN;
BEGIN
  SELECT user_id
  INTO target_owner
  FROM public.project_folders
  WHERE id = target_folder_id;

  IF target_owner IS NULL THEN
    RAISE EXCEPTION 'Project folder not found';
  END IF;

  IF target_owner <> auth.uid() THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.projects
    WHERE folder_id = target_folder_id
  ) INTO folder_has_projects;

  SELECT EXISTS (
    SELECT 1
    FROM public.project_folders
    WHERE parent_folder_id = target_folder_id
  ) INTO folder_has_children;

  IF folder_has_projects OR folder_has_children THEN
    RAISE EXCEPTION 'Folder is not empty';
  END IF;

  DELETE FROM public.project_folders
  WHERE id = target_folder_id
    AND user_id = auth.uid();
END;
$$;

CREATE OR REPLACE FUNCTION public.move_project_folder(
  target_folder_id UUID,
  next_parent_folder_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  target_owner UUID;
BEGIN
  SELECT user_id
  INTO target_owner
  FROM public.project_folders
  WHERE id = target_folder_id;

  IF target_owner IS NULL THEN
    RAISE EXCEPTION 'Project folder not found';
  END IF;

  IF target_owner <> auth.uid() THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  IF next_parent_folder_id IS NOT NULL THEN
    IF next_parent_folder_id = target_folder_id THEN
      RAISE EXCEPTION 'A folder cannot be its own parent';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM public.project_folders parent
      WHERE parent.id = next_parent_folder_id
        AND parent.user_id = auth.uid()
    ) THEN
      RAISE EXCEPTION 'Parent folder not found';
    END IF;

    IF EXISTS (
      WITH RECURSIVE descendants AS (
        SELECT id, parent_folder_id
        FROM public.project_folders
        WHERE parent_folder_id = target_folder_id

        UNION ALL

        SELECT child.id, child.parent_folder_id
        FROM public.project_folders child
        INNER JOIN descendants ON child.parent_folder_id = descendants.id
      )
      SELECT 1
      FROM descendants
      WHERE id = next_parent_folder_id
    ) THEN
      RAISE EXCEPTION 'Cannot move folder inside one of its descendants';
    END IF;
  END IF;

  UPDATE public.project_folders
  SET parent_folder_id = next_parent_folder_id
  WHERE id = target_folder_id
    AND user_id = auth.uid();
END;
$$;