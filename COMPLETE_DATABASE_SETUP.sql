-- ============================================================================
-- GREEN SILICON VALLEY - COMPLETE DATABASE SETUP
-- ============================================================================
-- This file contains ALL database setup needed for the platform
-- Run this ONCE in Supabase SQL Editor to set up everything
-- ============================================================================

-- ============================================================================
-- PART 1: CORE TABLES
-- ============================================================================

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  email text UNIQUE,
  role text DEFAULT 'volunteer' CHECK (role IN ('founder', 'intern', 'volunteer', 'teacher', 'partner')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'suspended')),
  permissions jsonb DEFAULT '[]'::jsonb,
  phone text,
  address text,
  city text,
  state text DEFAULT 'CA',
  zip text,
  profile_image text,
  notes text,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Page sections for website builder
CREATE TABLE IF NOT EXISTS page_sections (
  id text PRIMARY KEY,
  page text NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  content jsonb DEFAULT '{}'::jsonb,
  "order" integer DEFAULT 0,
  visible boolean DEFAULT true,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Website settings
CREATE TABLE IF NOT EXISTS website_settings (
  id integer PRIMARY KEY DEFAULT 1,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL
);

-- Blog posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  excerpt text,
  content text NOT NULL,
  cover_image text,
  author_id uuid REFERENCES users(id) ON DELETE SET NULL,
  published boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  seo_title text,
  seo_description text
);

-- Media files
CREATE TABLE IF NOT EXISTS media_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  file_path text NOT NULL,
  file_type text NOT NULL,
  file_size bigint,
  is_public boolean DEFAULT true,
  uploaded_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Schools
CREATE TABLE IF NOT EXISTS schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  city text,
  state text DEFAULT 'CA',
  zip text,
  contact_name text,
  contact_email text,
  contact_phone text,
  status text DEFAULT 'active',
  lat numeric,
  lng numeric,
  created_at timestamptz DEFAULT now()
);

-- Presentations
CREATE TABLE IF NOT EXISTS presentations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE,
  scheduled_date timestamptz,
  status text DEFAULT 'pending',
  student_count integer,
  grade_level text,
  topic text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Volunteers
CREATE TABLE IF NOT EXISTS volunteers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  status text DEFAULT 'active',
  skills text[],
  availability text,
  created_at timestamptz DEFAULT now()
);

-- Volunteer hours
CREATE TABLE IF NOT EXISTS volunteer_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id uuid REFERENCES volunteers(id) ON DELETE CASCADE,
  date date NOT NULL,
  hours_logged numeric NOT NULL,
  activity text,
  status text DEFAULT 'pending',
  approved_by uuid REFERENCES users(id) ON DELETE SET NULL,
  feedback text,
  created_at timestamptz DEFAULT now()
);

-- Intern projects
CREATE TABLE IF NOT EXISTS intern_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  intern_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status text DEFAULT 'in_progress',
  priority text DEFAULT 'medium',
  due_date date,
  created_at timestamptz DEFAULT now()
);

-- Chapters
CREATE TABLE IF NOT EXISTS chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  city text,
  state text DEFAULT 'CA',
  status text DEFAULT 'active',
  lead_id uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Bulletin posts
CREATE TABLE IF NOT EXISTS bulletin_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  author_id uuid REFERENCES users(id) ON DELETE SET NULL,
  priority text DEFAULT 'normal',
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Navigation links
CREATE TABLE IF NOT EXISTS nav_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  href text NOT NULL,
  link_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Content blocks
CREATE TABLE IF NOT EXISTS content_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page text NOT NULL,
  block_key text NOT NULL,
  content text NOT NULL,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(page, block_key)
);

-- System logs
CREATE TABLE IF NOT EXISTS system_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  actor_id uuid REFERENCES users(id) ON DELETE SET NULL,
  details text,
  timestamp timestamptz DEFAULT now()
);

-- ============================================================================
-- PART 2: INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_role_status ON users(role, status);
CREATE INDEX IF NOT EXISTS idx_users_email_lower ON users(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_users_name_lower ON users(LOWER(name));
CREATE INDEX IF NOT EXISTS idx_users_permissions ON users USING gin(permissions);

CREATE INDEX IF NOT EXISTS idx_page_sections_page ON page_sections(page);
CREATE INDEX IF NOT EXISTS idx_page_sections_order ON page_sections("order");
CREATE INDEX IF NOT EXISTS idx_page_sections_visible ON page_sections(visible);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON blog_posts(author_id);

CREATE INDEX IF NOT EXISTS idx_presentations_school ON presentations(school_id);
CREATE INDEX IF NOT EXISTS idx_presentations_date ON presentations(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_presentations_status ON presentations(status);

CREATE INDEX IF NOT EXISTS idx_volunteer_hours_volunteer ON volunteer_hours(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_hours_date ON volunteer_hours(date);
CREATE INDEX IF NOT EXISTS idx_volunteer_hours_status ON volunteer_hours(status);

-- ============================================================================
-- PART 3: ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE presentations ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE intern_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulletin_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE nav_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Founders can manage all users" ON users FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'founder')
);
CREATE POLICY "Users with permission can view users" ON users FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND (role = 'founder' OR permissions @> '["users.view"]'::jsonb)
  )
);

