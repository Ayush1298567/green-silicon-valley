# 🌱 Green Silicon Valley - Website Preview & Structure

## 🏠 **Homepage (`/`)**

### Hero Section
- **Full-screen animated hero** with gradient background (slate-900 → green)
- **Headline**: "Empowering Students Through Environmental STEM"
- **Subtext**: "High school volunteers teaching elementary and middle school students about sustainability"
- **Two CTA buttons**: 
  - "Become a Volunteer" (green button)
  - "Request a Presentation" (outlined button)
- **Quick stats** (animated counters):
  - Schools Reached (X+)
  - Active Volunteers (X+)
  - Presentations (X+)
- **Right side**: Lottie animation or placeholder visual
- **Scroll indicator** at bottom

### Impact Showcase Section
- **4 large stat cards** with icons:
  - Schools Partnered (School icon, green)
  - Student Volunteers (Users icon, warm orange)
  - Volunteer Hours (Clock icon, blue)
  - Presentations Delivered (Award icon, purple)
- Each card has animated counters and descriptions
- **Background**: Light gray with subtle patterns

### Programs Showcase Section
- **Grid of program cards** showing:
  - Environmental Education Programs
  - STEM Workshops
  - Community Outreach
- Each with icons, descriptions, and "Learn More" buttons

### Testimonials Carousel
- **Section title**: "What People Say"
- **Carousel** with testimonials from teachers, students, volunteers
- Auto-rotating cards with quotes and author info

### Recent Blog Posts
- **Section title**: "Latest from Our Blog"
- **Grid of 3 recent blog posts** with:
  - Cover images
  - Titles
  - Categories
  - Dates
- "Read More Articles →" link

### Partner Logos Section
- **Title**: "Our Partners"
- **Grid of partner organization logos**
- Gray background

### Social Media Section
- Links to social media platforms
- Icons for Instagram, Twitter, LinkedIn, etc.

### Call-to-Action Section
- **Full-width gradient section** (green → dark green → slate)
- **Large headline**: "Ready to Make an Impact?"
- **Subtext**: "Join our community of student leaders..."
- **Two buttons**:
  - "Get Involved" (white button)
  - "Support Our Mission" (outlined white button)
- **Decorative blobs** and patterns

---

## 🧭 **Navigation Bar**

**Sticky header** with:
- **Logo** (left) - Green Silicon Valley logo
- **Navigation links** (center):
  - Home
  - About
  - Impact
  - Get Involved
  - Contact
  - Blog
- **Right side**:
  - Notifications bell (if logged in)
  - Login button OR User menu (if logged in)
  - Mobile menu (hamburger)

---

## 📄 **Public Pages**

### `/about` - About Page
- Organization mission and vision
- History and background
- Team information

### `/impact` - Impact Page
- **Interactive map** showing schools and chapters (Leaflet)
- **Impact statistics** with charts
- **Success stories** section
- **Schools table** with filtering

### `/get-involved` - Get Involved Page
- **Three signup forms**:
  - Volunteer signup
  - Intern application
  - Teacher request form
- Each with fields and submission

### `/contact` - Contact Page
- Contact form with:
  - Name
  - Email
  - Message
- Submit button

### `/blog` - Blog Listing
- Grid/list of blog posts
- Filtering by category
- Search functionality
- Pagination

### `/blog/[slug]` - Blog Post Detail
- Full blog post content
- Cover image
- Author info
- Related posts

### `/donate` - Donation Page
- Donation form
- Payment integration
- Impact information

### `/teachers/request` - Teacher Request Form
- School information form
- Presentation request details
- Calendar selection

---

## 🔐 **Authentication**

### `/login` - Login Page
- **Two login options**:
  - Google Sign-In button
  - Magic Link email input
- Clean, centered design
- Link to signup/register

### `/auth/callback` - Auth Callback
- Handles OAuth redirects
- Redirects to dashboard after login

---

## 📊 **Dashboards** (Requires Login)

### `/dashboard` - Dashboard Index
- Redirects to role-specific dashboard:
  - `/dashboard/founder` - Founder dashboard
  - `/dashboard/intern` - Intern dashboard
  - `/dashboard/volunteer` - Volunteer dashboard

### `/dashboard/founder` - Founder Dashboard
**Main sections:**
- **Quick Actions** cards:
  - View Applications
  - Manage Volunteers
  - Schedule Presentations
  - Generate Reports
- **Recent Applications** widget
- **Upcoming Calendar** events
- **Alerts & Notifications**
- **Analytics Overview**:
  - Total volunteers
  - Active chapters
  - Pending approvals
  - Recent activity

**Sub-pages:**
- `/dashboard/founder/volunteers` - Volunteer management
- `/dashboard/founder/presentations` - Presentation scheduling
- `/dashboard/founder/users` - User management
- `/dashboard/founder/permissions` - Granular permissions
- `/dashboard/founder/training` - Training materials
- `/dashboard/founder/workflows` - Workflow automation
- `/dashboard/founder/email-templates` - Email templates
- `/dashboard/founder/bulletin` - Internal bulletin board

