-- ============================================================================
-- ALL MIGRATIONS COMPLETE - COPY-PASTE READY
-- ============================================================================
-- This file contains all migrations in order for easy copy-paste
-- Run this entire file in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- MIGRATION 1: DOCUMENT WORKFLOW (0032)
-- ============================================================================

BEGIN;

-- VOLUNTEER DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS volunteer_documents (
  id bigserial PRIMARY KEY,
  volunteer_id bigint REFERENCES volunteers(id) ON DELETE CASCADE,
  presentation_id bigint REFERENCES presentations(id) ON DELETE SET NULL,
  document_type text NOT NULL CHECK (document_type IN (
    'volunteer_signature_form',
    'teacher_signature_form',
    'hours_verification',
    'other'
  )),
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_size bigint,
  file_type text,
  status text DEFAULT 'pending' CHECK (status IN (
    'pending',
    'under_review',
    'approved',
    'rejected',
    'signed_by_founder',
    'completed'
  )),
  uploaded_by uuid REFERENCES users(id) ON DELETE SET NULL,
  uploaded_at timestamptz DEFAULT now(),
  reviewed_by uuid REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  signed_by uuid REFERENCES users(id) ON DELETE SET NULL,
  signed_at timestamptz,
  signed_document_url text,
  rejection_reason text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_volunteer_documents_volunteer ON volunteer_documents(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_documents_presentation ON volunteer_documents(presentation_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_documents_status ON volunteer_documents(status);
CREATE INDEX IF NOT EXISTS idx_volunteer_documents_uploaded ON volunteer_documents(uploaded_at DESC);

-- DOCUMENT TEMPLATES TABLE
CREATE TABLE IF NOT EXISTS document_templates (
  id bigserial PRIMARY KEY,
  template_name text NOT NULL,
  template_type text NOT NULL CHECK (template_type IN (
    'volunteer_signature_form',
    'teacher_signature_form',
    'hours_verification'
  )),
  file_url text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_document_templates_type ON document_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_document_templates_active ON document_templates(is_active);

-- ENHANCE PRESENTATIONS TABLE
ALTER TABLE presentations ADD COLUMN IF NOT EXISTS documents_required boolean DEFAULT true;
ALTER TABLE presentations ADD COLUMN IF NOT EXISTS documents_submitted boolean DEFAULT false;
ALTER TABLE presentations ADD COLUMN IF NOT EXISTS documents_approved boolean DEFAULT false;

-- TRIGGERS FOR UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_volunteer_documents_updated_at
  BEFORE UPDATE ON volunteer_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_document_templates_updated_at
  BEFORE UPDATE ON document_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- TRIGGER TO CREATE NOTIFICATIONS FOR DOCUMENT UPLOADS
CREATE OR REPLACE FUNCTION create_document_notification()
RETURNS TRIGGER AS $$
DECLARE
  founder_ids uuid[];
  volunteer_team_name text;
BEGIN
  SELECT team_name INTO volunteer_team_name FROM volunteers WHERE id = NEW.volunteer_id;
  
  SELECT ARRAY_AGG(id) INTO founder_ids FROM users WHERE role = 'founder';
  
  IF NEW.status = 'pending' AND founder_ids IS NOT NULL THEN
    INSERT INTO notifications (user_id, notification_type, title, message, action_url, related_id, related_type)
    SELECT 
      unnest(founder_ids),
      'presentation_submitted',
      'New Document Uploaded',
      volunteer_team_name || ' uploaded a ' || NEW.document_type || ' document',
      '/dashboard/founder/documents/pending',
      NEW.id,
      'volunteer_document'
    WHERE NOT EXISTS (
      SELECT 1 FROM user_notification_preferences 
      WHERE user_id = unnest(founder_ids) 
      AND (notification_types->>'presentation_submitted'->>'in_app')::boolean = false
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_document_notification
  AFTER INSERT ON volunteer_documents
  FOR EACH ROW
  EXECUTE FUNCTION create_document_notification();

-- RLS POLICIES FOR VOLUNTEER_DOCUMENTS
ALTER TABLE volunteer_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS volunteer_documents_team_read ON volunteer_documents;
CREATE POLICY volunteer_documents_team_read ON volunteer_documents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.user_id = auth.uid()
      AND tm.volunteer_team_id = volunteer_documents.volunteer_id
    )
  );

DROP POLICY IF EXISTS volunteer_documents_team_insert ON volunteer_documents;
CREATE POLICY volunteer_documents_team_insert ON volunteer_documents
  FOR INSERT
  WITH CHECK (
    uploaded_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.user_id = auth.uid()
      AND tm.volunteer_team_id = volunteer_documents.volunteer_id
    )
  );

DROP POLICY IF EXISTS volunteer_documents_staff_read ON volunteer_documents;
CREATE POLICY volunteer_documents_staff_read ON volunteer_documents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('founder', 'intern')
    )
  );