-- Page sections policies
CREATE POLICY "Anyone can read visible sections" ON page_sections FOR SELECT USING (visible = true);
CREATE POLICY "Founders can manage sections" ON page_sections FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'founder')
);
CREATE POLICY "Users with permission can edit sections" ON page_sections FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND (role = 'founder' OR permissions @> '["website.edit"]'::jsonb)
  )
);

-- Website settings policies
CREATE POLICY "Anyone can read website settings" ON website_settings FOR SELECT USING (true);
CREATE POLICY "Founders can update settings" ON website_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'founder')
);

-- Blog posts policies
CREATE POLICY "Anyone can read published posts" ON blog_posts FOR SELECT USING (published = true);
CREATE POLICY "Founders can manage all posts" ON blog_posts FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'founder')
);
CREATE POLICY "Users with permission can manage posts" ON blog_posts FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND (role = 'founder' OR permissions @> '["blog.create"]'::jsonb)
  )
);

-- Media files policies
CREATE POLICY "Anyone can view public files" ON media_files FOR SELECT USING (is_public = true);
CREATE POLICY "Founders can manage all files" ON media_files FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'founder')
);
CREATE POLICY "Users with permission can upload files" ON media_files FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND (role = 'founder' OR permissions @> '["media.upload"]'::jsonb)
  )
);

-- Schools policies
CREATE POLICY "Anyone can view schools" ON schools FOR SELECT USING (true);
CREATE POLICY "Founders can manage schools" ON schools FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'founder')
);

-- Presentations policies
CREATE POLICY "Anyone can view presentations" ON presentations FOR SELECT USING (true);
CREATE POLICY "Founders can manage presentations" ON presentations FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'founder')
);

-- Volunteers policies
CREATE POLICY "Users can view own volunteer profile" ON volunteers FOR SELECT USING (
  user_id = auth.uid()
);
CREATE POLICY "Founders can manage volunteers" ON volunteers FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'founder')
);

-- Volunteer hours policies
CREATE POLICY "Users can view own hours" ON volunteer_hours FOR SELECT USING (
  volunteer_id IN (SELECT id FROM volunteers WHERE user_id = auth.uid())
);
CREATE POLICY "Founders can manage all hours" ON volunteer_hours FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'founder')
);

-- Bulletin posts policies
CREATE POLICY "Authenticated users can view bulletin" ON bulletin_posts FOR SELECT USING (
  auth.uid() IS NOT NULL
);
CREATE POLICY "Founders can manage bulletin" ON bulletin_posts FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'founder')
);

-- Nav links policies
CREATE POLICY "Anyone can view nav links" ON nav_links FOR SELECT USING (true);
CREATE POLICY "Founders can manage nav links" ON nav_links FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'founder')
);

-- Content blocks policies
CREATE POLICY "Anyone can view content blocks" ON content_blocks FOR SELECT USING (true);
CREATE POLICY "Founders can manage content blocks" ON content_blocks FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'founder')
);

-- ============================================================================
-- PART 4: INITIAL DATA
-- ============================================================================

-- Insert default website settings
INSERT INTO website_settings (id, settings) VALUES (
  1,
  '{
    "primaryColor": "#2D7A4F",
    "secondaryColor": "#D97642",
    "fontFamily": "Inter",
    "logoUrl": "/logo.svg",
    "socialLinks": [
      {"platform": "LinkedIn", "url": "https://linkedin.com/company/green-silicon-valley"},
      {"platform": "YouTube", "url": "https://youtube.com/@greensiliconvalley"},
      {"platform": "Instagram", "url": "https://instagram.com/greensiliconvalley"},
      {"platform": "Discord", "url": "https://discord.gg/greensiliconvalley"},
      {"platform": "Twitter", "url": "https://twitter.com/greensiliconval"},
      {"platform": "Facebook", "url": "https://facebook.com/greensiliconvalley"}
    ]
  }'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Insert default navigation links
INSERT INTO nav_links (label, href, link_order) VALUES
  ('Home', '/', 0),
  ('About', '/about', 1),
  ('Impact', '/impact', 2),
  ('Get Involved', '/get-involved', 3),
  ('Contact', '/contact', 4),
  ('Blog', '/blog', 5)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 5: SET UP FOUNDER USER
