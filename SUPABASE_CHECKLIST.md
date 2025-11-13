# ✅ SUPABASE SETUP CHECKLIST

**Follow this step-by-step. Check off each item as you complete it.**

---

## 📋 **Quick Setup (10 Minutes Total)**

### **✅ STEP 1: Database Setup** (DONE!)
- [x] Ran `COMPLETE_DATABASE_SETUP.sql` in Supabase SQL Editor
- [x] All tables created
- [x] All RLS policies created
- [x] Founder user set up

**Status:** ✅ **COMPLETE!**

---

### **🔐 STEP 2: Enable Google Sign-In** (5 minutes)

**What you need to do:**

1. **Get Google OAuth Credentials:**
   - [ ] Go to: https://console.cloud.google.com/apis/credentials
   - [ ] Click "Create Credentials" → "OAuth 2.0 Client ID"
   - [ ] Application type: "Web application"
   - [ ] Name: "Green Silicon Valley"
   - [ ] Authorized redirect URIs: `https://rwcxtfwrkjmpltkwextr.supabase.co/auth/v1/callback`
   - [ ] Click "Create"
   - [ ] Copy "Client ID" and "Client Secret"

2. **Enable in Supabase:**
   - [ ] Go to: https://supabase.com/dashboard/project/rwcxtfwrkjmpltkwextr/auth/providers
   - [ ] Find "Google" and toggle **ON**
   - [ ] Paste Client ID and Client Secret
   - [ ] Click "Save"

**Status:** ⏳ **TO DO**

---

### **📁 STEP 3: Create Storage Buckets** (2 minutes)

**What you need to do:**

Go to: https://supabase.com/dashboard/project/rwcxtfwrkjmpltkwextr/storage/buckets

**Create these 4 buckets:**

1. **Bucket: `media`**
   - [ ] Click "Create a new bucket"
   - [ ] Name: `media`
   - [ ] Public: ✅ **YES**
   - [ ] File size limit: 50 MB
   - [ ] Click "Create bucket"

2. **Bucket: `blog-covers`**
   - [ ] Click "Create a new bucket"
   - [ ] Name: `blog-covers`
   - [ ] Public: ✅ **YES**
   - [ ] File size limit: 10 MB
   - [ ] Click "Create bucket"

3. **Bucket: `user-uploads`**
   - [ ] Click "Create a new bucket"
   - [ ] Name: `user-uploads`
   - [ ] Public: ❌ **NO**
   - [ ] File size limit: 50 MB
   - [ ] Click "Create bucket"

4. **Bucket: `verification-slips`**
   - [ ] Click "Create a new bucket"
   - [ ] Name: `verification-slips`
   - [ ] Public: ❌ **NO**
   - [ ] File size limit: 10 MB
   - [ ] Click "Create bucket"

**Status:** ⏳ **TO DO**

---

### **🔒 STEP 4: Set Storage Policies** (1 minute)

**What you need to do:**

1. **Go to Supabase SQL Editor:**
   - [ ] Go to: https://supabase.com/dashboard/project/rwcxtfwrkjmpltkwextr/sql/new

2. **Run the storage policies:**
   - [ ] Open file: `SUPABASE_STORAGE_POLICIES.sql`
   - [ ] Copy all contents
   - [ ] Paste into SQL Editor
   - [ ] Click "Run"
   - [ ] Verify you see: "✅ All storage policies created successfully!"

**Status:** ⏳ **TO DO**

---

### **🌐 STEP 5: Configure Site URL** (1 minute)

**What you need to do:**

1. **Go to URL Configuration:**
   - [ ] Go to: https://supabase.com/dashboard/project/rwcxtfwrkjmpltkwextr/auth/url-configuration

2. **Set Site URL:**
   - [ ] Site URL: `http://localhost:3000`

