-- ============================================================================
-- GREEN SILICON VALLEY - COMPLETE DATABASE SETUP
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/rwcxtfwrkjmpltkwextr/editor
-- ============================================================================

-- 1. CREATE USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY,
  name text,
  email text UNIQUE NOT NULL,
  role text CHECK (role IN ('founder','intern','volunteer','teacher','partner')) DEFAULT 'teacher',
  permissions jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Founders can read all users
CREATE POLICY "Founders can read all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'founder'
    )
  );

-- Founders can update all users
CREATE POLICY "Founders can update all users" ON users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'founder'
    )
  );

-- 2. SET FOUNDER ROLE
-- ============================================================================
-- This will set ayushg.2024@gmail.com as founder
INSERT INTO users (id, email, name, role)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', email) as name,
  'founder' as role
FROM auth.users
WHERE email = 'ayushg.2024@gmail.com'
ON CONFLICT (id) DO UPDATE 
SET role = 'founder', updated_at = now();

-- Verify founder was set
SELECT id, email, name, role, created_at 
FROM users 
WHERE email = 'ayushg.2024@gmail.com';

-- 3. CREATE ALL OTHER TABLES
-- ============================================================================

-- Schools
CREATE TABLE IF NOT EXISTS schools (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  district text,
  teacher_name text,
  email text,
  address text,
  city text,
  state text DEFAULT 'CA',
  zip text,
  phone text,
  status text DEFAULT 'active',
  lat decimal(10, 8),
  lng decimal(11, 8),
  created_at timestamptz DEFAULT now()
);