DROP POLICY IF EXISTS volunteer_documents_staff_update ON volunteer_documents;
CREATE POLICY volunteer_documents_staff_update ON volunteer_documents
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('founder', 'intern')
    )
  );

-- RLS POLICIES FOR DOCUMENT_TEMPLATES
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS document_templates_read ON document_templates;
CREATE POLICY document_templates_read ON document_templates
  FOR SELECT
  USING (is_active = true OR EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role IN ('founder', 'intern')
  ));

DROP POLICY IF EXISTS document_templates_manage ON document_templates;
CREATE POLICY document_templates_manage ON document_templates
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('founder', 'intern')
    )
  );

COMMENT ON TABLE volunteer_documents IS 'Documents uploaded by volunteers (signature forms, verification forms, etc.)';
COMMENT ON TABLE document_templates IS 'Templates for documents that volunteers need to print and fill out';
COMMENT ON COLUMN volunteer_documents.document_type IS 'Type of document: volunteer_signature_form, teacher_signature_form, hours_verification, other';
COMMENT ON COLUMN volunteer_documents.status IS 'Document status: pending, under_review, approved, rejected, signed_by_founder, completed';
COMMENT ON COLUMN volunteer_documents.signed_document_url IS 'URL to the final signed document (after founder signs)';

COMMIT;

-- ============================================================================
-- MIGRATION 2: ENHANCE WEBSITE BUILDER (0033)
-- ============================================================================

BEGIN;

-- ENHANCE PAGE_SECTIONS TABLE
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'page_sections' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE page_sections ADD COLUMN image_url text;
  END IF;
END $$;

COMMENT ON COLUMN page_sections.content IS 'JSONB content. For galleries: {"images": [{"id": "...", "url": "...", "alt": "...", "order": 0}]}';
COMMENT ON TABLE page_sections IS 'Website page sections with drag-and-drop editing support';
COMMENT ON COLUMN page_sections.settings IS 'JSONB settings: {backgroundColor, textColor, padding, layout}';
COMMENT ON COLUMN page_sections.content IS 'JSONB content varies by type. Gallery: {images: [...]}, Hero: {headline, subtitle, backgroundImage, ctaText, ctaLink}, Image: {imageUrl, altText}';

COMMIT;

-- ============================================================================
-- MIGRATION 3: COMPLETE SETUP (0034)
-- ============================================================================

BEGIN;

-- ADD DEPARTMENT COLUMN TO USERS
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'department'
  ) THEN
    ALTER TABLE users ADD COLUMN department text;
  END IF;
END $$;

-- ADD PRIORITY COLUMN TO INTERN_PROJECTS
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'intern_projects' AND column_name = 'priority'
  ) THEN
    ALTER TABLE intern_projects ADD COLUMN priority text DEFAULT 'medium';
  END IF;
END $$;

