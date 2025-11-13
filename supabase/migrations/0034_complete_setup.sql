-- ============================================================================
-- COMPLETE SETUP MIGRATION
-- Migration: 0034_complete_setup.sql
-- Date: December 2024
-- Purpose: Complete setup for all features - copy-paste ready
-- ============================================================================

BEGIN;

-- ============================================================================
-- STEP 1: ENSURE ALL TABLES EXIST
-- ============================================================================

-- Add department column to users if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'department'
  ) THEN
    ALTER TABLE users ADD COLUMN department text;
  END IF;
END $$;

-- Add priority column to intern_projects if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'intern_projects' AND column_name = 'priority'
  ) THEN
    ALTER TABLE intern_projects ADD COLUMN priority text DEFAULT 'medium';
  END IF;
END $$;

-- Add assigned_to and created_by to intern_projects if they don't exist
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

-- ============================================================================
-- STEP 2: CREATE USER NOTIFICATION PREFERENCES TABLE
-- ============================================================================

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

-- ============================================================================
-- STEP 3: CREATE STORAGE BUCKETS (via SQL function)
-- ============================================================================

-- Note: Storage buckets must be created via Supabase Dashboard Storage section
-- This is a reminder/documentation of required buckets:
-- 1. 'public' - Public media files (images, documents) - PUBLIC
-- 2. 'documents' - Volunteer documents - PRIVATE with RLS
-- 
-- To create buckets manually:
-- Go to Supabase Dashboard > Storage > New Bucket
-- Create 'public' bucket with PUBLIC access
-- Create 'documents' bucket with PRIVATE access

-- ============================================================================
-- STEP 4: SETUP STORAGE POLICIES FOR DOCUMENTS BUCKET
-- ============================================================================

-- These policies will be created automatically when the bucket is created
-- But we document them here for reference:

-- Policy: Volunteers can upload documents
-- CREATE POLICY "Volunteers can upload documents" ON storage.objects
--   FOR INSERT WITH CHECK (
--     bucket_id = 'documents' AND
--     EXISTS (
--       SELECT 1 FROM team_members tm
--       WHERE tm.user_id = auth.uid()
--     )
--   );

-- Policy: Volunteers can view their own documents
-- CREATE POLICY "Volunteers can view own documents" ON storage.objects
--   FOR SELECT USING (
--     bucket_id = 'documents' AND
--     EXISTS (
--       SELECT 1 FROM volunteer_documents vd
--       JOIN team_members tm ON tm.volunteer_team_id = vd.volunteer_id
--       WHERE tm.user_id = auth.uid() AND vd.file_url LIKE '%' || (storage.objects.name) || '%'
--     )
--   );

-- Policy: Founders/interns can view all documents
-- CREATE POLICY "Staff can view all documents" ON storage.objects
--   FOR SELECT USING (
--     bucket_id = 'documents' AND
--     EXISTS (
--       SELECT 1 FROM users
--       WHERE id = auth.uid() AND role IN ('founder', 'intern')
--     )
--   );

-- ============================================================================
-- STEP 5: CREATE TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to user_notification_preferences
DROP TRIGGER IF EXISTS update_user_notification_preferences_updated_at ON user_notification_preferences;
CREATE TRIGGER update_user_notification_preferences_updated_at
  BEFORE UPDATE ON user_notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STEP 6: RLS POLICIES FOR USER_NOTIFICATION_PREFERENCES
-- ============================================================================

ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;

-- Users can view and update their own preferences
DROP POLICY IF EXISTS user_notification_preferences_own ON user_notification_preferences;
CREATE POLICY user_notification_preferences_own ON user_notification_preferences
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- STEP 7: GRANT PERMISSIONS
-- ============================================================================

-- Grant default permissions to founders (if not already granted)
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

-- Grant default permissions to interns
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

-- ============================================================================
-- STEP 8: CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_intern_projects_assigned ON intern_projects(assigned_to);
CREATE INDEX IF NOT EXISTS idx_intern_projects_created ON intern_projects(created_by);
CREATE INDEX IF NOT EXISTS idx_intern_projects_status ON intern_projects(status);
CREATE INDEX IF NOT EXISTS idx_intern_projects_priority ON intern_projects(priority);
CREATE INDEX IF NOT EXISTS idx_intern_projects_due_date ON intern_projects(due_date);

-- ============================================================================
-- STEP 9: COMMENTS
-- ============================================================================

COMMENT ON TABLE user_notification_preferences IS 'User notification preferences for email and in-app notifications';
COMMENT ON COLUMN user_notification_preferences.notification_types IS 'JSONB object with notification type keys and {email: boolean, in_app: boolean} values';
COMMENT ON COLUMN user_notification_preferences.digest_frequency IS 'How often to send notification digests: immediate, daily, or weekly';

COMMIT;

-- ============================================================================
-- POST-MIGRATION INSTRUCTIONS
-- ============================================================================

-- After running this migration:
-- 1. Go to Supabase Dashboard > Storage
-- 2. Create 'public' bucket (PUBLIC access)
-- 3. Create 'documents' bucket (PRIVATE access)
-- 4. Set up RLS policies for 'documents' bucket (see STEP 4 above)
-- 5. Verify all tables exist and have correct columns
-- 6. Test notification preferences functionality

