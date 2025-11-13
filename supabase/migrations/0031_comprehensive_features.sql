-- ============================================================================
-- COMPREHENSIVE FEATURES MIGRATION
-- Migration: 0031_comprehensive_features.sql
-- Date: December 2024
-- Purpose: Add comment system, notifications, status tracking, and enhancements
-- ============================================================================

BEGIN;

-- ============================================================================
-- PRESENTATION COMMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS presentation_comments (
  id bigserial PRIMARY KEY,
  volunteer_id bigint REFERENCES volunteers(id) ON DELETE CASCADE,
  presentation_id bigint REFERENCES presentations(id) ON DELETE SET NULL,
  author_id uuid REFERENCES users(id) ON DELETE SET NULL,
  comment_type text DEFAULT 'update' CHECK (comment_type IN ('update', 'question', 'feedback', 'response', 'internal')),
  content text NOT NULL,
  is_internal boolean DEFAULT false, -- Internal notes vs. visible to volunteers
  parent_comment_id bigint REFERENCES presentation_comments(id) ON DELETE CASCADE, -- For replies
  attachments jsonb DEFAULT '[]'::jsonb, -- Links/files attached
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  read_by jsonb DEFAULT '[]'::jsonb -- Array of user IDs who read it
);

CREATE INDEX IF NOT EXISTS idx_presentation_comments_volunteer ON presentation_comments(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_presentation_comments_presentation ON presentation_comments(presentation_id);
CREATE INDEX IF NOT EXISTS idx_presentation_comments_author ON presentation_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_presentation_comments_parent ON presentation_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_presentation_comments_created ON presentation_comments(created_at DESC);

-- ============================================================================
-- NOTIFICATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  notification_type text NOT NULL CHECK (notification_type IN (
    'presentation_submitted',
    'presentation_updated',
    'comment_posted',
    'comment_reply',
    'hours_submitted',
    'hours_approved',
    'hours_rejected',
    'application_submitted',
    'application_approved',
    'application_rejected',
    'presentation_scheduled',
    'presentation_approved',
    'presentation_rejected',
    'task_assigned',
    'task_completed',
    'reminder'
  )),
  title text NOT NULL,
  message text NOT NULL,
  action_url text, -- URL to navigate to when clicked
  related_id bigint, -- ID of related record (presentation_id, volunteer_id, etc.)
  related_type text, -- Type of related record
  is_read boolean DEFAULT false,
  read_at timestamptz,
  created_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb -- Additional data
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(notification_type);

-- ============================================================================
-- PRESENTATION STATUS HISTORY TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS presentation_status_history (
  id bigserial PRIMARY KEY,
  presentation_id bigint REFERENCES presentations(id) ON DELETE CASCADE,
  old_status text,
  new_status text NOT NULL,
  changed_by uuid REFERENCES users(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_presentation_status_history_presentation ON presentation_status_history(presentation_id);
CREATE INDEX IF NOT EXISTS idx_presentation_status_history_created ON presentation_status_history(created_at DESC);

-- ============================================================================
-- VOLUNTEER STATUS HISTORY TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS volunteer_status_history (
  id bigserial PRIMARY KEY,
  volunteer_id bigint REFERENCES volunteers(id) ON DELETE CASCADE,
  old_status text,
  new_status text NOT NULL,
  changed_by uuid REFERENCES users(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_volunteer_status_history_volunteer ON volunteer_status_history(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_status_history_created ON volunteer_status_history(created_at DESC);

-- ============================================================================
-- APPLICATION STATUS HISTORY TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS application_status_history (
  id bigserial PRIMARY KEY,
  application_type text NOT NULL CHECK (application_type IN ('volunteer', 'intern', 'teacher')),
  application_id bigint NOT NULL, -- References volunteers.id, intern_applications.id, or schools.id
  old_status text,
  new_status text NOT NULL,
  changed_by uuid REFERENCES users(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_application_status_history_app ON application_status_history(application_type, application_id);
CREATE INDEX IF NOT EXISTS idx_application_status_history_created ON application_status_history(created_at DESC);

-- ============================================================================
-- USER NOTIFICATION PREFERENCES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_notification_preferences (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  email_enabled boolean DEFAULT true,
  in_app_enabled boolean DEFAULT true,
  notification_types jsonb DEFAULT '{}'::jsonb, -- { "hours_approved": { "email": true, "in_app": true }, ... }
  quiet_hours_start time,
  quiet_hours_end time,
  digest_frequency text DEFAULT 'immediate' CHECK (digest_frequency IN ('immediate', 'daily', 'weekly')),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- ENHANCE VOLUNTEERS TABLE
-- ============================================================================

ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS presentation_status text DEFAULT 'draft' CHECK (presentation_status IN (
  'draft',
  'submitted_for_review',
  'in_review',
  'needs_changes',
  'approved',
  'scheduled',
  'completed'
));

ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS last_comment_at timestamptz;
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS slides_shared boolean DEFAULT false;
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS slides_shared_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_volunteers_presentation_status ON volunteers(presentation_status);
CREATE INDEX IF NOT EXISTS idx_volunteers_last_comment ON volunteers(last_comment_at DESC);

-- ============================================================================
-- ENHANCE PRESENTATIONS TABLE
-- ============================================================================

ALTER TABLE presentations ADD COLUMN IF NOT EXISTS slides_url text;
ALTER TABLE presentations ADD COLUMN IF NOT EXISTS slides_shared boolean DEFAULT false;
ALTER TABLE presentations ADD COLUMN IF NOT EXISTS comment_count integer DEFAULT 0;
ALTER TABLE presentations ADD COLUMN IF NOT EXISTS last_comment_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_presentations_slides_shared ON presentations(slides_shared);
CREATE INDEX IF NOT EXISTS idx_presentations_last_comment ON presentations(last_comment_at DESC);

-- ============================================================================
-- ENHANCE VOLUNTEER_HOURS TABLE
-- ============================================================================

ALTER TABLE volunteer_hours ADD COLUMN IF NOT EXISTS rejection_reason text;
ALTER TABLE volunteer_hours ADD COLUMN IF NOT EXISTS approval_notes text;
ALTER TABLE volunteer_hours ADD COLUMN IF NOT EXISTS adjusted_hours numeric; -- If founder adjusts hours

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_presentation_comments_updated_at
  BEFORE UPDATE ON presentation_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TRIGGER TO UPDATE COMMENT COUNTS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_presentation_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE presentations
    SET comment_count = COALESCE(comment_count, 0) + 1,
        last_comment_at = NEW.created_at
    WHERE id = NEW.presentation_id;
    
    UPDATE volunteers
    SET last_comment_at = NEW.created_at
    WHERE id = NEW.volunteer_id;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE presentations
    SET comment_count = GREATEST(COALESCE(comment_count, 0) - 1, 0)
    WHERE id = OLD.presentation_id;
    
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_presentation_comment_count
  AFTER INSERT OR DELETE ON presentation_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_presentation_comment_count();

-- ============================================================================
-- TRIGGER TO CREATE NOTIFICATIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION create_comment_notification()
RETURNS TRIGGER AS $$
DECLARE
  volunteer_team_id_val bigint;
  founder_ids uuid[];
BEGIN
  -- Get volunteer team ID
  IF NEW.volunteer_id IS NOT NULL THEN
    SELECT id INTO volunteer_team_id_val FROM volunteers WHERE id = NEW.volunteer_id;
  ELSIF NEW.presentation_id IS NOT NULL THEN
    SELECT volunteer_team_id INTO volunteer_team_id_val FROM presentations WHERE id = NEW.presentation_id;
  END IF;
  
  -- Get all founder user IDs
  SELECT ARRAY_AGG(id) INTO founder_ids FROM users WHERE role = 'founder';
  
  -- Create notifications for founders (if comment is not internal)
  IF NEW.is_internal = false AND founder_ids IS NOT NULL THEN
    INSERT INTO notifications (user_id, notification_type, title, message, action_url, related_id, related_type)
    SELECT 
      unnest(founder_ids),
      CASE 
        WHEN NEW.comment_type = 'question' THEN 'comment_posted'
        WHEN NEW.parent_comment_id IS NOT NULL THEN 'comment_reply'
        ELSE 'comment_posted'
      END,
      CASE 
        WHEN NEW.parent_comment_id IS NOT NULL THEN 'New Reply to Comment'
        ELSE 'New Comment on Presentation'
      END,
      CASE 
        WHEN NEW.parent_comment_id IS NOT NULL THEN 'A volunteer replied to a comment'
        ELSE 'A volunteer posted a new comment'
      END,
      '/dashboard/founder/volunteers/' || NEW.volunteer_id || '/review',
      NEW.volunteer_id,
      'volunteer'
    WHERE NOT EXISTS (
      SELECT 1 FROM user_notification_preferences 
      WHERE user_id = unnest(founder_ids) 
      AND (notification_types->>'comment_posted'->>'in_app')::boolean = false
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_comment_notification
  AFTER INSERT ON presentation_comments
  FOR EACH ROW
  EXECUTE FUNCTION create_comment_notification();

-- ============================================================================
-- FUNCTION TO MARK NOTIFICATION AS READ
-- ============================================================================

CREATE OR REPLACE FUNCTION mark_notification_read(notification_id bigint, user_uuid uuid)
RETURNS void AS $$
BEGIN
  UPDATE notifications
  SET is_read = true,
      read_at = now()
  WHERE id = notification_id
    AND user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- RLS POLICIES FOR PRESENTATION_COMMENTS
-- ============================================================================

ALTER TABLE presentation_comments ENABLE ROW LEVEL SECURITY;

-- Volunteers can view non-internal comments for their team
CREATE POLICY presentation_comments_volunteer_read ON presentation_comments
  FOR SELECT
  USING (
    is_internal = false
    AND (
      EXISTS (
        SELECT 1 FROM team_members tm
        WHERE tm.user_id = auth.uid()
        AND tm.volunteer_team_id = presentation_comments.volunteer_id
      )
      OR author_id = auth.uid()
    )
  );

-- Volunteers can insert comments for their team
CREATE POLICY presentation_comments_volunteer_insert ON presentation_comments
  FOR INSERT
  WITH CHECK (
    author_id = auth.uid()
    AND (
      volunteer_id IS NULL
      OR EXISTS (
        SELECT 1 FROM team_members tm
        WHERE tm.user_id = auth.uid()
        AND tm.volunteer_team_id = presentation_comments.volunteer_id
      )
    )
  );

-- Founders/interns can view all comments
CREATE POLICY presentation_comments_staff_read ON presentation_comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('founder', 'intern')
    )
  );

-- Founders/interns can insert comments
CREATE POLICY presentation_comments_staff_insert ON presentation_comments
  FOR INSERT
  WITH CHECK (
    author_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('founder', 'intern')
    )
  );

-- Authors can update their own comments
CREATE POLICY presentation_comments_update ON presentation_comments
  FOR UPDATE
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

-- Founders/interns can delete any comment
CREATE POLICY presentation_comments_staff_delete ON presentation_comments
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('founder', 'intern')
    )
  );

-- ============================================================================
-- RLS POLICIES FOR NOTIFICATIONS
-- ============================================================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY notifications_user_read ON notifications
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY notifications_user_update ON notifications
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- System can insert notifications (via service role)
CREATE POLICY notifications_insert ON notifications
  FOR INSERT
  WITH CHECK (true); -- Controlled via application code

-- ============================================================================
-- RLS POLICIES FOR STATUS HISTORY TABLES
-- ============================================================================

ALTER TABLE presentation_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_status_history ENABLE ROW LEVEL SECURITY;

-- Founders/interns can view all status history
CREATE POLICY status_history_staff_read ON presentation_status_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('founder', 'intern')
    )
  );

CREATE POLICY volunteer_status_history_staff_read ON volunteer_status_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('founder', 'intern')
    )
  );

CREATE POLICY application_status_history_staff_read ON application_status_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('founder', 'intern')
    )
  );