-- ADD ASSIGNED_TO AND CREATED_BY TO INTERN_PROJECTS
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'intern_projects' AND column_name = 'assigned_to'
  ) THEN
    ALTER TABLE intern_projects ADD COLUMN assigned_to uuid REFERENCES users(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'intern_projects' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE intern_projects ADD COLUMN created_by uuid REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- CREATE USER NOTIFICATION PREFERENCES TABLE
CREATE TABLE IF NOT EXISTS user_notification_preferences (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email_enabled boolean DEFAULT true,
  in_app_enabled boolean DEFAULT true,
  notification_types jsonb DEFAULT '{}'::jsonb,
  quiet_hours_start time,
  quiet_hours_end time,
  digest_frequency text DEFAULT 'immediate' CHECK (digest_frequency IN ('immediate', 'daily', 'weekly')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_notification_preferences_user ON user_notification_preferences(user_id);

-- TRIGGERS FOR UPDATED_AT
DROP TRIGGER IF EXISTS update_user_notification_preferences_updated_at ON user_notification_preferences;
CREATE TRIGGER update_user_notification_preferences_updated_at
  BEFORE UPDATE ON user_notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS POLICIES FOR USER_NOTIFICATION_PREFERENCES
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_notification_preferences_own ON user_notification_preferences;
CREATE POLICY user_notification_preferences_own ON user_notification_preferences
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- GRANT PERMISSIONS
UPDATE users 
SET permissions = '[
  "website.edit",
  "website.publish",
  "website.settings",
  "website.social",
  "content.edit",
  "content.create",
  "content.delete",
  "content.preview",
  "blog.create",
  "blog.edit",
  "blog.publish",
  "blog.delete",
  "media.upload",
  "media.delete",
  "media.public",
  "users.view",
  "users.create",
  "users.edit",
  "users.delete",
  "users.roles",
  "users.permissions",
  "volunteers.view",
  "volunteers.approve",
  "volunteers.forms",
  "presentations.view",
  "presentations.create",
  "presentations.edit",
  "presentations.delete",
  "analytics.view",
  "analytics.export",
  "documents.review",
  "documents.approve"
]'::jsonb
WHERE role = 'founder' AND (permissions IS NULL OR permissions = '[]'::jsonb);

UPDATE users 
SET permissions = '[
  "content.edit",
  "content.create",
  "content.preview",
  "blog.create",
  "blog.edit",
  "media.upload",
  "volunteers.view",
  "volunteers.approve",
  "volunteers.forms",
  "presentations.view",
  "presentations.create",
  "presentations.edit",
  "documents.review",
  "documents.approve"
]'::jsonb
WHERE role = 'intern' AND (permissions IS NULL OR permissions = '[]'::jsonb);

-- CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_intern_projects_assigned ON intern_projects(assigned_to);
CREATE INDEX IF NOT EXISTS idx_intern_projects_created ON intern_projects(created_by);
CREATE INDEX IF NOT EXISTS idx_intern_projects_status ON intern_projects(status);
CREATE INDEX IF NOT EXISTS idx_intern_projects_priority ON intern_projects(priority);
CREATE INDEX IF NOT EXISTS idx_intern_projects_due_date ON intern_projects(due_date);

COMMENT ON TABLE user_notification_preferences IS 'User notification preferences for email and in-app notifications';
COMMENT ON COLUMN user_notification_preferences.notification_types IS 'JSONB object with notification type keys and {email: boolean, in_app: boolean} values';
COMMENT ON COLUMN user_notification_preferences.digest_frequency IS 'How often to send notification digests: immediate, daily, or weekly';

COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES (Run these to verify setup)
-- ============================================================================

-- Check all tables exist
SELECT 'Tables Check' as check_type, table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'volunteer_documents',
  'document_templates',
  'user_notification_preferences',
  'notifications',
  'presentation_comments',
  'page_sections',
  'website_settings'
)
ORDER BY table_name;

-- Check key columns exist
SELECT 'Columns Check' as check_type, table_name, column_name, data_type
FROM information_schema.columns 
WHERE table_name IN ('volunteer_documents', 'user_notification_preferences', 'intern_projects')
AND column_name IN ('volunteer_id', 'document_type', 'status', 'user_id', 'email_enabled', 'assigned_to', 'priority')
ORDER BY table_name, ordinal_position;

-- Check indexes exist
SELECT 'Indexes Check' as check_type, indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('volunteer_documents', 'user_notification_preferences', 'intern_projects')
ORDER BY tablename, indexname;

-- ============================================================================
-- MIGRATION 4: ADVANCED PROGRESS TRACKING SYSTEM
-- ============================================================================

BEGIN;

-- Group milestones tracking table
CREATE TABLE IF NOT EXISTS group_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_team_id bigint REFERENCES volunteers(id) ON DELETE CASCADE,
  milestone_type text NOT NULL CHECK (milestone_type IN (
    'applied', 'group_chat_created', 'topic_selected', 'resources_viewed',
    'presentation_draft_created', 'presentation_submitted', 'review_completed',
    'presentation_scheduled', 'presentation_completed', 'hours_logged',
    'documents_uploaded', 'orientation_completed', 'fully_graduated'
  )),
  milestone_name text NOT NULL,
  description text,
  is_required boolean DEFAULT true,
  is_completed boolean DEFAULT false,
  completed_at timestamptz,
  completed_by uuid REFERENCES users(id) ON DELETE SET NULL,
  due_date timestamptz,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  notes text,
  progress_percentage integer DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Group progress analytics table
