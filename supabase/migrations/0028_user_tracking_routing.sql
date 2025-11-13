-- ============================================================================
-- USER TRACKING & ROUTING SYSTEM MIGRATION
-- Tracks all signups/logins and enables smart routing based on user type
-- ============================================================================

-- User activity log (tracks all signups/logins)
CREATE TABLE IF NOT EXISTS user_activity_log (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  email text NOT NULL,
  activity_type text NOT NULL, -- 'signup', 'login', 'logout', 'page_view', 'form_submit'
  activity_source text, -- 'magic_link', 'google_oauth', 'email_signup', 'form_submission'
  user_category text, -- 'newsletter', 'volunteer', 'intern', 'founder', 'teacher', 'guest'
  ip_address text,
  user_agent text,
  referrer text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_activity_user ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_email ON user_activity_log(email);
CREATE INDEX IF NOT EXISTS idx_user_activity_type ON user_activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_category ON user_activity_log(user_category);
CREATE INDEX IF NOT EXISTS idx_user_activity_date ON user_activity_log(created_at);

-- User signup sources (tracks where users came from)
CREATE TABLE IF NOT EXISTS user_signup_sources (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  email text NOT NULL,
  source_type text NOT NULL, -- 'volunteer_form', 'intern_form', 'teacher_form', 'newsletter', 'direct_signup', 'invited'
  source_reference_id bigint, -- ID of related record (volunteer_id, intern_project_id, etc.)
  source_metadata jsonb, -- Additional context
  first_signup_at timestamptz DEFAULT now(),
  UNIQUE(user_id, source_type)
);

CREATE INDEX IF NOT EXISTS idx_signup_sources_user ON user_signup_sources(user_id);
CREATE INDEX IF NOT EXISTS idx_signup_sources_email ON user_signup_sources(email);
CREATE INDEX IF NOT EXISTS idx_signup_sources_type ON user_signup_sources(source_type);

-- User routing preferences (stores where users should be redirected)
CREATE TABLE IF NOT EXISTS user_routing_preferences (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  default_redirect_path text, -- Custom redirect path
  onboarding_completed boolean DEFAULT false,
  onboarding_step text,
  last_login_at timestamptz,
  login_count integer DEFAULT 0,
  preferred_dashboard text, -- 'volunteer', 'intern', 'founder', 'teacher'
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_routing_preferences_user ON user_routing_preferences(user_id);

-- Add user_category to users table for quick categorization
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_category text;
-- Values: 'newsletter', 'volunteer', 'intern', 'founder', 'teacher', 'partner', 'guest'
CREATE INDEX IF NOT EXISTS idx_users_category ON users(user_category);

COMMENT ON TABLE user_activity_log IS 'Tracks all user signups, logins, and activities';
COMMENT ON TABLE user_signup_sources IS 'Tracks where users signed up from (forms, invitations, etc.)';
COMMENT ON TABLE user_routing_preferences IS 'Stores user routing preferences and onboarding status';
COMMENT ON COLUMN users.user_category IS 'Quick categorization of user type for routing';

