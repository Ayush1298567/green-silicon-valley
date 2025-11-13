# 🌱 Green Silicon Valley - 100% Codeless Platform

**A professional, full-stack nonprofit platform with complete visual management - zero code required!**

---

## ✨ **What Makes This Special**

### **100% Codeless Management**
- ✅ Visual website builder (drag-and-drop)
- ✅ Complete user management system
- ✅ Granular permissions control (30+ permissions)
- ✅ Content editor with rich text
- ✅ Media manager with drag-and-drop uploads
- ✅ Blog management with SEO
- ✅ Data tables with inline editing
- ✅ **Everything manageable from dashboards!**

### **Professional Design**
- ✅ Modern, minimalist, credible design
- ✅ Professional color palette (grounded green + warm secondary)
- ✅ Responsive across all devices
- ✅ Smooth animations and transitions
- ✅ Accessibility-first approach

### **Complete Feature Set**
- ✅ User authentication (Google Sign-In + Magic Link)
- ✅ Role-based access control (Founder, Intern, Volunteer, Teacher, Partner)
- ✅ Volunteer hours tracking and approval
- ✅ Presentation scheduling
- ✅ Internal bulletin board
- ✅ Public blog with RSS feed
- ✅ Analytics dashboard
- ✅ Real-time notifications

---

## 🚀 **Quick Start**

### **1. Clone & Install**
```bash
git clone <your-repo-url>
cd green-silicon-valley
npm install
```

### **2. Set Up Database**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Open SQL Editor
3. Copy contents of `COMPLETE_DATABASE_SETUP.sql`
4. Paste and run
5. Verify you see "✅ Database setup complete!"

### **3. Configure Environment**
```bash
# Copy example env file
cp .env.example .env.local

# Add your Supabase credentials:
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### **4. Start Development Server**
```bash
npm run dev
```

Visit: `http://localhost:3000`

### **5. Log In as Founder**
1. Go to `/login`
2. Sign in with Google using `ayushg.2024@gmail.com`
3. You'll be redirected to founder dashboard
4. Access all admin tools!

---

## 📋 **Admin Dashboard**

### **Quick Actions (All Codeless):**

1. **User Manager** (`/admin/user-manager`)
   - Add/edit/delete users
   - Change roles and status
   - Search and filter
   - Export to CSV

2. **Website Builder** (`/admin/website-builder`)
   - Drag-and-drop sections
   - Visual color picker
   - 8 section types
   - Preview mode

3. **Permissions** (`/admin/permissions`)
   - 30+ individual permissions
   - 8 permission categories
   - Per-user control
   - Visual toggles

4. **Blog Manager** (`/admin/blog`)
   - Rich text editor
   - Image uploads
   - SEO settings
   - Publish/unpublish

5. **Media Manager** (`/admin/media-manager`)
   - Drag-and-drop uploads
   - File previews
   - Public/private toggle
   - Search and filter

6. **Data Manager** (`/admin/data`)
   - View all data
   - Inline editing
   - Approve/reject hours
   - Export CSV

7. **Content Editor** (`/admin/content-editor`)
   - Edit page content
   - Visual editor
   - Preview changes
   - Publish when ready

---

## 🎨 **Tech Stack**

### **Frontend:**
- Next.js 15 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion (animations)
- Lucide Icons

### **Backend:**
- Supabase (PostgreSQL)
- Supabase Auth
- Supabase Storage
- Supabase Realtime
- Row-Level Security (RLS)

### **AI (Optional):**
- Ollama (local models)
- OpenRouter API
- LMStudio
- LocalAI

### **Deployment:**
- Vercel (recommended)
- Vercel Cron Jobs

---

## 📚 **Documentation**

### **Setup Guides:**
- `COMPLETE_DATABASE_SETUP.sql` - One-file database setup
- `COMPLETE_CODELESS_SETUP.md` - Full platform guide
- `SETUP_INSTRUCTIONS.md` - Quick setup steps

### **Feature Guides:**
- `CODELESS_PLATFORM_COMPLETE.md` - Website builder & permissions
- `FINAL_SUMMARY.md` - Complete overview
- `PHASE2_COMPLETE.md` - Phase 2 features

### **Design System:**
- `README_TRANSFORMATION.md` - Design system overview
- `COLOR_SCHEME_GUIDE.md` - Color palette
- `PROFESSIONAL_REDESIGN_PLAN.md` - Redesign roadmap

---

## 🎯 **Common Tasks**

### **Add New Team Member:**
1. Go to `/admin/user-manager`
2. Click "Add User"
3. Fill in name, email, role
4. Click "Create User"
5. Go to `/admin/permissions` to grant access

### **Edit Homepage:**
1. Go to `/admin/website-builder`
2. Select "Home Page"
3. Drag sections to reorder
4. Click section to edit
5. Preview and save

