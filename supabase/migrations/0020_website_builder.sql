-- Website Builder Tables

-- Page Sections Table
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

-- Website Settings Table
CREATE TABLE IF NOT EXISTS website_settings (
  id integer PRIMARY KEY DEFAULT 1,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL
);

-- Add permissions column to users if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'permissions') THEN
    ALTER TABLE users ADD COLUMN permissions jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE page_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for page_sections

-- Anyone can read visible sections
CREATE POLICY "Anyone can read visible sections" ON page_sections
  FOR SELECT USING (visible = true);

-- Founders can do everything
CREATE POLICY "Founders can manage sections" ON page_sections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'founder'
    )
  );

-- Users with website.edit permission can edit
CREATE POLICY "Users with permission can edit sections" ON page_sections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (
        role = 'founder' 
        OR permissions @> '["website.edit"]'::jsonb
      )
    )
  );

-- RLS Policies for website_settings

-- Anyone can read settings
CREATE POLICY "Anyone can read website settings" ON website_settings
  FOR SELECT USING (true);

-- Only founders can update settings
CREATE POLICY "Founders can update settings" ON website_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'founder'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_page_sections_page ON page_sections(page);
CREATE INDEX IF NOT EXISTS idx_page_sections_order ON page_sections("order");
CREATE INDEX IF NOT EXISTS idx_page_sections_visible ON page_sections(visible);
CREATE INDEX IF NOT EXISTS idx_users_permissions ON users USING gin(permissions);

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

-- Grant default permissions to founders
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
  "analytics.export"
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
  "presentations.edit"
]'::jsonb
WHERE role = 'intern' AND (permissions IS NULL OR permissions = '[]'::jsonb);