3. **Add Redirect URLs:**
   - [ ] Click "Add URL"
   - [ ] Add: `http://localhost:3000/**`
   - [ ] Click "Add URL"
   - [ ] Add: `http://localhost:3000/auth/callback`
   - [ ] Click "Save"

**Status:** ⏳ **TO DO**

---

### **⚡ STEP 6: Enable Realtime** (1 minute)

**What you need to do:**

1. **Go to Replication:**
   - [ ] Go to: https://supabase.com/dashboard/project/rwcxtfwrkjmpltkwextr/database/replication

2. **Enable Realtime for these tables:**
   - [ ] Toggle ON: `users`
   - [ ] Toggle ON: `volunteer_hours`
   - [ ] Toggle ON: `presentations`
   - [ ] Toggle ON: `bulletin_posts`
   - [ ] Toggle ON: `blog_posts`
   - [ ] Toggle ON: `page_sections`

**Status:** ⏳ **TO DO**

---

### **🔑 STEP 7: Add Service Role Key** (30 seconds)

**What you need to do:**

1. **Get Service Role Key:**
   - [ ] Go to: https://supabase.com/dashboard/project/rwcxtfwrkjmpltkwextr/settings/api
   - [ ] Find "service_role" section
   - [ ] Click "Copy" to copy the key

2. **Add to your project:**
   - [ ] Open file: `.env.local` (create if doesn't exist)
   - [ ] Add this line:
   ```
   SUPABASE_SERVICE_ROLE_KEY=paste-your-service-role-key-here
   ```
   - [ ] Save file

**Status:** ⏳ **TO DO**

---

## 🎯 **Progress Tracker**

**Completed:** 1/7 steps
- ✅ Database Setup

**Remaining:** 6/7 steps
- ⏳ Google Sign-In
- ⏳ Storage Buckets
- ⏳ Storage Policies
- ⏳ Site URL
- ⏳ Realtime
- ⏳ Service Role Key

**Estimated time remaining:** ~10 minutes

---

## ✅ **Verification**

**After completing all steps, test everything:**

### **Test 1: Google Sign-In**
- [ ] Go to `http://localhost:3000/login`
- [ ] Click "Sign in with Google"
- [ ] Should redirect to Google
- [ ] Should redirect back to dashboard
- [ ] ✅ **PASS** / ❌ **FAIL**

### **Test 2: File Upload**
- [ ] Go to `/admin/media-manager`
- [ ] Drag and drop an image
- [ ] Should upload successfully
- [ ] ✅ **PASS** / ❌ **FAIL**

### **Test 3: Permissions**
- [ ] Go to `/admin/permissions`
- [ ] Toggle a permission
- [ ] Should save automatically
- [ ] ✅ **PASS** / ❌ **FAIL**

### **Test 4: User Management**
- [ ] Go to `/admin/user-manager`
- [ ] Click "Add User"
- [ ] Fill in form
- [ ] Click "Create User"
- [ ] Should create successfully
- [ ] ✅ **PASS** / ❌ **FAIL**

---

## 🆘 **Having Issues?**

### **Google Sign-In Not Working:**
- ✅ Check redirect URI is exactly: `https://rwcxtfwrkjmpltkwextr.supabase.co/auth/v1/callback`
- ✅ Verify Client ID and Secret are correct
- ✅ Check Site URL is set to `http://localhost:3000`

### **File Upload Failing:**
- ✅ Verify all 4 buckets are created
- ✅ Check storage policies were run successfully
- ✅ Try refreshing the page

### **Can't Access Admin Tools:**
- ✅ Verify you're logged in
- ✅ Check your role is "founder" in database
- ✅ Clear browser cache and try again

---

## 🎉 **Done!**

**Once all checkboxes are checked:**
- ✅ Your Supabase is fully configured
- ✅ All features will work
- ✅ You can start using the platform!

**Next step:** Start the dev server and test everything!

```bash
npm run dev
```

Then go to: `http://localhost:3000`

---

**🌱 You're almost there! Just follow the checklist above!** ✨

