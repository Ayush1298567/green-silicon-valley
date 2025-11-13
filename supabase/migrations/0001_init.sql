-- Core users table (app-level metadata; links to auth.users)
create table if not exists users (
  id uuid primary key,
  name text,
  email text unique,
  role text check (role in ('founder','intern','volunteer','teacher')) default 'teacher',
  permissions jsonb default '[]'::jsonb
);

-- Schools
create table if not exists schools (
  id bigserial primary key,
  name text not null,
  district text,
  teacher_name text,
  email text,
  address text
);

-- Presentations
create table if not exists presentations (
  id bigserial primary key,
  school_id bigint references schools(id) on delete set null,
  volunteer_team text,
  topic text,
  date timestamptz,
  status text,
  feedback text,
  hours integer,
  files jsonb default '[]'::jsonb
);

-- Volunteers
create table if not exists volunteers (
  id bigserial primary key,
  user_id uuid references users(id) on delete set null,
  team_name text,
  hours_total integer default 0,
  milestones jsonb default '[]'::jsonb
);

-- Intern projects
create table if not exists intern_projects (
  id bigserial primary key,
  department text,
  task text,
  due_date date,
  status text,
  notes text
);

-- Chapters
create table if not exists chapters (
  id bigserial primary key,
  name text,
  region text,
  leader text,
  volunteers_count integer default 0,
  last_meeting_date date,
  next_review_date date,
  status text
);

-- Resources (Supabase Storage references)
create table if not exists resources (
  id bigserial primary key,
  filename text,
  file_type text,
  upload_date timestamptz default now(),
  uploader_id uuid references users(id) on delete set null
);

-- Rules & bylaws
create table if not exists rules_bylaws (
  id bigserial primary key,
  title text,
  content text,
  revision_date timestamptz default now(),
  editor_id uuid references users(id) on delete set null
);

-- Grants
create table if not exists grants (
  id bigserial primary key,
  name text,
  deadline date,
  status text,
  report_due date,
  notes text
);

-- Donations
create table if not exists donations (
  id bigserial primary key,
  donor_name text,
  amount numeric(12,2),
  date date,
  acknowledgment_sent boolean default false
);

-- System logs
create table if not exists system_logs (
  id bigserial primary key,
  timestamp timestamptz default now(),
  event_type text,
  description text
);

-- Settings
create table if not exists settings (
  id bigserial primary key,
  key text unique,
  value jsonb
);

-- Helpful indexes
create index if not exists idx_presentations_school on presentations(school_id);
create index if not exists idx_chapters_region on chapters(region);
create index if not exists idx_system_logs_event on system_logs(event_type);


