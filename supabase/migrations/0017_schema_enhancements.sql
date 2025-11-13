-- =====================================================
-- COMPREHENSIVE SCHEMA ENHANCEMENTS
-- =====================================================

-- =====================================================
-- ENHANCE USERS TABLE
-- =====================================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image_url text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS school_affiliation text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at timestamptz;
ALTER TABLE users ADD COLUMN IF NOT EXISTS status text CHECK(status IN ('active','inactive','pending')) DEFAULT 'active';

-- Add 'partner' role
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('founder','intern','volunteer','teacher','partner'));

-- =====================================================
-- ENHANCE SCHOOLS TABLE
-- =====================================================
ALTER TABLE schools ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS state text DEFAULT 'CA';
ALTER TABLE schools ADD COLUMN IF NOT EXISTS zip_code text;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS total_presentations_hosted int DEFAULT 0;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS last_presentation_date timestamptz;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS status text 
  CHECK(status IN ('active','inactive','pending')) DEFAULT 'active';
ALTER TABLE schools ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE schools ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE schools ADD COLUMN IF NOT EXISTS latitude numeric(10,7);
ALTER TABLE schools ADD COLUMN IF NOT EXISTS longitude numeric(10,7);

-- =====================================================
-- ENHANCE PRESENTATIONS TABLE
-- =====================================================
ALTER TABLE presentations ADD COLUMN IF NOT EXISTS requesting_teacher_name text;
ALTER TABLE presentations ADD COLUMN IF NOT EXISTS requesting_teacher_email text;
ALTER TABLE presentations ADD COLUMN IF NOT EXISTS grade_level text;
ALTER TABLE presentations ADD COLUMN IF NOT EXISTS teacher_rating int 
  CHECK(teacher_rating BETWEEN 1 AND 5);
ALTER TABLE presentations ADD COLUMN IF NOT EXISTS student_count int;
ALTER TABLE presentations ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE presentations ADD COLUMN IF NOT EXISTS confirmation_sent boolean DEFAULT false;
ALTER TABLE presentations ADD COLUMN IF NOT EXISTS reminder_sent boolean DEFAULT false;
ALTER TABLE presentations ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE presentations ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Update status constraint
ALTER TABLE presentations DROP CONSTRAINT IF EXISTS presentations_status_check;
ALTER TABLE presentations ADD CONSTRAINT presentations_status_check 
  CHECK (status IN ('pending','scheduled','completed','cancelled'));

-- =====================================================
-- ENHANCE VOLUNTEERS TABLE
-- =====================================================
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS presentations_completed int DEFAULT 0;
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS availability jsonb DEFAULT '{}'::jsonb;
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS skills_interests jsonb DEFAULT '[]'::jsonb;
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS emergency_contact_name text;
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS emergency_contact_phone text;
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS orientation_completed boolean DEFAULT false;
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS orientation_date timestamptz;
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS status text 
  CHECK(status IN ('active','inactive','on_leave')) DEFAULT 'active';
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- =====================================================
-- ENHANCE CHAPTERS TABLE
-- =====================================================
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS country text DEFAULT 'USA';
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS leader_user_id uuid REFERENCES users(id);
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS co_leaders jsonb DEFAULT '[]'::jsonb;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS contact_email text;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS established_date date;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Update status constraint
ALTER TABLE chapters DROP CONSTRAINT IF EXISTS chapters_status_check;
ALTER TABLE chapters ADD CONSTRAINT chapters_status_check 
  CHECK (status IN ('active','inactive','pending_approval','review_due'));

-- =====================================================
-- ENHANCE RESOURCES TABLE
-- =====================================================
ALTER TABLE resources ADD COLUMN IF NOT EXISTS file_url text;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS file_size_bytes bigint;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS category text 
  CHECK(category IN ('presentation_template','activity_guide','branding','training','policy','gallery','other'));
ALTER TABLE resources ADD COLUMN IF NOT EXISTS subcategory text;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS version_number int DEFAULT 1;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS replaces_resource_id bigint REFERENCES resources(id);
ALTER TABLE resources ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS tags jsonb DEFAULT '[]'::jsonb;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS last_accessed_at timestamptz;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS download_count int DEFAULT 0;

