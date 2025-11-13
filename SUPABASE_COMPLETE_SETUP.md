# 🚀 SUPABASE COMPLETE SETUP GUIDE

## ✅ **What You've Already Done**
- ✅ Created Supabase project
- ✅ Ran `COMPLETE_DATABASE_SETUP.sql`
- ✅ All tables and RLS policies created

---

## 📋 **What You Still Need to Do (5 Minutes)**

### **Step 1: Enable Google OAuth** 🔐

**Why:** So users can sign in with Google

**How:**
1. Go to: https://supabase.com/dashboard/project/rwcxtfwrkjmpltkwextr/auth/providers
2. Find "Google" in the list
3. Click to expand
4. Toggle "Enable Google Provider" to **ON**
5. You'll need Google OAuth credentials:

**Get Google OAuth Credentials:**
1. Go to: https://console.cloud.google.com/apis/credentials
2. Create new project or select existing
3. Click "Create Credentials" → "OAuth 2.0 Client ID"
4. Application type: "Web application"
5. Name: "Green Silicon Valley"
6. Authorized redirect URIs:
   ```
   https://rwcxtfwrkjmpltkwextr.supabase.co/auth/v1/callback
   ```
7. Click "Create"
8. Copy "Client ID" and "Client Secret"
9. Paste into Supabase Google provider settings
10. Click "Save"

---

### **Step 2: Configure Storage Buckets** 📁

**Why:** So you can upload images, PDFs, and documents

**How:**
1. Go to: https://supabase.com/dashboard/project/rwcxtfwrkjmpltkwextr/storage/buckets
2. Click "Create a new bucket"
3. Create these buckets:

**Bucket 1: `media`**
- Name: `media`
- Public: ✅ Yes
- File size limit: 50 MB
- Allowed MIME types: Leave empty (allow all)
- Click "Create bucket"

**Bucket 2: `blog-covers`**
- Name: `blog-covers`
- Public: ✅ Yes
- File size limit: 10 MB
- Allowed MIME types: `image/jpeg, image/png, image/webp, image/gif`
- Click "Create bucket"

**Bucket 3: `user-uploads`**
- Name: `user-uploads`
- Public: ❌ No (private)
- File size limit: 50 MB
- Allowed MIME types: Leave empty
- Click "Create bucket"

**Bucket 4: `verification-slips`**
- Name: `verification-slips`
- Public: ❌ No (private)
- File size limit: 10 MB
- Allowed MIME types: `image/jpeg, image/png, application/pdf`
- Click "Create bucket"

---

### **Step 3: Set Up Storage Policies** 🔒

**Why:** Control who can upload/view files

**How:**
1. Go to: https://supabase.com/dashboard/project/rwcxtfwrkjmpltkwextr/storage/policies
2. For each bucket, click "New Policy"

**For `media` bucket:**
```sql
-- Policy 1: Anyone can view
CREATE POLICY "Anyone can view media"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

-- Policy 2: Authenticated users can upload
CREATE POLICY "Authenticated users can upload media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'media' 
  AND auth.role() = 'authenticated'
);

-- Policy 3: Founders can delete
CREATE POLICY "Founders can delete media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'media'
  AND EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'founder'
  )
);
```

**For `blog-covers` bucket:**
```sql
-- Policy 1: Anyone can view
CREATE POLICY "Anyone can view blog covers"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-covers');

-- Policy 2: Users with blog permission can upload
CREATE POLICY "Blog authors can upload covers"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'blog-covers'
  AND EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND (
      role = 'founder' 
      OR permissions @> '["blog.create"]'::jsonb
    )
  )
);

-- Policy 3: Founders can delete
CREATE POLICY "Founders can delete blog covers"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'blog-covers'
  AND EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'founder'
  )
);
```

**For `user-uploads` bucket:**
```sql
-- Policy 1: Users can view their own uploads
CREATE POLICY "Users can view own uploads"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'user-uploads'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Users can upload to their own folder
CREATE POLICY "Users can upload to own folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-uploads'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: Founders can view all
CREATE POLICY "Founders can view all uploads"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'user-uploads'
  AND EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'founder'
  )
);
```