-- Presentations
CREATE TABLE IF NOT EXISTS presentations (
  id bigserial PRIMARY KEY,
  school_id bigint REFERENCES schools(id) ON DELETE SET NULL,
  volunteer_team text,
  topic text,
  scheduled_date timestamptz,
  status text DEFAULT 'pending',
  feedback text,
  student_count integer,
  files jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Volunteers
CREATE TABLE IF NOT EXISTS volunteers (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  team_name text,
  hours_total integer DEFAULT 0,
  status text DEFAULT 'active',
  milestones jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Volunteer Hours
CREATE TABLE IF NOT EXISTS volunteer_hours (
  id bigserial PRIMARY KEY,
  volunteer_id uuid REFERENCES users(id) ON DELETE CASCADE,
  presentation_id uuid REFERENCES presentations(id) ON DELETE SET NULL,
  date date NOT NULL,
  hours_logged decimal(5,2) NOT NULL,
  verification_slip text,
  status text DEFAULT 'pending',
  reviewer_id uuid REFERENCES users(id) ON DELETE SET NULL,
  reviewer_comments text,
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Intern Projects
CREATE TABLE IF NOT EXISTS intern_projects (
  id bigserial PRIMARY KEY,
  department text,
  task text NOT NULL,
  due_date date,
  status text DEFAULT 'Planning',
  priority text DEFAULT 'medium',
  assigned_to uuid REFERENCES users(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Resources
CREATE TABLE IF NOT EXISTS resources (
  id bigserial PRIMARY KEY,
  filename text NOT NULL,
  file_type text,
  file_size bigint,
  upload_date timestamptz DEFAULT now(),
  uploaded_by uuid REFERENCES users(id) ON DELETE SET NULL,
  is_public boolean DEFAULT false,
  archived boolean DEFAULT false,
  description text
);

-- Chapters
CREATE TABLE IF NOT EXISTS chapters (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  city text,
  state text DEFAULT 'CA',
  status text DEFAULT 'active',
  lat decimal(10, 8),
  lng decimal(11, 8),
  lead_id uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Team Members
CREATE TABLE IF NOT EXISTS team_members (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  team_name text NOT NULL,
  role text,
  joined_at timestamptz DEFAULT now()
);

-- Presentation Members
CREATE TABLE IF NOT EXISTS presentation_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  presentation_id uuid REFERENCES presentations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  role text DEFAULT 'volunteer',
  created_at timestamptz DEFAULT now(),
  UNIQUE(presentation_id, user_id)
);

-- Blog Posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text NOT NULL,
  author_id uuid REFERENCES users(id) ON DELETE SET NULL,
  cover_image text,
  category text,
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Bulletin Posts
CREATE TABLE IF NOT EXISTS bulletin_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  author_id uuid REFERENCES users(id) ON DELETE SET NULL,
  pinned boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Content Blocks
CREATE TABLE IF NOT EXISTS content_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page text NOT NULL,
  block_key text NOT NULL,
  content text NOT NULL,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE(page, block_key)
);

-- Navigation Links
CREATE TABLE IF NOT EXISTS nav_links (
  id bigserial PRIMARY KEY,
  label text NOT NULL,
  href text NOT NULL,
  link_order integer DEFAULT 0,
  visible boolean DEFAULT true
);

-- Email Templates
CREATE TABLE IF NOT EXISTS email_templates (
  id bigserial PRIMARY KEY,
  template_key text UNIQUE NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES users(id) ON DELETE SET NULL,
  channel_id text,
  recipient_id uuid REFERENCES users(id) ON DELETE SET NULL,
  content text NOT NULL,
  attachments jsonb DEFAULT '[]'::jsonb,
  edited_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Channels
CREATE TABLE IF NOT EXISTS channels (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  channel_type text DEFAULT 'team',
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Announcements
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  author_id uuid REFERENCES users(id) ON DELETE SET NULL,
  target_roles text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Grants
CREATE TABLE IF NOT EXISTS grants (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  amount decimal(12,2),
  deadline date,
  status text DEFAULT 'researching',
  report_due date,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Donations
CREATE TABLE IF NOT EXISTS donations (
  id bigserial PRIMARY KEY,
  donor_name text,
  amount decimal(12,2) NOT NULL,
  date date DEFAULT CURRENT_DATE,
  method text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Rules & Bylaws
CREATE TABLE IF NOT EXISTS rules_bylaws (
  id bigserial PRIMARY KEY,
  title text NOT NULL,
  content text NOT NULL,
  category text,
  revision_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- System Logs
CREATE TABLE IF NOT EXISTS system_logs (
  id bigserial PRIMARY KEY,
  event_type text NOT NULL,
  actor_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  timestamp timestamptz DEFAULT now()
);

-- Analytics Cache
CREATE TABLE IF NOT EXISTS analytics_cache (
  id bigserial PRIMARY KEY,
  metric_key text UNIQUE NOT NULL,
  metric_value jsonb NOT NULL,
  computed_at timestamptz DEFAULT now()
);

-- 4. CREATE STORAGE BUCKET
-- ============================================================================
-- Note: This needs to be done in Supabase Storage UI or via API
-- Bucket name: "resources"
-- Public: false (we'll use signed URLs)

-- 5. ENABLE REALTIME (Optional)
-- ============================================================================
-- Enable realtime for messages and announcements
-- This is done in Supabase Dashboard > Database > Replication

-- 6. INSERT SAMPLE DATA (Optional)
-- ============================================================================

-- Sample navigation links
INSERT INTO nav_links (label, href, link_order, visible) VALUES
  ('Home', '/', 0, true),
  ('About', '/about', 1, true),
  ('Impact', '/impact', 2, true),
  ('Get Involved', '/get-involved', 3, true),
  ('Contact', '/contact', 4, true),
  ('Blog', '/blog', 5, true)
ON CONFLICT DO NOTHING;

-- Sample email templates
INSERT INTO email_templates (template_key, subject, body) VALUES
  ('volunteer_welcome', 'Welcome to Green Silicon Valley!', 'Thank you for joining GSV as a volunteer...'),
  ('hours_approved', 'Your volunteer hours have been approved', 'Congratulations! Your {{hours}} hours have been approved...'),
  ('hours_rejected', 'Update needed on your volunteer hours', 'We need more information about your hours submission...')
ON CONFLICT DO NOTHING;

-- 7. VERIFY SETUP
-- ============================================================================

-- Check if founder exists
SELECT 'Founder Check' as test, 
       CASE WHEN EXISTS (SELECT 1 FROM users WHERE role = 'founder') 
       THEN '✅ Founder exists' 
       ELSE '❌ No founder found' 
       END as result;

-- Count tables
SELECT 'Tables Created' as test,
       COUNT(*) || ' tables' as result
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE';

-- Check RLS
SELECT 'RLS Enabled' as test,
       COUNT(*) || ' tables with RLS' as result
FROM pg_tables 
WHERE schemaname = 'public' 
  AND rowsecurity = true;

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================
-- Next steps:
-- 1. Verify founder role: SELECT * FROM users WHERE role = 'founder';
-- 2. Log out and log back in to see founder dashboard
-- 3. Start using the platform!
-- ============================================================================