-- Volunteers can view their own status history
CREATE POLICY volunteer_status_history_volunteer_read ON volunteer_status_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.user_id = auth.uid()
      AND tm.volunteer_team_id = volunteer_status_history.volunteer_id
    )
  );

-- ============================================================================
-- RLS POLICIES FOR USER NOTIFICATION PREFERENCES
-- ============================================================================

ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;

-- Users can view and update their own preferences
CREATE POLICY notification_preferences_user ON user_notification_preferences
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE presentation_comments IS 'Comment threads for presentations and volunteer teams';
COMMENT ON TABLE notifications IS 'In-app notifications for users';
COMMENT ON TABLE presentation_status_history IS 'Tracks status changes for presentations';
COMMENT ON TABLE volunteer_status_history IS 'Tracks status changes for volunteers';
COMMENT ON TABLE application_status_history IS 'Tracks status changes for all application types';
COMMENT ON TABLE user_notification_preferences IS 'User preferences for notification delivery';

COMMENT ON COLUMN presentation_comments.comment_type IS 'Type: update, question, feedback, response, or internal';
COMMENT ON COLUMN presentation_comments.is_internal IS 'If true, only founders/interns can see this comment';
COMMENT ON COLUMN presentation_comments.parent_comment_id IS 'For threaded replies';
COMMENT ON COLUMN notifications.action_url IS 'URL to navigate when notification is clicked';
COMMENT ON COLUMN volunteers.presentation_status IS 'Current status in presentation workflow';
COMMENT ON COLUMN volunteers.slides_shared IS 'Whether Google Slides has been shared with greensiliconvalley27@gmail.com';

COMMIT;

