# Green Silicon Valley - Administrator Guide

## Overview

This guide covers the comprehensive administrative features of the Green Silicon Valley platform, including content management, user administration, form building, permissions, and more.

## Table of Contents

1. [Getting Started](#getting-started)
2. [User Management](#user-management)
3. [Content Management System (CMS)](#content-management-system)
4. [Dynamic Form Builder](#dynamic-form-builder)
5. [Permissions & Access Control](#permissions--access-control)
6. [Blog Publishing Workflow](#blog-publishing-workflow)
7. [Visibility Controls](#visibility-controls)
8. [AI-Powered Features](#ai-powered-features)
9. [Approval Workflows](#approval-workflows)
10. [Migration & Maintenance](#migration--maintenance)

## Getting Started

### Admin Dashboard Access

Founders and administrators can access the admin dashboard at `/dashboard/founder` or `/admin/*` routes.

**Required Permissions:**
- Role: `founder` or `admin`
- Custom permissions may be required for specific features

### Initial Setup

1. **Database Migration**: Run the complete migration script
   ```bash
   # Apply all database changes
   psql -d your_database < supabase/migrations/ALL_MIGRATIONS_COMPLETE_FIXED.sql
   ```

2. **Seed Initial Data**: Run setup scripts
   ```bash
   npm run setup
   npm run db:init
   npm run create-content
   npm run set-founder
   ```

3. **Configure Permissions**: Set up role permissions in the admin panel

## User Management

### Creating Users

**Manual User Creation:**
1. Navigate to `/admin/user-manager`
2. Click "Create User"
3. Fill in user details (name, email, role, department)
4. User receives login credentials via email

**Automatic User Registration:**
- Teachers: Auto-approved upon signup
- Interns/Volunteers: Require admin approval
- Founders: Must be invited

### User Approval Workflow

**For Pending Applications:**
1. Go to `/admin/user-approvals`
2. Review user applications
3. Approve or reject with feedback
4. Approved users receive welcome emails

**Approval Process:**
- **Teachers**: Instant approval
- **Interns/Volunteers**: 1-3 business days review
- **Rejection**: Includes feedback for improvement

### User Roles & Permissions

| Role | Description | Approval Required | Default Permissions |
|------|-------------|-------------------|-------------------|
| Founder | Full platform access | No | All permissions |
| Intern | Content creation & management | Yes | Limited editing |
| Volunteer | Basic access & submissions | Yes | Read-only + submissions |
| Teacher | Presentation requests | No | Limited access |

## Content Management System (CMS)

### Creating Content Blocks

1. **Navigate to Content Editor**: `/admin/content` or `/admin/content-editor`
2. **Select Page/Category**: Choose target page or category
3. **Create New Block**:
   - Block Key: Unique identifier (e.g., `homepage_hero_title`)
   - Title: Display title
   - Content: Rich text content
   - Category: Grouping (homepage, volunteer_portal, etc.)

### Rich Text Editor Features

- **Formatting**: Bold, italic, underline, strikethrough
- **Headings**: H1, H2, H3
- **Lists**: Bulleted and numbered lists
- **Links**: URL insertion and formatting
- **Images**: Image upload and embedding
- **Blocks**: Code blocks, quotes, dividers

### Version History

- Automatic versioning on each save
- Compare versions
- Restore previous versions
- Audit trail of changes

### Permission-Based Editing

- **Role-based access**: Founders can edit all content
- **Custom permissions**: Grant specific users access to specific blocks
- **Edit permissions**: Control who can modify content

## Dynamic Form Builder

### Creating Forms

1. **Access Form Builder**: `/admin/forms`
2. **Create New Form**:
   - Title and description
   - Choose template or start blank
   - Add form fields via drag-and-drop

### Field Types Available

| Field Type | Description | Validation Options |
|------------|-------------|-------------------|
| Text | Single line text | Min/max length, pattern |
| Email | Email address | Email format validation |
| Number | Numeric input | Min/max values, decimals |
| Date | Date picker | Date range, format |
| Select | Dropdown menu | Custom options |
| Multiselect | Multiple choice | Custom options |
| Checkbox | Boolean toggle | Required validation |
| Textarea | Multi-line text | Min/max length |
| File Upload | File attachment | File type, size limits |
| Rating | Star rating | Min/max rating |

### Conditional Logic

**Show/Hide Fields Based On:**
- Other field values
- User role
- Previous selections
- Custom conditions

**Advanced Logic:**
- Branching forms
- Dynamic field requirements
- Conditional validation rules

### Form Management

**Form Settings:**
- Status: Draft, Published, Archived
- Visibility: Public, Role-based, Private
- Submission limits and notifications
- Response handling and export

**Response Management:**
- View all submissions
- Export to CSV/JSON
- Filter and search responses
- Automated notifications

## Permissions & Access Control

### Role-Based Permissions

**Default Role Permissions:**

```json
{
  "founder": {
    "content.view": true,
    "content.edit": true,
    "content.create": true,
    "content.delete": true,
    "forms.view": true,
    "forms.edit": true,
    "forms.create": true,
    "forms.delete": true,
    "users.manage": true,
    "users.approve": true
  },
  "intern": {
    "content.view": true,
    "forms.view": true,
    "forms.create": true,
    "blog.create": true,
    "blog.edit_own": true
  }
}
```

### Custom User Permissions

**Granting Custom Permissions:**
1. Go to user details: `/admin/users/[id]/permissions`
2. Click "Add Permission"
3. Select permission type and resource
4. Choose specific permissions
5. Set expiration (optional)

**Permission Types:**
- Content blocks
- Forms
- Blog posts
- Volunteer applications
- Presentation requests

### Permission Request System

**Users can request permissions:**
1. Navigate to `/dashboard/intern/permissions/request`
2. Select permission type and resource
3. Provide justification
4. Submit for admin review

**Admin Review Process:**
1. Check `/admin/user-approvals` for permission requests
2. Review justification and user history
3. Approve or deny with feedback
4. Automatic notification to user

## Blog Publishing Workflow

### Blog Post Creation

**For Interns:**
1. Go to `/interns/blog`
2. Click "Write New Post"
3. Fill in title, content, tags, department
4. Submit for review

**Publishing Workflow:**
1. **Draft**: Intern creates and edits
2. **Submitted**: Awaiting admin review
3. **Published**: Live on site
4. **Archived**: Removed from public view

### Content Review Process

**Admin Review Interface:** `/admin/blog/review`

**Review Steps:**
1. Read submitted content
2. Check for quality and appropriateness
3. Provide feedback if needed
4. Approve for publication or request revisions

**Review Guidelines:**
- Content quality and accuracy
- Appropriate tone and language
- Relevance to mission
- Technical accuracy (for STEM content)

### Blog Analytics

**Track Performance:**
- View counts
- Like counts
- Comment engagement
- Popular topics and authors
- Department performance

## Visibility Controls

### Resource Visibility

**Visibility Levels:**
- **Public**: Visible to everyone
- **Role-based**: Visible to specific roles
- **Private**: Founders and admins only
- **Custom**: Specific users only

**Setting Visibility:**
1. Edit any resource (form, content block, blog post)
2. Find "Visibility Settings" section
3. Select appropriate roles or set to public
4. Save changes

### Visibility Examples

```json
{
  "volunteer_form": {
    "visibility_roles": ["public"]
  },
  "intern_resources": {
    "visibility_roles": ["intern", "founder"]
  },
  "financial_reports": {
    "visibility_roles": ["founder"]
  }
}
```

## AI-Powered Features

### AI Form Generation

**Create Forms with AI:**
1. Go to form builder
2. Use "Generate with AI" feature
3. Describe desired form in natural language
4. AI generates field structure and logic
5. Review and customize generated form

**Example Prompts:**
- "Create a volunteer application form for high school students"
- "Build an event feedback survey with ratings and comments"
- "Design a teacher presentation request form"

### AI Workflow Creation

**Automated Workflows:**
1. Access AI chat interface
2. Describe desired workflow
3. AI generates trigger-action sequences
4. Review and activate workflow

**Example Workflows:**
- "Send welcome email to new volunteers"
- "Notify admins of new form submissions"
- "Schedule follow-up tasks for approved applications"

### AI Content Assistance

**Smart Content Creation:**
- Auto-complete content blocks
- Suggest improvements to writing
- Generate content outlines
- SEO optimization suggestions

## Approval Workflows

### User Approval Process

**Automatic Triggers:**
- Intern/volunteer signup → Pending approval
- Teacher signup → Auto-approved
- Founder invitation → Auto-approved

**Manual Approval:**
1. Admin reviews application
2. Checks qualifications and fit
3. Approves or rejects with feedback
4. User receives notification

### Content Approval

**Blog Posts:**
- Intern submits → Admin reviews → Publish or reject
- Automatic notifications throughout process

**Form Submissions:**
- Configurable approval workflows
- Multi-step review processes
- Automated notifications

## Migration & Maintenance

### Content Migration

**Migrate Static Content:**
```bash
# Run migration script
npm run migrate-content

# Or manually run
tsx scripts/migrate-static-content.ts
```

**Migration Process:**
1. Scans components for hard-coded text
2. Creates CMS content blocks
3. Updates components to use CMS hooks
4. Preserves existing functionality

### Form Migration

**Convert Legacy Forms:**
```bash
# Run form migration
tsx scripts/migrate-forms.ts
```

**Migration Features:**
- Converts hard-coded forms to dynamic schemas
- Preserves validation rules and field logic
- Updates form components to use DynamicFormRenderer
- Maintains backward compatibility

### Database Maintenance

**Regular Tasks:**
- Monitor permission usage
- Clean up expired custom permissions
- Archive old form responses
- Update content block versions

**Backup Strategy:**
- Daily automated backups
- Content export capabilities
- User data protection
- Disaster recovery procedures

### Performance Optimization

**CMS Performance:**
- Content caching strategies
- Lazy loading of rich content
- Optimized database queries
- CDN integration for media

**Form Performance:**
- Response data aggregation
- Efficient validation
- Progressive form loading
- Mobile optimization

## Troubleshooting

### Common Issues

**Permission Denied Errors:**
- Check user role assignments
- Verify custom permissions
- Review RLS policies

**Content Not Loading:**
- Verify CMS content blocks exist
- Check permission settings
- Review component hooks

**Form Submission Failures:**
- Validate form schema
- Check API endpoints
- Review validation rules

### Support Resources

**Documentation:**
- User guides in `/docs/`
- API documentation
- Component library docs

**Community Support:**
- Internal team documentation
- Admin training sessions
- Peer support channels

---

## Quick Reference

### Key URLs
- Admin Dashboard: `/dashboard/founder`
- User Management: `/admin/user-manager`
- Content Editor: `/admin/content-editor`
- Form Builder: `/admin/forms`
- Blog Management: `/admin/blog`
- Permission Requests: `/admin/user-approvals`

### Emergency Contacts
- Technical Issues: tech@greensiliconvalley.org
- Content Issues: content@greensiliconvalley.org
- User Support: support@greensiliconvalley.org

### System Requirements
- Node.js 18+
- PostgreSQL 15+
- Supabase account
- Modern web browser

---

*This guide is maintained by the Green Silicon Valley development team. Last updated: December 2024*