-- =====================================================
-- ENHANCE INTERN PROJECTS TABLE
-- =====================================================
ALTER TABLE intern_projects ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE intern_projects ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE intern_projects ADD COLUMN IF NOT EXISTS assigned_to uuid REFERENCES users(id);
ALTER TABLE intern_projects ADD COLUMN IF NOT EXISTS priority text 
  CHECK(priority IN ('low','medium','high','urgent')) DEFAULT 'medium';
ALTER TABLE intern_projects ADD COLUMN IF NOT EXISTS completion_date date;
ALTER TABLE intern_projects ADD COLUMN IF NOT EXISTS attachments jsonb DEFAULT '[]'::jsonb;
ALTER TABLE intern_projects ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES users(id);
ALTER TABLE intern_projects ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE intern_projects ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Update status constraint
ALTER TABLE intern_projects DROP CONSTRAINT IF EXISTS intern_projects_status_check;
ALTER TABLE intern_projects ADD CONSTRAINT intern_projects_status_check 
  CHECK (status IN ('not_started','in_progress','blocked','completed','cancelled'));

-- Sync title with task for existing records
UPDATE intern_projects SET title = task WHERE title IS NULL AND task IS NOT NULL;

-- =====================================================
-- ENHANCE GRANTS TABLE
-- =====================================================
ALTER TABLE grants ADD COLUMN IF NOT EXISTS grantor_organization text;
ALTER TABLE grants ADD COLUMN IF NOT EXISTS amount_requested numeric(12,2);
ALTER TABLE grants ADD COLUMN IF NOT EXISTS amount_awarded numeric(12,2);
ALTER TABLE grants ADD COLUMN IF NOT EXISTS application_deadline date;
ALTER TABLE grants ADD COLUMN IF NOT EXISTS point_person_id uuid REFERENCES users(id);
ALTER TABLE grants ADD COLUMN IF NOT EXISTS application_file_url text;
ALTER TABLE grants ADD COLUMN IF NOT EXISTS report_file_url text;
ALTER TABLE grants ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE grants ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Update status constraint
ALTER TABLE grants DROP CONSTRAINT IF EXISTS grants_status_check;
ALTER TABLE grants ADD CONSTRAINT grants_status_check 
  CHECK (status IN ('research','drafting','submitted','awarded','rejected','reporting_complete'));

-- Migrate old deadline to application_deadline
UPDATE grants SET application_deadline = deadline WHERE application_deadline IS NULL AND deadline IS NOT NULL;

-- =====================================================
-- ENHANCE DONATIONS TABLE
-- =====================================================
ALTER TABLE donations ADD COLUMN IF NOT EXISTS donor_email text;
ALTER TABLE donations ADD COLUMN IF NOT EXISTS donor_address text;
ALTER TABLE donations ADD COLUMN IF NOT EXISTS payment_method text;
ALTER TABLE donations ADD COLUMN IF NOT EXISTS transaction_id text;
ALTER TABLE donations ADD COLUMN IF NOT EXISTS acknowledgment_sent_date date;
ALTER TABLE donations ADD COLUMN IF NOT EXISTS tax_receipt_sent boolean DEFAULT false;
ALTER TABLE donations ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE donations ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE donations ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE donations ADD COLUMN IF NOT EXISTS donation_date date;

-- Migrate old date to donation_date
UPDATE donations SET donation_date = date WHERE donation_date IS NULL AND date IS NOT NULL;

-- =====================================================
-- ENHANCE RULES/BYLAWS TABLE
-- =====================================================
ALTER TABLE rules_bylaws ADD COLUMN IF NOT EXISTS section text;
ALTER TABLE rules_bylaws ADD COLUMN IF NOT EXISTS version_number int DEFAULT 1;
ALTER TABLE rules_bylaws ADD COLUMN IF NOT EXISTS replaces_rule_id bigint REFERENCES rules_bylaws(id);
ALTER TABLE rules_bylaws ADD COLUMN IF NOT EXISTS effective_date date DEFAULT CURRENT_DATE;
ALTER TABLE rules_bylaws ADD COLUMN IF NOT EXISTS approval_status text 
  CHECK(approval_status IN ('draft','approved','archived')) DEFAULT 'draft';