CREATE TABLE IF NOT EXISTS group_progress_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_team_id bigint REFERENCES volunteers(id) ON DELETE CASCADE,
  metric_type text NOT NULL CHECK (metric_type IN (
    'completion_time_estimate', 'engagement_score', 'activity_level',
    'communication_frequency', 'resource_usage', 'success_probability'
  )),
  metric_value numeric,
  metric_data jsonb DEFAULT '{}'::jsonb,
  calculated_at timestamptz DEFAULT now()
);

-- Automated workflow rules table
CREATE TABLE IF NOT EXISTS workflow_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name text NOT NULL,
  rule_description text,
  trigger_event text NOT NULL,
  trigger_conditions jsonb DEFAULT '{}'::jsonb,
  actions jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  priority integer DEFAULT 0,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Group checklist items table
CREATE TABLE IF NOT EXISTS group_checklist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_team_id bigint REFERENCES volunteers(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  item_description text,
  item_category text DEFAULT 'general' CHECK (item_category IN (
    'application', 'onboarding', 'preparation', 'presentation', 'followup', 'graduation'
  )),
  is_required boolean DEFAULT true,
  is_completed boolean DEFAULT false,
  completed_at timestamptz,
  completed_by uuid REFERENCES users(id) ON DELETE SET NULL,
  due_date timestamptz,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  order_index integer DEFAULT 0,
  help_resources jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Resource recommendations table
CREATE TABLE IF NOT EXISTS resource_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_team_id bigint REFERENCES volunteers(id) ON DELETE CASCADE,
  resource_type text NOT NULL CHECK (resource_type IN (
    'presentation_template', 'activity_guide', 'video_tutorial',
    'peer_example', 'founder_help', 'external_resource'
  )),
  resource_title text NOT NULL,
  resource_description text,
  resource_url text,
  resource_data jsonb DEFAULT '{}'::jsonb,
  relevance_score numeric DEFAULT 0 CHECK (relevance_score >= 0 AND relevance_score <= 1),
  is_viewed boolean DEFAULT false,
  viewed_at timestamptz,
  is_helpful boolean,
  created_at timestamptz DEFAULT now()
);

-- Progress notifications table
CREATE TABLE IF NOT EXISTS progress_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_team_id bigint REFERENCES volunteers(id) ON DELETE CASCADE,
  notification_type text NOT NULL CHECK (notification_type IN (
    'milestone_completed', 'deadline_approaching', 'group_stuck',
    'recommendation_available', 'founder_message', 'celebration'
  )),
  title text NOT NULL,
  message text NOT NULL,
  action_url text,
  action_text text,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  is_read boolean DEFAULT false,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE group_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_progress_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for group_milestones
DROP POLICY IF EXISTS "group_milestones_select" ON group_milestones;
CREATE POLICY "group_milestones_select" ON group_milestones
  FOR SELECT USING (
    volunteer_team_id IN (
      SELECT tm.volunteer_team_id FROM team_members tm WHERE tm.user_id = auth.uid()
    ) OR user_role() IN ('founder', 'intern')
  );

DROP POLICY IF EXISTS "group_milestones_insert" ON group_milestones;
CREATE POLICY "group_milestones_insert" ON group_milestones
  FOR INSERT WITH CHECK (user_role() IN ('founder', 'intern'));

DROP POLICY IF EXISTS "group_milestones_update" ON group_milestones;
CREATE POLICY "group_milestones_update" ON group_milestones
  FOR UPDATE USING (user_role() IN ('founder', 'intern'));

-- RLS Policies for group_checklist_items
DROP POLICY IF EXISTS "group_checklist_select" ON group_checklist_items;
CREATE POLICY "group_checklist_select" ON group_checklist_items
  FOR SELECT USING (
    volunteer_team_id IN (
      SELECT tm.volunteer_team_id FROM team_members tm WHERE tm.user_id = auth.uid()
    ) OR user_role() IN ('founder', 'intern')
  );

