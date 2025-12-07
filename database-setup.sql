-- Green Silicon Valley Database Setup
-- Copy and paste this entire script into Supabase SQL Editor
-- Go to: https://supabase.com/dashboard/project/rwcxtfwrkjmpltkwextr/editor

-- Create users table for authentication and role management
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY,
  name text,
  email text UNIQUE,
  role text CHECK (role IN ('founder','intern','volunteer','teacher','partner')) DEFAULT 'teacher',
  permissions jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security for security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for secure access
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Success! Your database is now ready for the application.
-- You should see: "Success. No rows returned."

-- Optional: To set yourself as founder, run this additional SQL:
-- (Replace 'your-email@gmail.com' with your actual email)
--
-- INSERT INTO users (id, email, name, role)
-- SELECT
--   id,
--   email,
--   COALESCE(raw_user_meta_data->>'full_name', email) as name,
--   'founder' as role
-- FROM auth.users
-- WHERE email = 'your-email@gmail.com'
-- ON CONFLICT (id) DO UPDATE
-- SET role = 'founder';
