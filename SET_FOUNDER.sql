-- Run this in your Supabase SQL Editor to set ayushg.2024@gmail.com as founder
-- https://supabase.com/dashboard/project/rwcxtfwrkjmpltkwextr/editor

-- First, check if the users table exists
-- If this fails, you need to run the migration first

-- Option 1: If user already exists (has signed in before)
UPDATE users 
SET role = 'founder' 
WHERE email = 'ayushg.2024@gmail.com';

-- Option 2: If user doesn't exist yet, insert them
-- (This will work after they sign in at least once, as the auth.users entry must exist)
INSERT INTO users (id, email, name, role)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', email) as name,
  'founder' as role
FROM auth.users
WHERE email = 'ayushg.2024@gmail.com'
ON CONFLICT (id) DO UPDATE 
SET role = 'founder';

-- Verify the change
SELECT id, email, name, role 
FROM users 
WHERE email = 'ayushg.2024@gmail.com';

