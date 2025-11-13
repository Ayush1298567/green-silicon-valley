# 🚀 Complete Setup Instructions - Green Silicon Valley

## ⚡ Quick Start (10 Minutes)

Follow these steps to get your professional platform fully operational.

---

## 📋 **Step 1: Initialize Database (5 minutes)**

### **1.1 Open Supabase SQL Editor**

Go to: **https://supabase.com/dashboard/project/rwcxtfwrkjmpltkwextr/editor**

### **1.2 Run Database Setup**

1. Open the file `SETUP_DATABASE.sql` in your project root
2. **Copy ALL contents** (Ctrl+A, then Ctrl+C)
3. **Paste into Supabase SQL Editor** (Ctrl+V)
4. **Click "Run"** (or press Ctrl+Enter)

### **1.3 Verify Success**

You should see output showing:
```
✅ Founder Check: Founder exists
✅ Tables Created: 20+ tables
✅ RLS Enabled: 20+ tables with RLS
```

If you see errors, make sure you're using the **service role key** (not anon key) in your environment variables.

---

## 🧪 **Step 2: Test Functionality (2 minutes)**

### **2.1 Run Automated Tests**

Open your terminal in the project directory and run:

```bash
npm run test:functionality
```

### **2.2 Expected Output**

You should see:
```
🧪 Starting Functionality Tests...
✅ Database Connection: Successfully connected to Supabase
✅ Table: users: Exists
✅ Table: schools: Exists
... (all tables)
✅ Founder User: Found founder: ayushg.2024@gmail.com
✅ Storage Bucket: Resources bucket exists
✅ CRUD Operations: All operations successful
✅ Navigation Links: Found 6 navigation links
✅ Email Templates: Found 3 email templates

📊 Test Summary:
Total Tests: 25
✅ Passed: 25
❌ Failed: 0
Success Rate: 100.0%

🎉 All tests passed! Your database is fully functional.
```

---

## 🔐 **Step 3: Log In as Founder (1 minute)**

### **3.1 Access Login Page**

Visit: **http://localhost:3000/login**

### **3.2 Sign In with Google**

1. Click "Continue with Google"
2. Sign in with: **ayushg.2024@gmail.com**
3. You'll be redirected to: **/dashboard/founder**

### **3.3 Verify Founder Access**

You should see:
- Founder Dashboard with KPIs
- Full navigation menu
- Access to all admin tools

---

## 🛠️ **Step 4: Access Admin Tools**

Now you have access to all founder tools:

### **Media Manager**
**URL:** http://localhost:3000/admin/media-manager

**Features:**
- Upload images, PDFs, documents
- Grid and list views
- Search and filter
- File preview
- Download files
- Toggle public/private
- Delete files

### **Content Editor**
**URL:** http://localhost:3000/admin/content-editor

**Features:**
- Edit website content without code
- Select page (Home, About, Impact, etc.)
- Create new content blocks
- Edit existing blocks
- Preview mode
- HTML support

### **Data Manager**
**URL:** http://localhost:3000/admin/data

**Features:**
- Manage users (create, edit, delete, change roles)
- Manage intern projects
- Manage resources
- Manage rules & bylaws
- Manage grants
- Manage donations

### **Blog Manager**
**URL:** http://localhost:3000/admin/blog

**Features:**
- Create blog posts
- Edit existing posts
- Publish/unpublish
- Add cover images
- Rich text editing

### **Navigation Manager**
**URL:** http://localhost:3000/admin/navigation

**Features:**
- Add/remove menu items
- Reorder navigation
- Show/hide links

### **Email Templates**
**URL:** http://localhost:3000/admin/email-templates

**Features:**
- Customize automated emails
- Edit confirmation messages
- Modify notification templates

---

## 🎨 **Step 5: Customize Your Website**

### **5.1 Upload Your Logo**

1. Go to Media Manager
2. Upload your logo (SVG or PNG recommended)
3. Note the filename
4. Replace `/logo.svg` in `public/` folder

### **5.2 Add Hero Image**

1. Go to Media Manager
2. Upload a high-quality hero image (1920x1080 recommended)
3. Go to Content Editor
4. Select "Home Page"
5. Edit `hero_background` block
6. Add the image URL

### **5.3 Edit Homepage Content**

1. Go to Content Editor
2. Select "Home Page"
3. Edit blocks:
   - `hero_title` - Main headline
   - `hero_subtitle` - Subheading
   - `hero_description` - Description text
   - `impact_title` - Impact section title
   - `programs_intro` - Programs introduction
4. Click "Save" for each block

### **5.4 Update Social Media Links**

Edit `components/SocialMediaSection.tsx`:

```typescript
const socialLinks: SocialLink[] = [
  {
    name: "LinkedIn",
    url: "YOUR_LINKEDIN_URL", // Update this
    ...
  },
  {
    name: "YouTube",
    url: "YOUR_YOUTUBE_URL", // Update this
    ...
  },
  // ... update all URLs
];
```

### **5.5 Add Team Photos**

1. Go to Media Manager
2. Upload team photos
3. Make them public
4. Use in About page or Team section

---

## 📱 **Step 6: Update Social Media URLs**

### **Current Social Links (Update These)**

Open `components/SocialMediaSection.tsx` and update:

```typescript
const socialLinks: SocialLink[] = [
  {
    name: "LinkedIn",
    icon: <Linkedin className="w-6 h-6" />,
    url: "https://linkedin.com/company/green-silicon-valley", // ← Update
    color: "bg-[#0A66C2]",
    hoverColor: "hover:bg-[#004182]"
  },
  {
    name: "YouTube",
    icon: <Youtube className="w-6 h-6" />,
    url: "https://youtube.com/@greensiliconvalley", // ← Update
    color: "bg-[#FF0000]",
    hoverColor: "hover:bg-[#CC0000]"
  },
  {
    name: "Instagram",
    icon: <Instagram className="w-6 h-6" />,
    url: "https://instagram.com/greensiliconvalley", // ← Update
    color: "bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737]",
    hoverColor: "hover:opacity-90"
  },
  {
    name: "Discord",
    icon: <MessageCircle className="w-6 h-6" />,
    url: "https://discord.gg/greensiliconvalley", // ← Update
    color: "bg-[#5865F2]",
    hoverColor: "hover:bg-[#4752C4]"
  },
  {
    name: "Twitter",
    icon: <Twitter className="w-6 h-6" />,
    url: "https://twitter.com/greensiliconval", // ← Update
    color: "bg-[#1DA1F2]",
    hoverColor: "hover:bg-[#1A8CD8]"
  },
  {
    name: "Facebook",
    icon: <Facebook className="w-6 h-6" />,
    url: "https://facebook.com/greensiliconvalley", // ← Update
    color: "bg-[#1877F2]",
    hoverColor: "hover:bg-[#166FE5]"
  }
];
```

**To remove a social platform:** Simply delete its entry from the array.

**To add a new platform:** Copy an existing entry and modify the details.

---

## ✅ **Step 7: Verify Everything Works**

### **7.1 Test Homepage**

Visit: http://localhost:3000

**Check:**
- ✅ Hero section loads with animations
- ✅ Stats count up when scrolled into view
- ✅ Impact section displays correctly
- ✅ Programs cards have hover effects
- ✅ Social media buttons work
- ✅ Footer displays correctly

### **7.2 Test Navigation**

**Check:**
- ✅ All menu links work
- ✅ Mobile menu opens/closes
- ✅ Login/Logout buttons work
- ✅ Dashboard link appears when logged in

### **7.3 Test Admin Tools**

**Media Manager:**
- ✅ Upload a test image
- ✅ View in grid mode
- ✅ View in list mode
- ✅ Search for file
- ✅ Preview file
- ✅ Download file
- ✅ Delete file

**Content Editor:**
- ✅ Select a page
- ✅ Edit a content block
- ✅ Save changes
- ✅ Preview changes
- ✅ Create new block
- ✅ Delete a block

**Data Manager:**
- ✅ View users list
- ✅ Create test user
- ✅ Edit user role
- ✅ Delete test user

---

## 🎉 **Success!**

Your Green Silicon Valley platform is now fully operational!

### **What You Have:**
- ✅ Professional, grant-worthy design
- ✅ Complete admin tools for founders
- ✅ Media management system
- ✅ Visual content editor
- ✅ Social media integration
- ✅ Automated testing
- ✅ Database fully configured
- ✅ Authentication working
- ✅ All CRUD operations functional

### **What You Can Do:**
- Upload and manage media files
- Edit website content without code
- Manage users and roles
- Create blog posts
- Customize navigation
- Edit email templates
- Track analytics
- Manage presentations
- Approve volunteer hours
- And much more!

---

## 🆘 **Troubleshooting**

### **Database Setup Failed**

**Problem:** SQL errors when running SETUP_DATABASE.sql

**Solution:**
1. Make sure you're in the SQL Editor (not Table Editor)
2. Verify you have admin access to Supabase
3. Try running sections one at a time
4. Check for existing tables (might need to drop them first)

### **Tests Failing**

**Problem:** `npm run test:functionality` shows failures

**Solution:**
1. Verify database setup completed successfully
2. Check environment variables are set
3. Ensure `SUPABASE_SERVICE_ROLE_KEY` is in `.env.local`
4. Try restarting the dev server

### **Can't Log In**

**Problem:** Login doesn't work or doesn't redirect

**Solution:**
1. Clear browser cache
2. Try incognito mode
3. Verify Google OAuth is configured in Supabase
4. Check browser console for errors
5. Ensure you're using the correct email

### **Founder Access Not Working**

**Problem:** Don't see admin tools after logging in

**Solution:**
1. Verify founder role in database:
   ```sql
   SELECT * FROM users WHERE email = 'ayushg.2024@gmail.com';
   ```
2. If role is not 'founder', run:
   ```sql
   UPDATE users SET role = 'founder' WHERE email = 'ayushg.2024@gmail.com';
   ```
3. Log out completely
4. Clear browser cache
5. Log back in

### **Media Upload Not Working**

**Problem:** Can't upload files to Media Manager

**Solution:**
1. Verify Storage bucket exists in Supabase
2. Check bucket name is "resources"
3. Verify RLS policies allow uploads
4. Check file size limits
5. Try smaller files first

---

## 📞 **Need Help?**

If you encounter any issues:

1. **Check browser console** - Press F12 and look for errors
2. **Check terminal** - Look for server errors
3. **Review documentation** - Read the guide files in project root
4. **Test systematically** - Use the test script to identify issues
5. **Clear cache** - Often solves mysterious issues

---

## 🎯 **Next Steps**

Now that everything is set up:

1. **Add real content** - Upload images, write copy, create blog posts
2. **Customize design** - Adjust colors, fonts, spacing
3. **Test thoroughly** - Try all features, all roles, all devices
4. **Invite team** - Add other founders, interns, volunteers
5. **Launch** - Deploy to production when ready

---

**Congratulations! Your professional platform is ready to make an impact!** 🌱✨