### **Approve Volunteer Hours:**
1. Go to `/admin/data`
2. Click "Volunteer Hours" tab
3. Find pending hours
4. Click "Approve" or "Reject"

### **Write Blog Post:**
1. Go to `/admin/blog`
2. Click "Create Post"
3. Write content
4. Upload cover image
5. Click "Publish"

---

## 🔒 **Security**

### **Authentication:**
- Google Sign-In (OAuth 2.0)
- Magic Link (passwordless)
- Session management
- Role-based routing

### **Authorization:**
- Row-Level Security (RLS)
- Granular permissions (30+)
- Server-side validation
- Permission checks on every request

### **Data Protection:**
- Encrypted at rest
- HTTPS in production
- Secure environment variables
- Audit trail ready

---

## 🌟 **Features**

### **User Management:**
- ✅ Add/edit/delete users
- ✅ 5 role types
- ✅ 4 status types
- ✅ Contact information
- ✅ Internal notes
- ✅ Search and filter
- ✅ Export to CSV

### **Website Builder:**
- ✅ Drag-and-drop sections
- ✅ 8 section types
- ✅ Visual color picker
- ✅ Preview mode
- ✅ Undo/Redo
- ✅ Export/Import

### **Permissions:**
- ✅ 30+ permissions
- ✅ 8 categories
- ✅ Per-user control
- ✅ Visual toggles
- ✅ Real-time updates

### **Content Management:**
- ✅ Rich text editor
- ✅ Image uploads
- ✅ Preview changes
- ✅ Publish control

### **Blog:**
- ✅ Rich editor
- ✅ Cover images
- ✅ SEO settings
- ✅ RSS feed
- ✅ Sitemap

### **Volunteer Management:**
- ✅ Hours tracking
- ✅ Approval workflow
- ✅ Email notifications
- ✅ Export reports

---

## 📊 **Project Structure**

```
green-silicon-valley/
├── app/                      # Next.js app directory
│   ├── admin/               # Admin dashboards
│   │   ├── user-manager/    # User management
│   │   ├── website-builder/ # Website builder
│   │   ├── permissions/     # Permissions control
│   │   ├── blog/            # Blog manager
│   │   ├── media-manager/   # Media manager
│   │   ├── content-editor/  # Content editor
│   │   └── data/            # Data manager
│   ├── dashboard/           # Role-based dashboards
│   ├── blog/                # Public blog
│   ├── api/                 # API routes
│   └── (public pages)/      # Home, About, Impact, etc.
├── components/              # React components
│   ├── ui/                  # UI components
│   ├── dashboard/           # Dashboard components
│   ├── home/                # Homepage components
│   └── editor/              # Editor components
├── lib/                     # Utilities
│   ├── supabase/            # Supabase clients
│   ├── auth/                # Auth utilities
│   └── ai/                  # AI utilities
├── supabase/                # Database migrations
└── public/                  # Static assets
```

---

## 🚀 **Deployment**

### **Deploy to Vercel:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### **Environment Variables:**
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_BASE_URL=
```

---

## 🆘 **Troubleshooting**

### **Can't Access Admin Tools:**
- Verify you're logged in as founder
- Check your role in Supabase
- Clear browser cache
- Run database migrations

### **Changes Not Saving:**
- Check network connection
- Verify Supabase credentials
- Check browser console
- Refresh page

### **Users Not Appearing:**
- Refresh page
- Check filters
- Verify database connection
- Run migrations

---

## 📞 **Support**

### **Documentation:**
- Check documentation files in project root
- Review troubleshooting section
- Check browser console for errors

### **Database Issues:**
- Verify migrations ran successfully
- Check RLS policies
- Verify user roles

---

## 🎉 **Success!**

**Your platform is:**
- ✅ 100% codeless
- ✅ Fully functional
- ✅ Production-ready
- ✅ Team-collaborative
- ✅ Secure and scalable

**You can:**
- ✅ Manage everything visually
- ✅ Grant access to anyone
- ✅ Control every feature
- ✅ Edit without code
- ✅ Scale with your team

---

## 📜 **License**

MIT License - feel free to use for your nonprofit!

---

## 🌱 **About Green Silicon Valley**

Green Silicon Valley is a student-led nonprofit dedicated to environmental education and sustainability. We empower the next generation of environmental leaders through hands-on STEM education and community engagement.

**Mission:** Educate and inspire students about environmental sustainability through interactive presentations and community programs.

**Vision:** A future where every student has access to quality environmental education and the tools to make a positive impact.

---

**Built with ❤️ by the Green Silicon Valley team**

**Contact:** greensiliconvalley27@gmail.com

**Website:** [Your website URL]

---

🌱 **Empowering the next generation through technology and education!** ✨