ALTER TABLE rules_bylaws ADD COLUMN IF NOT EXISTS tags jsonb DEFAULT '[]'::jsonb;
ALTER TABLE rules_bylaws ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- =====================================================
-- ENHANCE SYSTEM LOGS TABLE
-- =====================================================
ALTER TABLE system_logs ADD COLUMN IF NOT EXISTS actor_id uuid REFERENCES users(id);
ALTER TABLE system_logs ADD COLUMN IF NOT EXISTS target_table text;
ALTER TABLE system_logs ADD COLUMN IF NOT EXISTS target_id text;
ALTER TABLE system_logs ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;
ALTER TABLE system_logs ADD COLUMN IF NOT EXISTS ip_address inet;
ALTER TABLE system_logs ADD COLUMN IF NOT EXISTS user_agent text;

-- =====================================================
-- CREATE MISSING CRITICAL TABLES
-- =====================================================

-- Analytics Cache Table
CREATE TABLE IF NOT EXISTS analytics_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name text NOT NULL,
  metric_value numeric NOT NULL,
  metric_metadata jsonb DEFAULT '{}'::jsonb,
  date_generated timestamptz NOT NULL DEFAULT now(),
  valid_until timestamptz,
  scope text CHECK(scope IN ('global','chapter','department')) DEFAULT 'global',
  scope_id uuid
);

-- Scheduled Tasks Table
CREATE TABLE IF NOT EXISTS scheduled_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_name text NOT NULL,
  task_type text CHECK(task_type IN ('reminder','report','check','cleanup')) NOT NULL,
  schedule_expression text NOT NULL,
  enabled boolean DEFAULT true,
  last_run_at timestamptz,
  next_run_at timestamptz,
  configuration jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Task Assignments Table (for volunteer/intern task system)
CREATE TABLE IF NOT EXISTS task_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  assigned_to uuid REFERENCES users(id) ON DELETE CASCADE,
  assigned_by uuid REFERENCES users(id) ON DELETE SET NULL,
  task_type text CHECK(task_type IN ('presentation','project','training','administrative','other')) DEFAULT 'other',
  priority text CHECK(priority IN ('low','medium','high','urgent')) DEFAULT 'medium',
  status text CHECK(status IN ('not_started','in_progress','blocked','completed','cancelled')) DEFAULT 'not_started',
  due_date timestamptz,
  completed_at timestamptz,
  related_presentation_id uuid REFERENCES presentations(id) ON DELETE SET NULL,
  related_project_id bigint REFERENCES intern_projects(id) ON DELETE SET NULL,
  attachments jsonb DEFAULT '[]'::jsonb,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Document Permissions Table (for intern document access)
CREATE TABLE IF NOT EXISTS document_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  resource_id bigint REFERENCES resources(id) ON DELETE CASCADE,
  permission_level text CHECK(permission_level IN ('view','edit','assign','manage')) DEFAULT 'view',
  granted_by uuid REFERENCES users(id) ON DELETE SET NULL,
  granted_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  UNIQUE(user_id, resource_id)
);

-- Website Content Blocks (enhanced for WYSIWYG editor)
-- Already exists, but let's add more fields
ALTER TABLE content_blocks ADD COLUMN IF NOT EXISTS page_section text;
ALTER TABLE content_blocks ADD COLUMN IF NOT EXISTS display_order int DEFAULT 0;
ALTER TABLE content_blocks ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT true;
ALTER TABLE content_blocks ADD COLUMN IF NOT EXISTS html_content text;
ALTER TABLE content_blocks ADD COLUMN IF NOT EXISTS css_classes text;

-- Page Templates (for no-code editor)
CREATE TABLE IF NOT EXISTS page_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_name text NOT NULL,
  page_path text UNIQUE NOT NULL,
  template_type text CHECK(template_type IN ('static','dynamic','custom')) DEFAULT 'static',
  layout_config jsonb DEFAULT '{}'::jsonb,
  is_editable boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- CREATE INDEXES
-- =====================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_created ON users(created_at DESC);

-- Presentations indexes
CREATE INDEX IF NOT EXISTS idx_presentations_date_desc ON presentations(date DESC);
CREATE INDEX IF NOT EXISTS idx_presentations_teacher_email ON presentations(requesting_teacher_email);
CREATE INDEX IF NOT EXISTS idx_presentations_grade ON presentations(grade_level);

