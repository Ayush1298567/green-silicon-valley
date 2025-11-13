-- ============================================================================
-- VOLUNTEER ONBOARDING FLOW MIGRATION
-- Adds support for activity selection, topic resources, and group chat setup
-- ============================================================================

-- ============================================================================
-- PRESENTATION TOPICS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS presentation_topics (
  id bigserial PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  category text, -- 'renewable_energy', 'climate_change', 'pollution', 'ecosystems', 'water_conservation'
  icon_url text,
  color text, -- For UI display
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_presentation_topics_category ON presentation_topics(category);
CREATE INDEX IF NOT EXISTS idx_presentation_topics_active ON presentation_topics(is_active);

-- ============================================================================
-- TOPIC RESOURCES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS topic_resources (
  id bigserial PRIMARY KEY,
  topic_id bigint REFERENCES presentation_topics(id) ON DELETE CASCADE,
  resource_type text NOT NULL, -- 'base_presentation', 'activity_guide', 'rubric', 'example', 'document'
  title text NOT NULL,
  description text,
  file_url text, -- URL to file in storage or external link
  storage_path text, -- Path in Supabase Storage
  file_type text, -- 'slides', 'pdf', 'doc', 'link'
  is_required boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_topic_resources_topic ON topic_resources(topic_id);
CREATE INDEX IF NOT EXISTS idx_topic_resources_type ON topic_resources(resource_type);

-- ============================================================================
-- ENHANCE VOLUNTEERS TABLE
-- ============================================================================

-- Add selected topic
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS selected_topic_id bigint;
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS selected_topic_at timestamptz;

-- Add foreign key constraint for selected_topic_id if presentation_topics exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'presentation_topics') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'volunteers_selected_topic_id_fkey'
    ) THEN
      ALTER TABLE volunteers ADD CONSTRAINT volunteers_selected_topic_id_fkey 
        FOREIGN KEY (selected_topic_id) REFERENCES presentation_topics(id);
    END IF;
  END IF;
END $$;

-- Add group chat channel reference (conditional - only if channels table exists)
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS group_channel_id uuid;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'channels') THEN
    -- Add foreign key constraint if channels exists
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'volunteers_group_channel_id_fkey'
    ) THEN
      ALTER TABLE volunteers ADD CONSTRAINT volunteers_group_channel_id_fkey 
        FOREIGN KEY (group_channel_id) REFERENCES channels(id) ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

-- Add onboarding step tracking
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS onboarding_step text DEFAULT 'pending'; 
-- Values: 'pending', 'activity_selected', 'resources_viewed', 'group_chat_setup', 'presentation_created', 'submitted_for_review', 'approved', 'scheduled', 'completed'

-- Add presentation draft URL (Google Slides link)
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS presentation_draft_url text;

-- Add group member contact info (for group chat)
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS group_member_contacts jsonb DEFAULT '[]'::jsonb;
-- Array of {name, phone, email, added_to_chat: boolean}

CREATE INDEX IF NOT EXISTS idx_volunteers_selected_topic ON volunteers(selected_topic_id);
CREATE INDEX IF NOT EXISTS idx_volunteers_onboarding_step ON volunteers(onboarding_step);

-- ============================================================================
-- INSERT DEFAULT PRESENTATION TOPICS
-- ============================================================================

INSERT INTO presentation_topics (name, description, category, color, display_order) VALUES
  ('Renewable Energy', 'Explore solar, wind, and other renewable energy sources and their impact on the environment', 'renewable_energy', '#10b981', 1),
  ('Climate Change & Sustainability', 'Understand climate change causes, effects, and sustainable solutions', 'climate_change', '#3b82f6', 2),
  ('Pollution & Environmental Cleanup', 'Learn about different types of pollution and methods for environmental cleanup', 'pollution', '#ef4444', 3),
  ('Ecosystems & Biodiversity', 'Discover how ecosystems work and the importance of biodiversity', 'ecosystems', '#8b5cf6', 4),
  ('Water Conservation & Environmental Engineering', 'Explore water conservation techniques and environmental engineering solutions', 'water_conservation', '#06b6d4', 5)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE presentation_topics IS 'Available presentation topics/activities for volunteers to choose from';
COMMENT ON TABLE topic_resources IS 'Resources (presentations, guides, rubrics) associated with each topic';
COMMENT ON COLUMN volunteers.selected_topic_id IS 'The presentation topic/activity the volunteer group has chosen';
COMMENT ON COLUMN volunteers.group_channel_id IS 'Reference to the group chat channel for this volunteer team';
COMMENT ON COLUMN volunteers.onboarding_step IS 'Current step in the onboarding process';
COMMENT ON COLUMN volunteers.presentation_draft_url IS 'Link to Google Slides presentation draft';
COMMENT ON COLUMN volunteers.group_member_contacts IS 'Contact information for group members to add to group chat';