-- ============================================================================

-- Set ayushg.2024@gmail.com as founder
DO $$
DECLARE
  founder_user_id uuid;
BEGIN
  -- Get user ID from auth.users
  SELECT id INTO founder_user_id
  FROM auth.users
  WHERE email = 'ayushg.2024@gmail.com'
  LIMIT 1;

  IF founder_user_id IS NOT NULL THEN
    -- Insert or update user record
    INSERT INTO users (id, email, name, role, status, permissions)
    VALUES (
      founder_user_id,
      'ayushg.2024@gmail.com',
      'Ayush Gupta',
      'founder',
      'active',
      '[
        "website.edit", "website.publish", "website.settings", "website.social",
        "content.edit", "content.create", "content.delete", "content.preview",
        "blog.create", "blog.edit", "blog.publish", "blog.delete",
        "media.upload", "media.delete", "media.public",
        "users.view", "users.create", "users.edit", "users.delete", "users.roles", "users.permissions",
        "volunteers.view", "volunteers.approve", "volunteers.forms",
        "presentations.view", "presentations.create", "presentations.edit", "presentations.delete",
        "analytics.view", "analytics.export"
      ]'::jsonb
    )
    ON CONFLICT (id) DO UPDATE SET
      role = 'founder',
      status = 'active',
      permissions = '[
        "website.edit", "website.publish", "website.settings", "website.social",
        "content.edit", "content.create", "content.delete", "content.preview",
        "blog.create", "blog.edit", "blog.publish", "blog.delete",
        "media.upload", "media.delete", "media.public",
        "users.view", "users.create", "users.edit", "users.delete", "users.roles", "users.permissions",
        "volunteers.view", "volunteers.approve", "volunteers.forms",
        "presentations.view", "presentations.create", "presentations.edit", "presentations.delete",
        "analytics.view", "analytics.export"
      ]'::jsonb;

    RAISE NOTICE '✅ Founder user set up successfully!';
  ELSE
    RAISE NOTICE '⚠️ User not found. Please sign in with ayushg.2024@gmail.com first, then run this script again.';
  END IF;
END $$;

-- Grant default permissions to all founders
UPDATE users 
SET permissions = '[
  "website.edit", "website.publish", "website.settings", "website.social",
  "content.edit", "content.create", "content.delete", "content.preview",
  "blog.create", "blog.edit", "blog.publish", "blog.delete",
  "media.upload", "media.delete", "media.public",
  "users.view", "users.create", "users.edit", "users.delete", "users.roles", "users.permissions",
  "volunteers.view", "volunteers.approve", "volunteers.forms",
  "presentations.view", "presentations.create", "presentations.edit", "presentations.delete",
  "analytics.view", "analytics.export"
]'::jsonb
WHERE role = 'founder' AND (permissions IS NULL OR permissions = '[]'::jsonb);

-- Grant default permissions to interns
UPDATE users 
SET permissions = '[
  "content.edit", "content.create", "content.preview",
  "blog.create", "blog.edit",
  "media.upload",
  "volunteers.view", "volunteers.approve", "volunteers.forms",
  "presentations.view", "presentations.create", "presentations.edit"
]'::jsonb
WHERE role = 'intern' AND (permissions IS NULL OR permissions = '[]'::jsonb);

-- ============================================================================
-- PART 6: VERIFICATION
-- ============================================================================

-- Verify setup
DO $$
DECLARE
  table_count integer;
  founder_count integer;
BEGIN
  -- Count tables
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name IN (
    'users', 'page_sections', 'website_settings', 'blog_posts', 'media_files',
    'schools', 'presentations', 'volunteers', 'volunteer_hours', 'intern_projects',
    'chapters', 'bulletin_posts', 'nav_links', 'content_blocks', 'system_logs'
  );

  -- Count founders
  SELECT COUNT(*) INTO founder_count
  FROM users
  WHERE role = 'founder';

  RAISE NOTICE '============================================';
  RAISE NOTICE 'SETUP VERIFICATION';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Tables created: % / 15', table_count;
  RAISE NOTICE 'Founder users: %', founder_count;
  RAISE NOTICE '============================================';
  
  IF table_count = 15 THEN
    RAISE NOTICE '✅ All tables created successfully!';
  ELSE
    RAISE NOTICE '⚠️ Some tables may be missing. Expected 15, found %.', table_count;
  END IF;

  IF founder_count > 0 THEN
    RAISE NOTICE '✅ Founder user(s) set up successfully!';
  ELSE
    RAISE NOTICE '⚠️ No founder users found. Please sign in first.';
  END IF;
  
  RAISE NOTICE '============================================';
  RAISE NOTICE '🎉 Database setup complete!';
  RAISE NOTICE '============================================';
END $$;

