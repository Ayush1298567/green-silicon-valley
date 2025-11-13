# 🚀 Quick Database Setup

Your database tables don't exist yet. Here's how to fix it:

## Option 1: Run SQL in Supabase (Fastest!)

1. **Go to Supabase SQL Editor:**
   ```
   https://supabase.com/dashboard/project/rwcxtfwrkjmpltkwextr/editor
   ```

2. **Click "New Query"**

3. **Copy and paste this SQL:**

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY,
  name text,
  email text UNIQUE,
  role text CHECK (role IN ('founder','intern','volunteer','teacher','partner')) DEFAULT 'teacher',
  permissions jsonb DEFAULT '[]'::jsonb
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Create policy to allow authenticated users to insert (for first login)
CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Now set yourself as founder
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

-- Verify it worked
SELECT id, email, name, role FROM users WHERE email = 'ayushg.2024@gmail.com';
```

4. **Click "Run" (or press Ctrl+Enter)**

5. **You should see your user with role = 'founder'**

6. **Done! Now log out and log back in to see founder features!**

---

## Option 2: Use the Full Migration File

If you want to create ALL tables (not just users):

1. Go to: `https://supabase.com/dashboard/project/rwcxtfwrkjmpltkwextr/editor`
2. Click "New Query"
3. Open the file: `supabase/migrations/0001_init.sql`
4. Copy ALL the contents
5. Paste into Supabase SQL Editor
6. Click "Run"
7. Then run the founder SQL from Option 1 above

---

## ✅ After Running the SQL

1. **Log out** of your website (click Logout button)
2. **Log back in** (click Login → Continue with Google)
3. **You'll now see the Founder Dashboard!** 🎉

---

## 🎯 What You'll See

After logging back in as founder, you'll have access to:
- `/dashboard/founder` - Full admin dashboard
- `/admin/data` - Manage all data
- `/admin/blog` - Create blog posts
- `/admin/content` - Edit website content
- All other admin features!

---

## 🆘 Need Help?

If you see any errors:
1. Make sure you're logged into Supabase
2. Make sure you're in the correct project (rwcxtfwrkjmpltkwextr)
3. Check the SQL Editor for error messages
4. The most important part is creating the `users` table and setting your role to 'founder'