**For `verification-slips` bucket:**
```sql
-- Policy 1: Users can view their own slips
CREATE POLICY "Users can view own slips"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'verification-slips'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Users can upload their own slips
CREATE POLICY "Users can upload own slips"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'verification-slips'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: Founders can view all slips
CREATE POLICY "Founders can view all slips"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'verification-slips'
  AND EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'founder'
  )
);
```

---

### **Step 4: Configure Email Templates** 📧

**Why:** Customize emails sent to users

**How:**
1. Go to: https://supabase.com/dashboard/project/rwcxtfwrkjmpltkwextr/auth/templates
2. Customize these templates:

**Confirm Signup:**
```html
<h2>Welcome to Green Silicon Valley!</h2>
<p>Click the link below to confirm your email:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm Email</a></p>
```

**Magic Link:**
```html
<h2>Sign in to Green Silicon Valley</h2>
<p>Click the link below to sign in:</p>
<p><a href="{{ .ConfirmationURL }}">Sign In</a></p>
```

**Reset Password:**
```html
<h2>Reset Your Password</h2>
<p>Click the link below to reset your password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
```

---

### **Step 5: Configure Site URL** 🌐

**Why:** For redirects to work correctly

**How:**
1. Go to: https://supabase.com/dashboard/project/rwcxtfwrkjmpltkwextr/auth/url-configuration
2. Set these URLs:

**Site URL:**
```
http://localhost:3000
```

**Redirect URLs (add all):**
```
http://localhost:3000/**
http://localhost:3000/auth/callback
https://your-production-domain.com/**
https://your-production-domain.com/auth/callback
```

---

### **Step 6: Enable Realtime** ⚡

**Why:** For live updates in messaging and notifications

**How:**
1. Go to: https://supabase.com/dashboard/project/rwcxtfwrkjmpltkwextr/database/replication
2. Enable Realtime for these tables:
   - ✅ `users`
   - ✅ `volunteer_hours`
   - ✅ `presentations`
   - ✅ `bulletin_posts`
   - ✅ `blog_posts`
   - ✅ `page_sections`

---

### **Step 7: Get Your API Keys** 🔑

**Why:** Your app needs these to connect to Supabase

**How:**
1. Go to: https://supabase.com/dashboard/project/rwcxtfwrkjmpltkwextr/settings/api
2. Copy these keys:

**You already have these in your code:**
- ✅ Project URL: `https://rwcxtfwrkjmpltkwextr.supabase.co`
- ✅ Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

**You also need (for admin operations):**
- Service Role Key: Copy from "service_role" section

**Add to `.env.local`:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://rwcxtfwrkjmpltkwextr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3Y3h0Zndya2ptcGx0a3dleHRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2NTQ4NzksImV4cCI6MjA3ODIzMDg3OX0.PDcM1DXEaePZ588ScZxbsuXlKz2jifv_EdtpCZEoEIM
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

---

## 🎯 **Quick Checklist**

Use this to track your progress:

- [ ] **Step 1:** Enable Google OAuth
- [ ] **Step 2:** Create 4 storage buckets
- [ ] **Step 3:** Set up storage policies
- [ ] **Step 4:** Customize email templates
- [ ] **Step 5:** Configure site URL
- [ ] **Step 6:** Enable Realtime
- [ ] **Step 7:** Add service role key to `.env.local`

---

## 🤖 **Auto-Permissions System**

**Good news!** The permission system is already set up to automatically handle new features!

### **How It Works:**

**When you add a new feature, just use this naming convention:**

```typescript
// Example: New feature for managing events
permissions @> '["events.view"]'::jsonb      // Can view events
permissions @> '["events.create"]'::jsonb    // Can create events
permissions @> '["events.edit"]'::jsonb      // Can edit events
permissions @> '["events.delete"]'::jsonb    // Can delete events
```

**Permission Naming Convention:**
```
[category].[action]

Categories:
- website (website management)
- content (content management)
- blog (blog management)
- media (media management)
- users (user management)
- volunteers (volunteer management)
- presentations (presentation management)
- analytics (analytics & reports)
- events (event management) ← NEW!
- donations (donation management) ← NEW!
- [anything you want] ← NEW!

Actions:
- view (read access)
- create (create new items)
- edit (modify existing items)
- delete (remove items)
- approve (approve submissions)
- publish (make public)
- [anything you want] ← NEW!
```

