-- ============================================================================
-- TEAM MEMBER TRACKING MIGRATION
-- Links individual user accounts to volunteer teams
-- ============================================================================

-- Create team_members table to link users to volunteer teams
CREATE TABLE IF NOT EXISTS team_members (
  id bigserial PRIMARY KEY,
  volunteer_team_id bigint REFERENCES volunteers(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  member_name text NOT NULL,
  member_email text NOT NULL,
  member_phone text,
  member_highschool text,
  is_primary_contact boolean DEFAULT false,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(volunteer_team_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_team_members_volunteer ON team_members(volunteer_team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id);

-- Add team_id to presentations to track which team did the presentation
ALTER TABLE presentations ADD COLUMN IF NOT EXISTS volunteer_team_id bigint;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'volunteers') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'presentations_volunteer_team_id_fkey'
    ) THEN
      ALTER TABLE presentations ADD CONSTRAINT presentations_volunteer_team_id_fkey 
        FOREIGN KEY (volunteer_team_id) REFERENCES volunteers(id) ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_presentations_volunteer_team ON presentations(volunteer_team_id);

COMMENT ON TABLE team_members IS 'Links individual user accounts to their volunteer team';
COMMENT ON COLUMN presentations.volunteer_team_id IS 'The volunteer team that delivered this presentation';