DROP POLICY IF EXISTS "group_checklist_update" ON group_checklist_items;
CREATE POLICY "group_checklist_update" ON group_checklist_items
  FOR UPDATE USING (
    volunteer_team_id IN (
      SELECT tm.volunteer_team_id FROM team_members tm WHERE tm.user_id = auth.uid()
    ) OR user_role() IN ('founder', 'intern')
  );

-- RLS Policies for resource_recommendations
DROP POLICY IF EXISTS "resource_recommendations_select" ON resource_recommendations;
CREATE POLICY "resource_recommendations_select" ON resource_recommendations
  FOR SELECT USING (
    volunteer_team_id IN (
      SELECT tm.volunteer_team_id FROM team_members tm WHERE tm.user_id = auth.uid()
    ) OR user_role() IN ('founder', 'intern')
  );

DROP POLICY IF EXISTS "resource_recommendations_insert" ON resource_recommendations;
CREATE POLICY "resource_recommendations_insert" ON resource_recommendations
  FOR INSERT WITH CHECK (user_role() IN ('founder', 'intern'));

DROP POLICY IF EXISTS "resource_recommendations_update" ON resource_recommendations;
CREATE POLICY "resource_recommendations_update" ON resource_recommendations
  FOR UPDATE USING (
    volunteer_team_id IN (
      SELECT tm.volunteer_team_id FROM team_members tm WHERE tm.user_id = auth.uid()
    ) OR user_role() IN ('founder', 'intern')
  );

-- RLS Policies for progress_notifications
DROP POLICY IF EXISTS "progress_notifications_select" ON progress_notifications;
CREATE POLICY "progress_notifications_select" ON progress_notifications
  FOR SELECT USING (
    volunteer_team_id IN (
      SELECT tm.volunteer_team_id FROM team_members tm WHERE tm.user_id = auth.uid()
    ) OR user_role() IN ('founder', 'intern')
  );

DROP POLICY IF EXISTS "progress_notifications_insert" ON progress_notifications;
CREATE POLICY "progress_notifications_insert" ON progress_notifications
  FOR INSERT WITH CHECK (user_role() IN ('founder', 'intern'));

DROP POLICY IF EXISTS "progress_notifications_update" ON progress_notifications;
CREATE POLICY "progress_notifications_update" ON progress_notifications
  FOR UPDATE USING (
    volunteer_team_id IN (
      SELECT tm.volunteer_team_id FROM team_members tm WHERE tm.user_id = auth.uid()
    ) OR user_role() IN ('founder', 'intern')
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_group_milestones_team ON group_milestones(volunteer_team_id);
CREATE INDEX IF NOT EXISTS idx_group_milestones_type ON group_milestones(milestone_type);
CREATE INDEX IF NOT EXISTS idx_group_milestones_completed ON group_milestones(is_completed);
CREATE INDEX IF NOT EXISTS idx_group_checklist_team ON group_checklist_items(volunteer_team_id);
CREATE INDEX IF NOT EXISTS idx_group_checklist_completed ON group_checklist_items(is_completed);
CREATE INDEX IF NOT EXISTS idx_resource_recommendations_team ON resource_recommendations(volunteer_team_id);
CREATE INDEX IF NOT EXISTS idx_progress_notifications_team ON progress_notifications(volunteer_team_id);
CREATE INDEX IF NOT EXISTS idx_progress_notifications_read ON progress_notifications(is_read);

COMMIT;

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================
-- Next steps:
-- 1. Create storage buckets in Supabase Dashboard:
--    - 'public-media' (PUBLIC access)
--    - 'documents' (PRIVATE access)
-- 2. Set up storage policies (see COMPLETE_SQL_SETUP.md)
-- 3. Test document upload functionality
-- 4. Run the new enhanced progress tracking features
-- ============================================================================

-- ============================================================================
-- MIGRATION 5: AI-POWERED FOUNDER ASSISTANT & ADVANCED ANALYTICS
-- ============================================================================

BEGIN;

-- AI insights and recommendations table
CREATE TABLE IF NOT EXISTS ai_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  insight_type text NOT NULL CHECK (insight_type IN (
    'stuck_groups', 'scheduling', 'recommendations', 'performance', 'predictions'
  )),
  target_id uuid, -- group_id, presentation_id, etc.
  insight_data jsonb NOT NULL,
  confidence_score numeric DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  generated_at timestamptz DEFAULT now(),
  expires_at timestamptz, -- insights expire and get refreshed
  created_at timestamptz DEFAULT now()
);