-- Volunteer hours indexes (additional)
CREATE INDEX IF NOT EXISTS idx_vol_hours_created ON volunteer_hours(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vol_hours_approved ON volunteer_hours(approved_at DESC);

-- Schools indexes
CREATE INDEX IF NOT EXISTS idx_schools_city ON schools(city);
CREATE INDEX IF NOT EXISTS idx_schools_state ON schools(state);

-- Chapters indexes
CREATE INDEX IF NOT EXISTS idx_chapters_leader_user ON chapters(leader_user_id);
CREATE INDEX IF NOT EXISTS idx_chapters_established ON chapters(established_date);

-- Resources indexes
CREATE INDEX IF NOT EXISTS idx_resources_subcategory ON resources(subcategory);
CREATE INDEX IF NOT EXISTS idx_resources_version ON resources(version_number);

-- Grants indexes
CREATE INDEX IF NOT EXISTS idx_grants_point_person ON grants(point_person_id);
CREATE INDEX IF NOT EXISTS idx_grants_app_deadline ON grants(application_deadline);

-- Analytics cache indexes
CREATE INDEX IF NOT EXISTS idx_analytics_cache_metric ON analytics_cache(metric_name);
CREATE INDEX IF NOT EXISTS idx_analytics_cache_date ON analytics_cache(date_generated DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_cache_scope ON analytics_cache(scope, scope_id);

-- Scheduled tasks indexes
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_enabled ON scheduled_tasks(enabled);
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_next_run ON scheduled_tasks(next_run_at);

-- Task assignments indexes
CREATE INDEX IF NOT EXISTS idx_task_assignments_assigned_to ON task_assignments(assigned_to);
CREATE INDEX IF NOT EXISTS idx_task_assignments_assigned_by ON task_assignments(assigned_by);
CREATE INDEX IF NOT EXISTS idx_task_assignments_status ON task_assignments(status);
CREATE INDEX IF NOT EXISTS idx_task_assignments_due ON task_assignments(due_date);
CREATE INDEX IF NOT EXISTS idx_task_assignments_priority ON task_assignments(priority);

-- Document permissions indexes
CREATE INDEX IF NOT EXISTS idx_doc_perms_user ON document_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_doc_perms_resource ON document_permissions(resource_id);
CREATE INDEX IF NOT EXISTS idx_doc_perms_level ON document_permissions(permission_level);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_blog_search ON blog_posts 
  USING gin(to_tsvector('english', title || ' ' || content));

CREATE INDEX IF NOT EXISTS idx_resources_search ON resources 
  USING gin(to_tsvector('english', COALESCE(filename, '') || ' ' || COALESCE(description, '')));

-- =====================================================
-- ENABLE RLS ON NEW TABLES
-- =====================================================

ALTER TABLE analytics_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_templates ENABLE ROW LEVEL SECURITY;

-- Analytics cache policies (founders only)
CREATE POLICY analytics_cache_founder_all ON analytics_cache FOR ALL 
  USING (user_role() = 'founder');

-- Scheduled tasks policies (founders only)
CREATE POLICY scheduled_tasks_founder_all ON scheduled_tasks FOR ALL 
  USING (user_role() = 'founder');

-- Task assignments policies
CREATE POLICY task_assignments_read_assigned ON task_assignments FOR SELECT 
  USING (assigned_to = auth.uid() OR user_role() IN ('founder','intern'));

CREATE POLICY task_assignments_create_staff ON task_assignments FOR INSERT 
  WITH CHECK (user_role() IN ('founder','intern'));

CREATE POLICY task_assignments_update_assigned ON task_assignments FOR UPDATE 
  USING (assigned_to = auth.uid() OR user_role() IN ('founder','intern'));

CREATE POLICY task_assignments_delete_founder ON task_assignments FOR DELETE 
  USING (user_role() = 'founder');

-- Document permissions policies
CREATE POLICY doc_perms_read_own ON document_permissions FOR SELECT 
  USING (user_id = auth.uid() OR user_role() = 'founder');

CREATE POLICY doc_perms_manage_founder ON document_permissions FOR ALL 
  USING (user_role() = 'founder');

-- Page templates policies
CREATE POLICY page_templates_read_all ON page_templates FOR SELECT 
  USING (true);

CREATE POLICY page_templates_manage_founder ON page_templates FOR ALL 
  USING (user_role() = 'founder');