### `/dashboard/intern` - Intern Dashboard
**Department-specific interfaces:**
- **Technology** - Tech projects and tasks
- **Communications** - Blog, bulletins, email templates
- **Outreach** - School partnerships, presentations
- **Operations** - Internal operations
- **Media** - Media management
- **Volunteer Development** - Volunteer training

**Features:**
- Task list with priorities
- Project tracking
- Activity feed
- Department-specific widgets

### `/dashboard/volunteer` - Volunteer Dashboard
**Main sections:**
- **Welcome banner** (if orientation incomplete)
- **Quick stats**:
  - Total Hours
  - This Month Hours
  - Presentations Completed
  - Status (Active/Pending)
- **Progress tracker** with milestones:
  - Getting Started (10 hours)
  - Dedicated Volunteer (25 hours)
  - Community Leader (50 hours)
  - Impact Champion (100 hours)
- **Upcoming Presentations** widget
- **Hours Log** widget
- **Training Resources** widget
- **Quick Actions**:
  - View My Presentations
  - Log Hours
  - Edit Profile
- **Impact stats**:
  - Students Reached
  - Schools Visited
  - Team Rank

**Sub-pages:**
- `/dashboard/volunteer/hours` - Hours logging interface
- `/dashboard/volunteer/presentations` - My presentations

---

## ⚙️ **Admin Panel** (`/admin/*`)

### `/admin/user-manager` - User Management
- User list with roles
- Create/edit users
- Role assignment
- Permissions management

### `/admin/permissions` - Permissions System
- **Granular permissions** (30+ permissions):
  - Content permissions
  - User management
  - Financial permissions
  - Analytics access
  - etc.
- Assign permissions to users/roles

### `/admin/blog` - Blog Management
- List all blog posts
- Create/edit posts
- Rich text editor (TipTap)
- Image uploads
- SEO settings
- Publish/unpublish

### `/admin/content-editor` - Content Editor
- Visual content editor
- Page builder interface

### `/admin/website-builder` - Website Builder
- Drag-and-drop page builder
- Content blocks
- Layout customization

### `/admin/media-manager` - Media Manager
- File upload interface
- Image gallery
- File organization
- Drag-and-drop uploads

### `/admin/email-templates` - Email Templates
- Template list
- Create/edit templates
- Variable substitution
- Preview functionality

### `/admin/marketing` - Marketing Tools
- Campaign management
- Email campaigns
- Automation rules

### `/admin/settings` - Settings
- General settings
- AI configuration
- Automation schedules
- System preferences

---

## 🎨 **Design System**

### Colors
- **Primary Green**: `gsv-green` (#2D8659)
- **Dark Green**: `gsv-greenDark` (#1F5F3F)
- **Light Green**: `gsv-greenLight` (#4CAF7A)
- **Warm Orange**: `gsv-warm` (#FF8C42)
- **Charcoal**: `gsv-charcoal` (#2C3E50)
- **Slate**: `gsv-slate-900` (#0F172A)

### Typography
- **Font**: Inter (Google Fonts)
- **Headings**: Bold, large sizes
- **Body**: Regular weight, readable sizes

### Components
- **Cards**: Rounded corners, subtle shadows
- **Buttons**: Rounded, hover effects, transitions
- **Forms**: Clean inputs, labels, validation
- **Modals**: Overlay, centered, backdrop blur
- **Animations**: Framer Motion for smooth transitions

---

## 🔧 **Key Features**

✅ **100% Codeless Management** - Visual interfaces for everything
✅ **Role-Based Access Control** - Founder, Intern, Volunteer, Teacher roles
✅ **Real-time Updates** - Supabase realtime subscriptions
✅ **AI Integration** - Knowledge assistant, operations assistant
✅ **Email System** - Templates, campaigns, notifications
✅ **Analytics Dashboard** - Charts, metrics, insights
✅ **File Storage** - Supabase Storage for uploads
✅ **Blog System** - Full CMS with SEO
✅ **Messaging** - Internal messaging system
✅ **Task Management** - Task tracking and workflows
✅ **Volunteer Hours** - Logging and approval system
✅ **Presentation Scheduling** - Calendar-based scheduling
✅ **Responsive Design** - Mobile, tablet, desktop

---

## 📱 **Mobile Experience**

- **Responsive navigation** - Hamburger menu
- **Touch-friendly** - Large buttons, proper spacing
- **Mobile-optimized** - Stacked layouts on small screens
- **Fast loading** - Optimized images and code splitting

---

## 🚀 **Performance Features**

- **Server-side rendering** (SSR) for SEO
- **Image optimization** with Next.js Image
- **Code splitting** for faster loads
- **Caching** for API responses
- **Lazy loading** for components

---

This is a comprehensive, professional nonprofit platform with extensive features for managing volunteers, content, and operations - all accessible through visual interfaces without needing to write code!