-- AI recommendations tracking
CREATE TABLE IF NOT EXISTS ai_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id bigint REFERENCES volunteers(id) ON DELETE CASCADE,
  recommendation_type text NOT NULL,
  title text NOT NULL,
  description text,
  action_url text,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  was_helpful boolean,
  clicked_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Search indexing for performance
CREATE TABLE IF NOT EXISTS search_index (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL, -- 'group', 'volunteer', 'presentation', 'school'
  entity_id uuid NOT NULL,
  search_text text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_index ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_insights (founders and interns only)
DROP POLICY IF EXISTS "ai_insights_access" ON ai_insights;
CREATE POLICY "ai_insights_access" ON ai_insights
  FOR ALL USING (user_role() IN ('founder', 'intern'));

-- RLS Policies for ai_recommendations
DROP POLICY IF EXISTS "ai_recommendations_select" ON ai_recommendations;
CREATE POLICY "ai_recommendations_select" ON ai_recommendations
  FOR SELECT USING (
    group_id IN (
      SELECT tm.volunteer_team_id FROM team_members tm WHERE tm.user_id = auth.uid()
    ) OR user_role() IN ('founder', 'intern')
  );

DROP POLICY IF EXISTS "ai_recommendations_insert" ON ai_recommendations;
CREATE POLICY "ai_recommendations_insert" ON ai_recommendations
  FOR INSERT WITH CHECK (user_role() IN ('founder', 'intern'));

DROP POLICY IF EXISTS "ai_recommendations_update" ON ai_recommendations;
CREATE POLICY "ai_recommendations_update" ON ai_recommendations
  FOR UPDATE USING (
    group_id IN (
      SELECT tm.volunteer_team_id FROM team_members tm WHERE tm.user_id = auth.uid()
    ) OR user_role() IN ('founder', 'intern')
  );

-- RLS Policies for search_index (all authenticated users can search)
DROP POLICY IF EXISTS "search_index_access" ON search_index;
CREATE POLICY "search_index_access" ON search_index
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_insights_type ON ai_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_ai_insights_target ON ai_insights(target_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_generated ON ai_insights(generated_at);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_group ON ai_recommendations(group_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_priority ON ai_recommendations(priority);
CREATE INDEX IF NOT EXISTS idx_search_index_type ON search_index(entity_type);
CREATE INDEX IF NOT EXISTS idx_search_index_text ON search_index USING gin(to_tsvector('english', search_text));
CREATE INDEX IF NOT EXISTS idx_search_index_entity ON search_index(entity_type, entity_id);

-- Function to update search index
CREATE OR REPLACE FUNCTION update_search_index()
RETURNS trigger AS $$
BEGIN
  -- Delete existing entries for this entity
  DELETE FROM search_index WHERE entity_type = TG_ARGV[0] AND entity_id = NEW.id::uuid;

  -- Insert new search entry
  INSERT INTO search_index (entity_type, entity_id, search_text, metadata, updated_at)
  VALUES (
    TG_ARGV[0],
    NEW.id::uuid,
    TG_ARGV[1], -- search text will be constructed by trigger caller
    jsonb_build_object('table', TG_TABLE_NAME),
    now()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMIT;

-- ============================================================================
-- END MIGRATION 5
-- ============================================================================

-- ============================================================================
-- MIGRATION 6: AI ADMINISTRATIVE CHAT & EXCLUSIVE EDITING LOCKS
-- ============================================================================

BEGIN;

-- ============================================================================
-- AI CHAT SYSTEM TABLES
-- ============================================================================

-- AI chat history and command execution log
CREATE TABLE IF NOT EXISTS ai_chat_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  session_id text NOT NULL, -- For grouping conversations
  message_type text NOT NULL CHECK (message_type IN ('user', 'ai', 'system', 'error')),
  message_content text NOT NULL,
  command_intent text, -- 'create', 'update', 'delete', 'query', 'send', 'report'
  command_entity text, -- 'school', 'volunteer', 'presentation', 'user', 'email'
  command_parameters jsonb DEFAULT '{}'::jsonb,
  execution_status text DEFAULT 'pending' CHECK (execution_status IN ('pending', 'executing', 'completed', 'failed')),
  execution_result jsonb DEFAULT '{}'::jsonb,
  execution_error text,
  confidence_score numeric DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  requires_confirmation boolean DEFAULT false,
  confirmed_by uuid REFERENCES users(id),
  confirmed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- EXCLUSIVE EDITING LOCKS SYSTEM
-- ============================================================================

-- Website editing locks table
CREATE TABLE IF NOT EXISTS edit_locks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id text NOT NULL, -- Identifier for what's being edited (e.g., 'homepage', 'about-page')
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  user_name text NOT NULL, -- Cached for performance
  locked_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '30 minutes'),
  last_activity timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  lock_type text DEFAULT 'exclusive' CHECK (lock_type IN ('exclusive', 'shared', 'readonly')),
  metadata jsonb DEFAULT '{}'::jsonb, -- Additional context (section, component, etc.)
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- ENABLE RLS AND CREATE POLICIES
-- ============================================================================

ALTER TABLE ai_chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE edit_locks ENABLE ROW LEVEL SECURITY;

-- AI Chat History Policies (founders and interns only)
DROP POLICY IF EXISTS "ai_chat_history_access" ON ai_chat_history;
CREATE POLICY "ai_chat_history_access" ON ai_chat_history
  FOR ALL USING (
    user_role() IN ('founder', 'intern') OR
    user_id = auth.uid()
  );

-- Edit Locks Policies
DROP POLICY IF EXISTS "edit_locks_read" ON edit_locks;
CREATE POLICY "edit_locks_read" ON edit_locks
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "edit_locks_write" ON edit_locks;
CREATE POLICY "edit_locks_write" ON edit_locks
  FOR ALL USING (
    user_role() IN ('founder', 'intern') OR
    user_id = auth.uid()
  );

-- ============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_ai_chat_history_user ON ai_chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_history_session ON ai_chat_history(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_history_created ON ai_chat_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_chat_history_intent ON ai_chat_history(command_intent);

CREATE INDEX IF NOT EXISTS idx_edit_locks_page ON edit_locks(page_id);
CREATE INDEX IF NOT EXISTS idx_edit_locks_user ON edit_locks(user_id);
CREATE INDEX IF NOT EXISTS idx_edit_locks_active ON edit_locks(is_active, expires_at);
CREATE INDEX IF NOT EXISTS idx_edit_locks_expires ON edit_locks(expires_at);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to clean up expired edit locks
CREATE OR REPLACE FUNCTION cleanup_expired_edit_locks()
RETURNS integer AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM edit_locks
  WHERE expires_at < now() OR (last_activity < (now() - interval '30 minutes') AND is_active = true);

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to check if a page is locked by someone else
CREATE OR REPLACE FUNCTION is_page_locked(page_id_param text, current_user_id uuid DEFAULT NULL)
RETURNS jsonb AS $$
DECLARE
  lock_record record;
  result jsonb;
BEGIN
  -- Clean up expired locks first
  PERFORM cleanup_expired_edit_locks();

  -- Find active lock for this page
  SELECT * INTO lock_record
  FROM edit_locks
  WHERE page_id = page_id_param
    AND is_active = true
    AND expires_at > now()
  ORDER BY locked_at DESC
  LIMIT 1;

  IF lock_record.id IS NULL THEN
    -- No active lock
    result := jsonb_build_object(
      'is_locked', false,
      'can_edit', true,
      'lock_info', null
    );
  ELSIF lock_record.user_id = current_user_id THEN
    -- Current user has the lock
    result := jsonb_build_object(
      'is_locked', true,
      'can_edit', true,
      'lock_info', jsonb_build_object(
        'user_name', lock_record.user_name,
        'locked_at', lock_record.locked_at,
        'is_current_user', true
      )
    );
  ELSE
    -- Someone else has the lock
    result := jsonb_build_object(
      'is_locked', true,
      'can_edit', false,
      'lock_info', jsonb_build_object(
        'user_name', lock_record.user_name,
        'user_id', lock_record.user_id,
        'locked_at', lock_record.locked_at,
        'is_current_user', false
      )
    );
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

COMMIT;

-- ============================================================================
-- END MIGRATION 6
-- ============================================================================

