# Authentication & Role Setup Guide

## 🔐 How Authentication Works Now

### Login Flow
1. User goes to `/login`
2. Chooses either:
   - **Magic Link** (email)
   - **Google Sign-In**
3. After authentication, redirected to `/auth/callback`
4. Callback checks user's role in database
5. Redirects to appropriate dashboard:
   - **Founder** → `/dashboard/founder`
   - **Intern** → `/dashboard/intern`
   - **Volunteer** → `/dashboard/volunteer`
   - **Teacher** → `/dashboard` (default view)
   - **Partner** → `/dashboard` (default view)

### First-Time Users
- When a user signs in for the first time, they are automatically created in the `users` table
- Default role: **teacher**
- You need to manually upgrade them to founder/intern/volunteer

---

## 👑 Setting Up Founder Access

### Method 1: Setup Page (Easiest)
1. **Sign in first** with your Google account (`ayushg.2024@gmail.com`)
2. Go to: `http://localhost:3000/setup-founder`
3. Your email should already be filled in
4. Click **"Set as Founder"**
5. You'll see a success message
6. **Log out and log back in** to see founder features

### Method 2: API Call
```bash
# After signing in, call this API:
curl -X POST http://localhost:3000/api/admin/set-founder \
  -H "Content-Type: application/json" \
  -d '{"email":"ayushg.2024@gmail.com"}'
```

### Method 3: Direct Database (If you have Supabase access)
1. Go to Supabase Dashboard
2. Open SQL Editor
3. Run:
```sql
UPDATE users 
SET role = 'founder' 
WHERE email = 'ayushg.2024@gmail.com';
```

---

## 🎯 What Each Role Can Access

### 👑 Founder (Admin)
**Full access to everything:**
- `/dashboard/founder` - Comprehensive admin dashboard
- `/admin/*` - All admin pages:
  - `/admin/data` - Data manager (CRUD for all entities)
  - `/admin/blog` - Blog post manager
  - `/admin/content` - Website content editor
  - `/admin/navigation` - Menu editor
  - `/admin/email-templates` - Email template manager
  - `/admin/announcements` - Announcement manager
  - `/admin/settings/ai` - AI configuration
  - `/admin/geo` - Geographic data editor
  - `/admin/memberships` - Team management
- Can see all data, edit everything, manage users

### 💼 Intern
**Access to:**
- `/dashboard/intern` - Intern dashboard
- `/dashboard/intern/hours` - Approve volunteer hours
- `/dashboard/intern/data/projects` - Manage projects
- `/dashboard/intern/data/resources` - Manage resources
- Can upload files, manage their projects

### 🙋 Volunteer
**Access to:**
- `/dashboard/volunteer` - Volunteer dashboard
- `/dashboard/volunteer/hours` - Submit volunteer hours
- Can log hours, view their presentations

### 👨‍🏫 Teacher
**Access to:**
- `/dashboard` - Basic dashboard
- `/teachers/request` - Request presentations
- `/teachers/history` - View presentation history
- Can request and track presentations

### 🤝 Partner
**Access to:**
- `/dashboard` - Basic dashboard
- Limited view of organization data

---

## 🔧 Troubleshooting

### "I logged in but I'm still seeing the public site"
**Solution:**
1. Make sure you've set your role to founder (see methods above)
2. **Log out completely** (click Logout button)
3. **Log back in**
4. You should now see the founder dashboard

### "I can't access /admin pages"
**Check:**
1. Your role is set to `founder` in the database
2. You're logged in (check if you see "Dashboard" and "Logout" buttons)
3. Try logging out and back in

### "The setup page says 'User not found'"
**This means:**
- You haven't signed in yet
- **Solution:** Go to `/login` first, sign in with Google, THEN go to `/setup-founder`

### "After login, I'm redirected to home instead of dashboard"
**This was the old behavior. Now:**
- Clear your browser cache
- The new auth callback should redirect you properly
- If still having issues, check browser console for errors

---

## 📝 Quick Setup Checklist

For **ayushg.2024@gmail.com**:

- [ ] Go to `http://localhost:3000/login`
- [ ] Click "Continue with Google"
- [ ] Sign in with your Google account
- [ ] After redirect, go to `http://localhost:3000/setup-founder`
- [ ] Click "Set as Founder"
- [ ] Click "Logout" in top right
- [ ] Click "Login" and sign in again
- [ ] You should now see **Founder Dashboard** with full admin access!

---

## 🎨 What You'll See as Founder

### Navigation Bar
- **Dashboard** button (goes to founder dashboard)
- **Logout** button
- **Notification bell** with announcements

### Founder Dashboard (`/dashboard/founder`)
- Comprehensive KPIs and analytics
- Activity feed
- Upcoming calendar
- Task prioritization
- Team overview
- Quick actions:
  - Manage Data
  - Edit Content
  - View Analytics
  - Manage Blog
  - System Settings

### Admin Menu
You'll see links to all admin pages in your dashboard, including:
- **Data Manager** - Full CRUD for users, projects, resources, etc.
- **Blog Manager** - Create/edit/publish blog posts
- **Content Manager** - Edit website content blocks
- **Navigation Manager** - Customize menu links
- **Email Templates** - Customize automated emails
- **AI Settings** - Configure AI models and providers

---

## 🚀 Next Steps After Setup

1. **Explore the Founder Dashboard**
   - Check out all the KPIs and analytics
   - Review the activity feed
   - Look at upcoming events

2. **Manage Data**
   - Go to `/admin/data`
   - Add/edit users, projects, resources
   - Set roles for other team members

3. **Customize Content**
   - Go to `/admin/content`
   - Edit homepage sections
   - Update about page content

4. **Create Blog Posts**
   - Go to `/admin/blog`
   - Create your first post
   - Add a cover image
   - Publish it

5. **Set Up Team Members**
   - Have them sign in first
   - Go to `/admin/data`
   - Update their roles (intern, volunteer, etc.)

---

## 🔒 Security Notes

- Only founders can access `/admin/*` routes
- The middleware protects all `/dashboard`, `/settings`, and `/admin` routes
- Users must be authenticated to access protected routes
- Role checks happen on both client and server side
- Service role key is needed for the `set-founder` script (keep it secret!)

---

**Need help?** Check the browser console for any errors, or review the auth callback logs in your terminal.

