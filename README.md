# 🌱 Green Silicon Valley - Professional Nonprofit Platform

**A complete, AI-powered nonprofit platform with advanced administrative features and intelligent automation.**

---

## ✨ **What Makes This Special**

### **🤖 AI Agent Mode**
- ✅ **Conversational AI Assistant** - Natural language commands for all admin tasks
- ✅ **Intelligent Form Builder** - AI generates forms from plain English descriptions
- ✅ **Smart Analytics** - AI-powered insights and automated reporting
- ✅ **Workflow Automation** - AI creates and manages automated processes
- ✅ **Real-time Collaboration** - Multi-user editing with conflict resolution

### **🏗️ Complete Administrative Suite**
- ✅ **Visual Website Builder** - Drag-and-drop content management
- ✅ **Advanced User Management** - 30+ granular permissions across 5 roles
- ✅ **Content Management System** - Rich text editing, media library, blog platform
- ✅ **Data Tables & Analytics** - Inline editing, export, real-time dashboards
- ✅ **Email & Communication** - Templates, campaigns, notifications
- ✅ **Financial Tracking** - Donations, expenses, budget management

### **📊 Professional Features**
- ✅ **Google Authentication** - Secure OAuth integration
- ✅ **Role-Based Access Control** - Founder, Intern, Volunteer, Teacher, Partner roles
- ✅ **Real-time Notifications** - In-app and email notifications
- ✅ **Mobile-Responsive Design** - Professional UI across all devices
- ✅ **Data Export & Backup** - CSV, PDF, automated backups
- ✅ **Audit Logging** - Complete activity tracking

---

## 🚀 Quick Start for Interns

**New to the team?** Follow these 4 simple steps to get started:

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ayush1298567/green-silicon-valley.git
   cd green-silicon-valley
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local and replace .example with actual Supabase keys
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

**For detailed setup instructions, see [INTERN_SETUP.md](INTERN_SETUP.md)**

---

## 🚀 **Complete Setup Guide**

### **Option 1: Automated Setup (Recommended)**

```bash
# Clone the repository
git clone <your-repo-url>
cd green-silicon-valley

# Run the complete automated setup
npm run setup
```

That's it! The setup script will handle everything automatically.

### **Option 2: Manual Setup**

#### **Step 1: Clone & Install**
```bash
git clone <your-repo-url>
cd green-silicon-valley
npm install
```

#### **Step 2: Create Supabase Project**
1. Go to [Supabase Dashboard](https://supabase.com)
2. Click "New Project"
3. Choose your organization and region
4. Set project name (e.g., "Green Silicon Valley")
5. Set database password (save this!)
6. Wait for project creation (2-3 minutes)

#### **Step 3: Configure Environment**
```bash
# Edit .env.local with your Supabase credentials
# Get these from: Settings > API in your Supabase dashboard

NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

#### **Step 4: Set Up Database**
```bash
# Run database migrations and seeding
npm run db:migrate
npm run db:init
npm run create-content
npm run set-founder
```

#### **Step 5: Configure Google OAuth**
1. In Supabase Dashboard, go to **Authentication > Providers**
2. Enable **Google** provider
3. Add redirect URL: `http://localhost:3000/auth/callback`
4. Get Google OAuth credentials from [Google Cloud Console](https://console.cloud.google.com)
5. Add them to Supabase Google provider settings

#### **Step 6: Start Development Server**
```bash
npm run dev
```

Visit: `http://localhost:3000`

#### **Step 7: Verify Setup**
```bash
npm run verify
```

---

## 🔍 **Setup Verification**

Run this command to verify your setup is complete:

```bash
npm run verify
```

This will check:
- ✅ Environment variables configured
- ✅ Database tables created
- ✅ Sample data seeded
- ✅ Authentication configured
- ✅ Key components present

---

## 🤖 **AI Agent Mode - Your Intelligent Assistant**

Once logged in, activate AI Agent Mode to access conversational AI administration:

### **🎯 What AI Agent Can Do**
- **"Create a volunteer registration form for our climate program"** - AI generates complete forms
- **"Show me analytics for this month's volunteer engagement"** - AI analyzes data and creates reports
- **"Set up weekly progress reports for all teams"** - AI creates automated workflows
- **"Analyze volunteer application responses"** - AI provides insights and recommendations
- **"Generate a summary report of our impact this quarter"** - AI compiles comprehensive reports

### **🚀 Getting Started with AI Agent**
1. Log in as Founder or Intern
2. Look for the **AI Agent** button (floating chat bubble)
3. Click to open the conversational interface
4. Try commands like:
   - "Create a new volunteer form"
   - "Show me today's analytics"
   - "Set up automated notifications"

### **✨ AI Features Include**
- **Natural Language Processing** - Understands plain English commands
- **Context Awareness** - Learns your preferences and patterns
- **Multi-step Actions** - Handles complex workflows automatically
- **Approval Workflows** - Requires confirmation for sensitive actions
- **Data Analysis** - Provides insights and recommendations
- **Form Generation** - Creates Google Sheets-like forms from descriptions
- **Workflow Automation** - Sets up recurring tasks and notifications

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
