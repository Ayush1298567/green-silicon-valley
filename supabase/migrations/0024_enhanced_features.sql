-- Migration: Enhanced Features for Green Silicon Valley Platform
-- Features: Volunteer Tracking, Newsletter, Workflow, Calendar, Search, Documents, Gallery, Recognition, Analytics
-- Date: November 2025

-- ============================================================================
-- 1. ENHANCED VOLUNTEER TRACKING
-- ============================================================================

-- Add columns to volunteers table
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS join_date timestamptz DEFAULT now();
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS last_activity_date timestamptz;
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS chapter_id bigint REFERENCES chapters(id);
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS skills text[];
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS interests text[];
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS emergency_contact_name text;
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS emergency_contact_phone text;
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS performance_score numeric(5,2);
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS internal_notes text;
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS profile_photo_url text;

-- Volunteer activities table
CREATE TABLE IF NOT EXISTS volunteer_activities (
  id bigserial PRIMARY KEY,
  volunteer_id bigint REFERENCES volunteers(id) ON DELETE CASCADE,
  activity_type text NOT NULL, -- 'hours_logged', 'presentation', 'training', 'badge_earned', 'event'
  activity_data jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_volunteer_activities_volunteer ON volunteer_activities(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_activities_type ON volunteer_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_volunteer_activities_date ON volunteer_activities(created_at);

-- Volunteer notes table
CREATE TABLE IF NOT EXISTS volunteer_notes (
  id bigserial PRIMARY KEY,
  volunteer_id bigint REFERENCES volunteers(id) ON DELETE CASCADE,
  author_id uuid REFERENCES users(id),
  note_type text DEFAULT 'general', -- 'general', 'performance', 'disciplinary', 'recognition'
  content text NOT NULL,
  is_private boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_volunteer_notes_volunteer ON volunteer_notes(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_notes_author ON volunteer_notes(author_id);

-- Volunteer documents table
CREATE TABLE IF NOT EXISTS volunteer_documents (
  id bigserial PRIMARY KEY,
  volunteer_id bigint REFERENCES volunteers(id) ON DELETE CASCADE,
  document_type text NOT NULL, -- 'waiver', 'background_check', 'certification', 'other'
  filename text NOT NULL,
  file_url text NOT NULL,
  expiration_date date,
  uploaded_at timestamptz DEFAULT now(),
  uploaded_by uuid REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_volunteer_documents_volunteer ON volunteer_documents(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_documents_expiration ON volunteer_documents(expiration_date);

-- ============================================================================
-- 2. NEWSLETTER MARKETING SYSTEM
-- ============================================================================

-- Newsletter subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id bigserial PRIMARY KEY,
  email text UNIQUE NOT NULL,
  name text,
  status text DEFAULT 'active', -- 'active', 'unsubscribed', 'bounced'
  subscribed_at timestamptz DEFAULT now(),
  unsubscribed_at timestamptz,
  unsubscribe_reason text,
  source text DEFAULT 'website', -- 'website', 'manual', 'import'
  tags text[],
  custom_fields jsonb,
  last_email_sent_at timestamptz,
  last_email_opened_at timestamptz,
  last_email_clicked_at timestamptz,
  total_emails_sent integer DEFAULT 0,
  total_emails_opened integer DEFAULT 0,
  total_emails_clicked integer DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_status ON newsletter_subscribers(status);

-- Newsletter campaigns table
CREATE TABLE IF NOT EXISTS newsletter_campaigns (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  subject text NOT NULL,
  preview_text text,
  content_html text,
  content_text text,
  template_id bigint,
  status text DEFAULT 'draft', -- 'draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled'
  scheduled_for timestamptz,
  sent_at timestamptz,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  recipient_count integer DEFAULT 0,
  sent_count integer DEFAULT 0,
  delivered_count integer DEFAULT 0,
  opened_count integer DEFAULT 0,
  clicked_count integer DEFAULT 0,
  unsubscribed_count integer DEFAULT 0,
  bounced_count integer DEFAULT 0,
  recipient_selection jsonb -- filters/tags for recipients
);

CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_status ON newsletter_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_scheduled ON newsletter_campaigns(scheduled_for);

-- Newsletter templates table
CREATE TABLE IF NOT EXISTS newsletter_templates (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  description text,
  content_html text,
  content_text text,
  thumbnail_url text,
  is_system_template boolean DEFAULT false,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

-- Email tracking table
CREATE TABLE IF NOT EXISTS email_tracking (
  id bigserial PRIMARY KEY,
  campaign_id bigint REFERENCES newsletter_campaigns(id) ON DELETE CASCADE,
  subscriber_id bigint REFERENCES newsletter_subscribers(id) ON DELETE CASCADE,
  email_address text NOT NULL,
  event_type text NOT NULL, -- 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'unsubscribed'
  event_data jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_tracking_campaign ON email_tracking(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_tracking_subscriber ON email_tracking(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_email_tracking_event ON email_tracking(event_type);

-- Newsletter segments table
CREATE TABLE IF NOT EXISTS newsletter_segments (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  description text,
  filter_rules jsonb, -- criteria for segment
  subscriber_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 3. VOLUNTEER WORKFLOW & ONBOARDING
-- ============================================================================

-- Volunteer onboarding workflows table
CREATE TABLE IF NOT EXISTS volunteer_workflows (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  description text,
  steps jsonb NOT NULL, -- array of step definitions
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Volunteer onboarding progress table
CREATE TABLE IF NOT EXISTS volunteer_onboarding_progress (
  id bigserial PRIMARY KEY,
  volunteer_id bigint REFERENCES volunteers(id) ON DELETE CASCADE,
  workflow_id bigint REFERENCES volunteer_workflows(id),
  current_step integer DEFAULT 0,
  completed_steps jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'in_progress', -- 'in_progress', 'completed', 'paused', 'cancelled'
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  step_data jsonb -- data for each step
);

CREATE INDEX IF NOT EXISTS idx_onboarding_progress_volunteer ON volunteer_onboarding_progress(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_progress_status ON volunteer_onboarding_progress(status);

-- Orientation sessions table
CREATE TABLE IF NOT EXISTS orientation_sessions (
  id bigserial PRIMARY KEY,
  title text NOT NULL,
  description text,
  scheduled_date timestamptz NOT NULL,
  location text, -- physical or virtual link
  capacity integer,
  registered_count integer DEFAULT 0,
  is_required boolean DEFAULT true,
  materials_url text,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orientation_sessions_date ON orientation_sessions(scheduled_date);

-- Orientation registrations table
CREATE TABLE IF NOT EXISTS orientation_registrations (
  id bigserial PRIMARY KEY,
  session_id bigint REFERENCES orientation_sessions(id) ON DELETE CASCADE,
  volunteer_id bigint REFERENCES volunteers(id) ON DELETE CASCADE,
  status text DEFAULT 'registered', -- 'registered', 'attended', 'no_show', 'cancelled'
  registered_at timestamptz DEFAULT now(),
  attended_at timestamptz,
  UNIQUE(session_id, volunteer_id)
);

-- Training modules table
CREATE TABLE IF NOT EXISTS training_modules (
  id bigserial PRIMARY KEY,
  title text NOT NULL,
  description text,
  content_html text,
  video_url text,
  documents jsonb DEFAULT '[]'::jsonb,
  quiz_data jsonb, -- quiz questions and answers
  completion_criteria text DEFAULT 'view', -- 'view', 'quiz_pass', 'time_spent'
  prerequisites bigint[], -- array of module IDs
  estimated_duration integer, -- minutes
  is_required boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Training progress table
CREATE TABLE IF NOT EXISTS training_progress (
  id bigserial PRIMARY KEY,
  volunteer_id bigint REFERENCES volunteers(id) ON DELETE CASCADE,
  module_id bigint REFERENCES training_modules(id) ON DELETE CASCADE,
  status text DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed', 'failed'
  progress_percent integer DEFAULT 0,
  started_at timestamptz,
  completed_at timestamptz,
  quiz_score numeric(5,2),
  time_spent integer DEFAULT 0, -- minutes
  UNIQUE(volunteer_id, module_id)
);

CREATE INDEX IF NOT EXISTS idx_training_progress_volunteer ON training_progress(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_training_progress_status ON training_progress(status);

-- Volunteer applications table
CREATE TABLE IF NOT EXISTS volunteer_applications (
  id bigserial PRIMARY KEY,
  volunteer_id bigint REFERENCES volunteers(id) ON DELETE CASCADE,
  application_data jsonb, -- form responses
  status text DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'on_hold'
  reviewed_by uuid REFERENCES users(id),
  reviewed_at timestamptz,
  review_notes text,
  submitted_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_volunteer_applications_status ON volunteer_applications(status);
CREATE INDEX IF NOT EXISTS idx_volunteer_applications_submitted ON volunteer_applications(submitted_at);

-- ============================================================================
-- 4. CALENDAR VIEW
-- ============================================================================

-- Events table (unified)
CREATE TABLE IF NOT EXISTS events (
  id bigserial PRIMARY KEY,
  event_type text NOT NULL, -- 'presentation', 'orientation', 'meeting', 'event', 'deadline'
  title text NOT NULL,
  description text,
  start_date timestamptz NOT NULL,
  end_date timestamptz,
  all_day boolean DEFAULT false,
  location text,
  location_type text DEFAULT 'physical', -- 'physical', 'virtual', 'hybrid'
  virtual_link text,
  status text DEFAULT 'scheduled', -- 'scheduled', 'confirmed', 'completed', 'cancelled'
  color text, -- for calendar display
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  related_id bigint, -- ID of related record (presentation_id, orientation_id, etc.)
  recurrence_rule text, -- RRULE format for recurring events
  reminder_minutes integer[], -- array of reminder times in minutes before event
  metadata jsonb -- additional event-specific data
);

CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);

-- Event attendees table
CREATE TABLE IF NOT EXISTS event_attendees (
  id bigserial PRIMARY KEY,
  event_id bigint REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id),
  volunteer_id bigint REFERENCES volunteers(id),
  role text DEFAULT 'attendee', -- 'organizer', 'attendee', 'optional'
  status text DEFAULT 'invited', -- 'invited', 'accepted', 'declined', 'tentative'
  response_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(event_id, COALESCE(user_id::text, volunteer_id::text))
);

CREATE INDEX IF NOT EXISTS idx_event_attendees_event ON event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_user ON event_attendees(user_id);

-- Calendar subscriptions table
CREATE TABLE IF NOT EXISTS calendar_subscriptions (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  calendar_type text NOT NULL, -- 'google', 'ical'
  external_calendar_id text,
  sync_token text,
  last_synced_at timestamptz,
  sync_direction text DEFAULT 'both', -- 'import', 'export', 'both'
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 5. SITE-WIDE SEARCH
-- ============================================================================

-- Search index table (for full-text search)
CREATE TABLE IF NOT EXISTS search_index (
  id bigserial PRIMARY KEY,
  content_type text NOT NULL, -- 'blog_post', 'user', 'presentation', etc.
  content_id text NOT NULL, -- ID of the content
  title text,
  content text,
  tags text[],
  metadata jsonb,
  search_vector tsvector, -- PostgreSQL full-text search vector
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(content_type, content_id)
);

-- Create GIN index for fast full-text search
CREATE INDEX IF NOT EXISTS idx_search_vector ON search_index USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_search_content_type ON search_index(content_type);
CREATE INDEX IF NOT EXISTS idx_search_content_id ON search_index(content_id);

-- Search history table
CREATE TABLE IF NOT EXISTS search_history (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  query text NOT NULL,
  results_count integer,
  clicked_result_id bigint REFERENCES search_index(id),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_search_history_user ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_query ON search_history(query);

-- Function to update search vector
CREATE OR REPLACE FUNCTION update_search_vector() RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'B') ||
    setweight(to_tsvector('english', array_to_string(COALESCE(NEW.tags, ARRAY[]::text[]), ' ')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update search vector
CREATE TRIGGER search_vector_update BEFORE INSERT OR UPDATE ON search_index
FOR EACH ROW EXECUTE FUNCTION update_search_vector();

-- ============================================================================
-- 6. DOCUMENT MANAGEMENT
-- ============================================================================

-- Document folders table
CREATE TABLE IF NOT EXISTS document_folders (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  parent_id bigint REFERENCES document_folders(id) ON DELETE CASCADE,
  description text,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_document_folders_parent ON document_folders(parent_id);

-- Enhanced documents table (extends resources)
CREATE TABLE IF NOT EXISTS documents (
  id bigserial PRIMARY KEY,
  filename text NOT NULL,
  original_filename text,
  file_type text,
  file_size bigint, -- bytes
  folder_id bigint REFERENCES document_folders(id),
  storage_path text NOT NULL, -- Supabase Storage path
  thumbnail_url text,
  description text,
  tags text[],
  category text,
  is_public boolean DEFAULT false,
  access_level text DEFAULT 'private', -- 'private', 'team', 'role', 'public'
  uploaded_by uuid REFERENCES users(id),
  uploaded_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  download_count integer DEFAULT 0,
  view_count integer DEFAULT 0,
  version integer DEFAULT 1,
  parent_version_id bigint REFERENCES documents(id), -- for versioning
  metadata jsonb
);

CREATE INDEX IF NOT EXISTS idx_documents_folder ON documents(folder_id);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_documents_tags ON documents USING gin(tags);

-- Document permissions table
CREATE TABLE IF NOT EXISTS document_permissions (
  id bigserial PRIMARY KEY,
  document_id bigint REFERENCES documents(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id),
  role text,
  permission_type text NOT NULL, -- 'view', 'download', 'edit', 'delete', 'share'
  granted_by uuid REFERENCES users(id),
  granted_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_document_permissions_doc ON document_permissions(document_id);
CREATE INDEX IF NOT EXISTS idx_document_permissions_user ON document_permissions(user_id);

-- Document shares table
CREATE TABLE IF NOT EXISTS document_shares (
  id bigserial PRIMARY KEY,
  document_id bigint REFERENCES documents(id) ON DELETE CASCADE,
  share_token text UNIQUE NOT NULL,
  shared_by uuid REFERENCES users(id),
  share_type text NOT NULL, -- 'user', 'role', 'public_link'
  recipient_id uuid REFERENCES users(id),
  recipient_role text,
  expires_at timestamptz,
  password_hash text,
  access_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_document_shares_token ON document_shares(share_token);
CREATE INDEX IF NOT EXISTS idx_document_shares_doc ON document_shares(document_id);

-- Document versions table
CREATE TABLE IF NOT EXISTS document_versions (
  id bigserial PRIMARY KEY,
  document_id bigint REFERENCES documents(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  filename text,
  file_size bigint,
  storage_path text,
  uploaded_by uuid REFERENCES users(id),
  version_notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(document_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_document_versions_doc ON document_versions(document_id);

-- ============================================================================
-- 7. PHOTO GALLERY MANAGEMENT
-- ============================================================================

-- Photo albums table
CREATE TABLE IF NOT EXISTS photo_albums (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  description text,
  cover_photo_id bigint,
  is_public boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  event_id bigint,
  presentation_id bigint REFERENCES presentations(id),
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_photo_albums_presentation ON photo_albums(presentation_id);
CREATE INDEX IF NOT EXISTS idx_photo_albums_featured ON photo_albums(is_featured);

-- Photos table
CREATE TABLE IF NOT EXISTS photos (
  id bigserial PRIMARY KEY,
  filename text NOT NULL,
  original_filename text,
  storage_path text NOT NULL,
  thumbnail_path text,
  album_id bigint REFERENCES photo_albums(id) ON DELETE SET NULL,
  caption text,
  tags text[],
  location text,
  date_taken timestamptz,
  exif_data jsonb,
  width integer,
  height integer,
  file_size bigint,
  is_public boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  view_count integer DEFAULT 0,
  download_count integer DEFAULT 0,
  uploaded_by uuid REFERENCES users(id),
  uploaded_at timestamptz DEFAULT now(),
  display_order integer DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_photos_album ON photos(album_id);
CREATE INDEX IF NOT EXISTS idx_photos_featured ON photos(is_featured);
CREATE INDEX IF NOT EXISTS idx_photos_tags ON photos USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_photos_public ON photos(is_public);

-- Add foreign key for cover_photo_id after photos table exists
ALTER TABLE photo_albums ADD CONSTRAINT fk_cover_photo 
  FOREIGN KEY (cover_photo_id) REFERENCES photos(id) ON DELETE SET NULL;

-- Photo tags table (for tag management)
CREATE TABLE IF NOT EXISTS photo_tags (
  id bigserial PRIMARY KEY,
  name text UNIQUE NOT NULL,
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 8. VOLUNTEER RECOGNITION & BADGES
-- ============================================================================

-- Badges table
CREATE TABLE IF NOT EXISTS badges (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  description text,
  icon_url text,
  badge_type text NOT NULL, -- 'hours', 'presentations', 'special', 'custom'
  criteria jsonb, -- criteria for earning badge
  rarity text DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_badges_type ON badges(badge_type);
CREATE INDEX IF NOT EXISTS idx_badges_active ON badges(is_active);

-- Volunteer badges table
CREATE TABLE IF NOT EXISTS volunteer_badges (
  id bigserial PRIMARY KEY,
  volunteer_id bigint REFERENCES volunteers(id) ON DELETE CASCADE,
  badge_id bigint REFERENCES badges(id) ON DELETE CASCADE,
  earned_at timestamptz DEFAULT now(),
  awarded_by uuid REFERENCES users(id), -- null if auto-awarded
  notes text,
  UNIQUE(volunteer_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_volunteer_badges_volunteer ON volunteer_badges(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_badges_badge ON volunteer_badges(badge_id);

-- Certificates table
CREATE TABLE IF NOT EXISTS certificates (
  id bigserial PRIMARY KEY,
  volunteer_id bigint REFERENCES volunteers(id) ON DELETE CASCADE,
  certificate_type text NOT NULL, -- 'hours', 'training', 'presentation', 'achievement'
  title text NOT NULL,
  description text,
  template_id bigint,
  pdf_url text,
  issued_at timestamptz DEFAULT now(),
  issued_by uuid REFERENCES users(id),
  expires_at timestamptz -- null if no expiration
);

CREATE INDEX IF NOT EXISTS idx_certificates_volunteer ON certificates(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_certificates_type ON certificates(certificate_type);

-- Leaderboard entries table (for caching)
CREATE TABLE IF NOT EXISTS leaderboard_entries (
  id bigserial PRIMARY KEY,
  leaderboard_type text NOT NULL, -- 'hours_all_time', 'hours_monthly', etc.
  volunteer_id bigint REFERENCES volunteers(id) ON DELETE CASCADE,
  rank integer,
  score numeric, -- hours, presentations, points, etc.
  period_start date,
  period_end date,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(leaderboard_type, volunteer_id, period_start)
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_type_period ON leaderboard_entries(leaderboard_type, period_start);
CREATE INDEX IF NOT EXISTS idx_leaderboard_rank ON leaderboard_entries(leaderboard_type, rank);

-- Volunteer of the month table
CREATE TABLE IF NOT EXISTS volunteer_of_month (
  id bigserial PRIMARY KEY,
  volunteer_id bigint REFERENCES volunteers(id),
  month date NOT NULL, -- first day of month
  reason text,
  featured_image_url text,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(month)
);

CREATE INDEX IF NOT EXISTS idx_volunteer_of_month_month ON volunteer_of_month(month);

-- ============================================================================
-- 9. ADVANCED ANALYTICS
-- ============================================================================

-- Analytics cache table (for performance)
CREATE TABLE IF NOT EXISTS analytics_cache (
  id bigserial PRIMARY KEY,
  metric_key text NOT NULL,
  metric_value jsonb,
  period_start date,
  period_end date,
  calculated_at timestamptz DEFAULT now(),
  UNIQUE(metric_key, period_start, period_end)
);

CREATE INDEX IF NOT EXISTS idx_analytics_cache_key ON analytics_cache(metric_key);
CREATE INDEX IF NOT EXISTS idx_analytics_cache_period ON analytics_cache(period_start, period_end);

-- Custom reports table
CREATE TABLE IF NOT EXISTS custom_reports (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  description text,
  report_config jsonb NOT NULL, -- report definition
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_template boolean DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_custom_reports_created_by ON custom_reports(created_by);

-- Scheduled reports table
CREATE TABLE IF NOT EXISTS scheduled_reports (
  id bigserial PRIMARY KEY,
  report_id bigint REFERENCES custom_reports(id) ON DELETE CASCADE,
  schedule_type text NOT NULL, -- 'daily', 'weekly', 'monthly', 'custom'
  schedule_config jsonb, -- cron expression or schedule details
  recipients text[], -- email addresses
  format text DEFAULT 'pdf', -- 'pdf', 'csv', 'excel'
  is_active boolean DEFAULT true,
  last_sent_at timestamptz,
  next_send_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scheduled_reports_active ON scheduled_reports(is_active);
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_next_send ON scheduled_reports(next_send_at);

-- Analytics events table (for tracking)
CREATE TABLE IF NOT EXISTS analytics_events (
  id bigserial PRIMARY KEY,
  event_type text NOT NULL,
  event_data jsonb,
  user_id uuid REFERENCES users(id),
  session_id text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_date ON analytics_events(created_at);

-- ============================================================================
-- DEFAULT DATA & INITIALIZATION
-- ============================================================================

-- Insert default badges
INSERT INTO badges (name, description, badge_type, criteria, rarity) VALUES
  ('Getting Started', 'Completed first 10 volunteer hours', 'hours', '{"hours": 10}', 'common'),
  ('Dedicated Volunteer', 'Completed 25 volunteer hours', 'hours', '{"hours": 25}', 'common'),
  ('Community Leader', 'Completed 50 volunteer hours', 'hours', '{"hours": 50}', 'rare'),
  ('Impact Champion', 'Completed 100 volunteer hours', 'hours', '{"hours": 100}', 'epic'),
  ('First Presentation', 'Completed first presentation', 'presentations', '{"presentations": 1}', 'common'),
  ('Presentation Pro', 'Completed 10 presentations', 'presentations', '{"presentations": 10}', 'rare'),
  ('Presentation Master', 'Completed 25 presentations', 'presentations', '{"presentations": 25}', 'epic')
ON CONFLICT DO NOTHING;

-- Insert default newsletter templates (basic structure)
INSERT INTO newsletter_templates (name, description, is_system_template, content_html) VALUES
  ('Monthly Newsletter', 'Standard monthly update template', true, '<html><body><h1>Monthly Update</h1><p>Content goes here</p></body></html>'),
  ('Event Announcement', 'Template for announcing events', true, '<html><body><h1>Event Announcement</h1><p>Event details</p></body></html>'),
  ('Volunteer Spotlight', 'Template for featuring volunteers', true, '<html><body><h1>Volunteer Spotlight</h1><p>Volunteer story</p></body></html>')
ON CONFLICT DO NOTHING;

-- Insert default document folders
INSERT INTO document_folders (name, description) VALUES
  ('Presentations', 'Presentation materials and templates'),
  ('Training Materials', 'Training resources and guides'),
  ('Policies & Procedures', 'Organizational policies'),
  ('Forms & Templates', 'Reusable forms and templates'),
  ('Reports', 'Generated reports and analytics'),
  ('Public Documents', 'Publicly accessible documents')
ON CONFLICT DO NOTHING;

-- Insert default volunteer workflow
INSERT INTO volunteer_workflows (name, description, steps, is_active) VALUES
  ('Default Onboarding', 'Standard volunteer onboarding process', 
   '[
     {"step": 1, "name": "Application Submitted", "type": "form", "required": true},
     {"step": 2, "name": "Application Reviewed", "type": "approval", "required": true},
     {"step": 3, "name": "Background Check", "type": "document", "required": true},
     {"step": 4, "name": "Waiver Signed", "type": "document", "required": true},
     {"step": 5, "name": "Orientation Scheduled", "type": "event", "required": true},
     {"step": 6, "name": "Orientation Completed", "type": "event_attendance", "required": true},
     {"step": 7, "name": "Training Assigned", "type": "training", "required": true},
     {"step": 8, "name": "Training Completed", "type": "training_completion", "required": true},
     {"step": 9, "name": "First Presentation", "type": "presentation", "required": false},
     {"step": 10, "name": "Active Volunteer", "type": "status_change", "required": true}
   ]'::jsonb,
   true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE volunteer_activities IS 'Tracks all volunteer activities for timeline and analytics';
COMMENT ON TABLE volunteer_notes IS 'Private and public notes about volunteers';
COMMENT ON TABLE volunteer_documents IS 'Documents uploaded by or for volunteers (waivers, background checks, etc.)';
COMMENT ON TABLE newsletter_subscribers IS 'Newsletter subscriber list with engagement tracking';
COMMENT ON TABLE newsletter_campaigns IS 'Email campaigns with performance metrics';
COMMENT ON TABLE events IS 'Unified events table for calendar view';
COMMENT ON TABLE search_index IS 'Full-text search index for site-wide search';
COMMENT ON TABLE documents IS 'Enhanced document management with versioning and sharing';
COMMENT ON TABLE photos IS 'Photo gallery with albums and tagging';
COMMENT ON TABLE badges IS 'Badge definitions for volunteer recognition';
COMMENT ON TABLE custom_reports IS 'Custom analytics reports created by founders';

