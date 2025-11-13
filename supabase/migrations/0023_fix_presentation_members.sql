create extension if not exists pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'presentation_members'
  ) THEN
    EXECUTE '
      CREATE TABLE presentation_members (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        presentation_id uuid REFERENCES presentations(id) ON DELETE CASCADE,
        user_id uuid REFERENCES users(id) ON DELETE CASCADE,
        role text DEFAULT ''volunteer'',
        created_at timestamptz DEFAULT now(),
        UNIQUE (presentation_id, user_id)
      )
    ';
  ELSE
    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'presentation_members'
        AND column_name = 'id'
        AND data_type <> 'uuid'
    ) THEN
      EXECUTE 'ALTER TABLE presentation_members ALTER COLUMN id TYPE uuid USING (gen_random_uuid())';
      EXECUTE 'ALTER TABLE presentation_members ALTER COLUMN id SET DEFAULT gen_random_uuid()';
    ELSE
      EXECUTE 'ALTER TABLE presentation_members ALTER COLUMN id SET DEFAULT gen_random_uuid()';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'presentation_members'
        AND column_name = 'presentation_id'
        AND data_type <> 'uuid'
    ) THEN
      EXECUTE 'ALTER TABLE presentation_members ALTER COLUMN presentation_id TYPE uuid USING presentation_id::uuid';
    END IF;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'volunteer_hours'
      AND column_name = 'presentation_id'
      AND data_type <> 'uuid'
  ) THEN
    EXECUTE 'ALTER TABLE volunteer_hours ALTER COLUMN presentation_id TYPE uuid USING presentation_id::uuid';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'presentations'
      AND column_name = 'id'
      AND data_type <> 'uuid'
  ) THEN
    RAISE NOTICE 'Presentations table does not use UUID primary keys. Please adjust manually.';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'messages'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.messages';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'announcements'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'volunteer_hours'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.volunteer_hours';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'presentations'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.presentations';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'blog_posts'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.blog_posts';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'page_sections'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.page_sections';
  END IF;
END $$;

ALTER TABLE presentation_members
  DROP CONSTRAINT IF EXISTS presentation_members_presentation_id_fkey;

ALTER TABLE presentation_members
  ADD CONSTRAINT presentation_members_presentation_id_fkey
  FOREIGN KEY (presentation_id) REFERENCES presentations(id) ON DELETE CASCADE;