### **Adding New Permissions:**

**Option 1: Via Permissions Dashboard (Codeless)**
1. Go to `/admin/permissions`
2. Find user
3. Toggle new permission on
4. Done!

**Option 2: Via Database (for defaults)**
```sql
-- Add new permission category for all founders
UPDATE users 
SET permissions = permissions || '["events.view", "events.create", "events.edit", "events.delete"]'::jsonb
WHERE role = 'founder';

-- Add new permission for specific user
UPDATE users 
SET permissions = permissions || '["events.view"]'::jsonb
WHERE email = 'user@example.com';
```

**Option 3: In Code (for new features)**
```typescript
// In your RLS policy or API route
EXISTS (
  SELECT 1 FROM users 
  WHERE id = auth.uid() 
  AND (
    role = 'founder' 
    OR permissions @> '["events.view"]'::jsonb
  )
)
```

### **Auto-Grant to Founders:**

All founders automatically get ALL permissions. When you add a new feature:

```sql
-- Run this to grant new permissions to all founders
UPDATE users 
SET permissions = permissions || '["new.permission"]'::jsonb
WHERE role = 'founder'
AND NOT (permissions @> '["new.permission"]'::jsonb);
```

---

## 🔒 **RLS Policy Template**

**For any new table you create, use this template:**

```sql
-- Enable RLS
ALTER TABLE your_new_table ENABLE ROW LEVEL SECURITY;

-- Policy 1: Founders can do everything
CREATE POLICY "Founders can manage [table]" ON your_new_table
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'founder'
    )
  );

-- Policy 2: Users with permission can view
CREATE POLICY "Users with permission can view [table]" ON your_new_table
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (
        role = 'founder' 
        OR permissions @> '["category.view"]'::jsonb
      )
    )
  );

-- Policy 3: Users with permission can create
CREATE POLICY "Users with permission can create [table]" ON your_new_table
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (
        role = 'founder' 
        OR permissions @> '["category.create"]'::jsonb
      )
    )
  );

-- Policy 4: Users with permission can edit
CREATE POLICY "Users with permission can edit [table]" ON your_new_table
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (
        role = 'founder' 
        OR permissions @> '["category.edit"]'::jsonb
      )
    )
  );

-- Policy 5: Users with permission can delete
CREATE POLICY "Users with permission can delete [table]" ON your_new_table
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (
        role = 'founder' 
        OR permissions @> '["category.delete"]'::jsonb
      )
    )
  );
```

---

## 📊 **Verification**

**After completing all steps, verify everything works:**

1. **Test Google Sign-In:**
   - Go to `/login`
   - Click "Sign in with Google"
   - Should redirect to Google OAuth
   - Should redirect back to dashboard

2. **Test File Upload:**
   - Go to `/admin/media-manager`
   - Drag and drop an image
   - Should upload successfully

3. **Test Permissions:**
   - Go to `/admin/permissions`
   - Toggle a permission
   - Should save automatically

4. **Test Realtime:**
   - Open two browser windows
   - Edit something in one
   - Should update in the other

---

## 🆘 **Troubleshooting**

### **Google Sign-In Not Working:**
- Check redirect URI matches exactly
- Verify OAuth credentials are correct
- Check Site URL is set correctly

### **File Upload Failing:**
- Verify buckets are created
- Check storage policies are set
- Verify file size is under limit

### **Permissions Not Saving:**
- Check RLS policies exist
- Verify you're logged in as founder
- Check browser console for errors

### **Realtime Not Working:**
- Verify Realtime is enabled for tables
- Check browser console for connection errors
- Refresh page and try again

---

## 🎉 **You're Done!**

**Once you complete these steps:**
- ✅ Google Sign-In will work
- ✅ File uploads will work
- ✅ Permissions will work
- ✅ Realtime updates will work
- ✅ Everything will be fully functional!

**Estimated time:** 5-10 minutes

**Next step:** Test everything by logging in and trying each feature!

---

## 📞 **Need Help?**

If you get stuck:
1. Check the troubleshooting section
2. Check browser console for errors
3. Verify each step was completed
4. Check Supabase dashboard for errors

---

**🌱 Your Supabase setup will be complete after these steps!** ✨

