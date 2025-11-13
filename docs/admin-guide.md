## Admin Guide (Founders)

This quick guide shows how to manage Green Silicon Valley without touching code.

### Sign in
- Use Google Sign-In at `/login`. Founders are routed to `/dashboard/founder`.

### Navigation & Content
- Navigation links: `/admin/navigation`
- Site content blocks (home/about/etc.): `/admin/content`

### Blog
- Manage posts: `/admin/blog`
- Create/edit with the rich editor, then Publish/Unpublish
- Public site: `/blog` and `/blog/[slug]`

### Bulletin Board
- Internal announcements/notices: `/dashboard/bulletin`

### Email Templates
- Configure subjects/bodies and placeholders: `/admin/email-templates`
- Placeholders supported: `{{name}}`, `{{school}}`, `{{presentation_id}}`, `{{hours}}`, `{{submission_id}}`, `{{comment}}`, `{{url}}`, `{{type}}`
- Affected emails: teacher confirmation, volunteer hours approval/rejection, report generated

### Memberships
- Manage members and presentation teams: `/admin/memberships`

### Data Manager
- Quick create/delete for Users, Intern Projects, Rules/Bylaws, Grants, Donations: `/admin/data`

### Resources & Gallery
- Manage uploads in `/dashboard/intern/data/resources`
- Public gallery: `/gallery`, Donate page: `/donate`

### Impact Map & Geo
- Edit coordinates for schools/chapters: `/admin/geo`
- Public map: `/impact`

### Reports & Analytics
- Generate reports (automated or manual triggers) and view Founder dashboard at `/dashboard/founder`

### Notes
- Most lists enforce Row-Level Security. If you can’t see/edit an item, check membership and role.
- Emails require `SMTP_URL` to be set. Templates fall back to defaults if DB templates are missing.


