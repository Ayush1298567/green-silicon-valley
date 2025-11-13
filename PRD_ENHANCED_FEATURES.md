# Product Requirements Document (PRD)
## Green Silicon Valley Platform - Enhanced Features

**Version:** 1.0  
**Date:** November 2025  
**Status:** Draft  
**Owner:** Green Silicon Valley Development Team

---

## Executive Summary

This PRD outlines the development of 9 major feature enhancements for the Green Silicon Valley platform to improve volunteer management, communication, workflow automation, and analytics capabilities. These features will transform the platform into a comprehensive nonprofit management system.

---

## Table of Contents

1. [Enhanced Volunteer Tracking System](#1-enhanced-volunteer-tracking-system)
2. [Newsletter Marketing System](#2-newsletter-marketing-system)
3. [Volunteer Workflow & Onboarding](#3-volunteer-workflow--onboarding)
4. [Calendar View for Founders/Admin](#4-calendar-view-for-foundersadmin)
5. [Site-Wide Search](#5-site-wide-search)
6. [Document Management UI](#6-document-management-ui)
7. [Photo Gallery Management](#7-photo-gallery-management)
8. [Volunteer Recognition & Badges](#8-volunteer-recognition--badges)
9. [Advanced Analytics for Founders](#9-advanced-analytics-for-founders)

---

## 1. Enhanced Volunteer Tracking System

### 1.1 Overview
Build a comprehensive volunteer tracking system for founders to monitor, manage, and analyze volunteer performance, engagement, and impact.

### 1.2 Current State
- Basic volunteer list with hours tracking exists
- Volunteer cards with basic stats
- Simple filtering by status
- Hours approval workflow exists

### 1.3 Requirements

#### 1.3.1 Volunteer Dashboard (Founder View)
**Location:** `/dashboard/founder/volunteers`

**Features:**
- **Advanced Filtering:**
  - By status (active, inactive, on_leave, pending)
  - By team/chapter
  - By hours range (0-10, 11-25, 26-50, 51-100, 100+)
  - By join date (last week, month, quarter, year)
  - By last activity date
  - By presentations completed
  - By badges earned
  - By skills/interests

- **Sorting Options:**
  - Hours (total, this month, this year)
  - Presentations completed
  - Join date
  - Last activity
  - Name (A-Z, Z-A)
  - Performance score

- **Bulk Actions:**
  - Export selected volunteers to CSV/Excel
  - Send email to selected volunteers
  - Change status (activate/deactivate)
  - Assign to team/chapter
  - Award badges

- **Views:**
  - Grid view (cards)
  - List view (table with more columns)
  - Timeline view (activity timeline)

#### 1.3.2 Volunteer Detail Page
**Location:** `/dashboard/founder/volunteers/[id]`

**Sections:**
1. **Profile Overview:**
   - Basic info (name, email, phone, address)
   - Profile photo
   - Status badge
   - Join date
   - Last activity
   - Contact information

2. **Performance Metrics:**
   - Total hours (all-time, this year, this month)
   - Hours breakdown by activity type
   - Presentations completed
   - Students reached
   - Schools visited
   - Performance score (calculated)

3. **Activity Timeline:**
   - Chronological list of all activities
   - Hours logged
   - Presentations attended
   - Badges earned
   - Training completed
   - Events attended
   - Filterable by date range

4. **Hours Log:**
   - Detailed hours entries
   - Filter by date range, status, activity type
   - Export hours report
   - Approve/reject pending hours
   - Add/edit hours manually

5. **Presentations:**
   - List of presentations volunteered for
   - Status (scheduled, completed, cancelled)
   - Feedback received
   - Performance ratings

6. **Training & Certifications:**
   - Completed training modules
   - Certifications earned
   - Required training status
   - Training history

7. **Badges & Recognition:**
   - Badges earned
   - Achievement timeline
   - Recognition history

8. **Notes & Internal Comments:**
   - Founder/admin notes (private)
   - Performance reviews
   - Feedback from presentations
   - Disciplinary notes (if applicable)

9. **Documents:**
   - Uploaded documents (waivers, background checks, etc.)
   - Document expiration tracking
   - Required documents checklist

#### 1.3.3 Volunteer Analytics Dashboard
**Location:** `/dashboard/founder/volunteers/analytics`

**Metrics & Charts:**
- **Engagement Metrics:**
  - Active vs inactive volunteers over time
  - Volunteer retention rate
  - Average hours per volunteer
  - Volunteer churn rate
  - New volunteers by month

- **Performance Metrics:**
  - Top performers (hours, presentations)
  - Average performance score
  - Performance distribution
  - Improvement trends

- **Demographics:**
  - Volunteers by team/chapter
  - Volunteers by age group (if collected)
  - Volunteers by school (if applicable)
  - Geographic distribution

- **Activity Patterns:**
  - Hours logged by day of week
  - Hours logged by month
  - Peak activity times
  - Presentation attendance patterns

#### 1.3.4 Database Schema Changes

```sql
-- Add columns to volunteers table
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS:
  - join_date timestamptz DEFAULT now(),
  - last_activity_date timestamptz,
  - status text DEFAULT 'pending',
  - team_id bigint REFERENCES teams(id),
  - chapter_id bigint REFERENCES chapters(id),
  - skills text[],
  - interests text[],
  - emergency_contact_name text,
  - emergency_contact_phone text,
  - performance_score numeric(5,2),
  - notes text,
  - internal_notes text,
  - profile_photo_url text;

-- Create volunteer_activities table
CREATE TABLE IF NOT EXISTS volunteer_activities (
  id bigserial PRIMARY KEY,
  volunteer_id bigint REFERENCES volunteers(id),
  activity_type text, -- 'hours_logged', 'presentation', 'training', 'badge_earned', 'event'
  activity_data jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create volunteer_notes table
CREATE TABLE IF NOT EXISTS volunteer_notes (
  id bigserial PRIMARY KEY,
  volunteer_id bigint REFERENCES volunteers(id),
  author_id uuid REFERENCES users(id),
  note_type text, -- 'general', 'performance', 'disciplinary', 'recognition'
  content text,
  is_private boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create volunteer_documents table
CREATE TABLE IF NOT EXISTS volunteer_documents (
  id bigserial PRIMARY KEY,
  volunteer_id bigint REFERENCES volunteers(id),
  document_type text, -- 'waiver', 'background_check', 'certification', 'other'
  filename text,
  file_url text,
  expiration_date date,
  uploaded_at timestamptz DEFAULT now(),
  uploaded_by uuid REFERENCES users(id)
);
```

#### 1.3.5 API Endpoints

```
GET    /api/volunteers                    - List all volunteers (with filters)
GET    /api/volunteers/[id]               - Get volunteer details
PUT    /api/volunteers/[id]               - Update volunteer
DELETE /api/volunteers/[id]               - Delete volunteer
POST   /api/volunteers/[id]/notes         - Add note
GET    /api/volunteers/[id]/activities    - Get activity timeline
GET    /api/volunteers/[id]/analytics     - Get volunteer analytics
POST   /api/volunteers/bulk-action        - Bulk actions
GET    /api/volunteers/export             - Export to CSV/Excel
POST   /api/volunteers/[id]/documents     - Upload document
```

### 1.4 User Stories

**As a founder, I want to:**
- View all volunteers in one place with advanced filtering
- See detailed volunteer profiles with complete activity history
- Track volunteer performance over time
- Export volunteer data for reporting
- Add private notes about volunteers
- Track required documents and expiration dates
- Identify top performers and volunteers needing support
- See volunteer engagement trends

### 1.5 Success Metrics
- Founders can find any volunteer information within 3 clicks
- Volunteer data export time < 5 seconds
- 100% of volunteer activities are tracked
- Volunteer retention rate increases by 20%

---

## 2. Newsletter Marketing System

### 2.1 Overview
Complete newsletter and email marketing system for managing subscribers, creating campaigns, and tracking engagement.

### 2.2 Current State
- Basic email sending exists (nodemailer)
- Email templates exist but no campaign management
- No subscriber management
- No email analytics

### 2.3 Requirements

#### 2.3.1 Subscriber Management
**Location:** `/dashboard/founder/newsletter/subscribers`

**Features:**
- **Subscriber List:**
  - View all subscribers
  - Search by email, name, tags
  - Filter by status (active, unsubscribed, bounced)
  - Filter by tags/categories
  - Filter by subscription date
  - Import subscribers (CSV)
  - Export subscribers (CSV)

- **Subscriber Details:**
  - Email, name, subscription date
  - Subscription source (website, manual, import)
  - Tags/categories
  - Email engagement stats (opens, clicks)
  - Unsubscribe history
  - Bounce status

- **Bulk Actions:**
  - Add tags
  - Remove tags
  - Unsubscribe selected
  - Delete selected
  - Export selected

#### 2.3.2 Newsletter Builder
**Location:** `/dashboard/founder/newsletter/create`

**Features:**
- **Visual Editor:**
  - Drag-and-drop email builder
  - Pre-built templates
  - Custom HTML editor
  - Rich text editor
  - Image upload and management
  - Link management
  - Personalization tokens ({name}, {email}, etc.)

- **Content Blocks:**
  - Header with logo
  - Text blocks
  - Image blocks
  - Button/CTA blocks
  - Social media links
  - Footer
  - Divider
  - Spacer

- **Template Library:**
  - Pre-built templates for:
    - Monthly newsletter
    - Event announcements
    - Volunteer spotlights
    - Impact updates
    - Fundraising appeals
  - Save custom templates
  - Template preview

#### 2.3.3 Campaign Management
**Location:** `/dashboard/founder/newsletter/campaigns`

**Features:**
- **Create Campaign:**
  - Campaign name
  - Subject line (with A/B testing option)
  - Preview text
  - Select template or create new
  - Choose recipients (all, segment, tags)
  - Schedule send time
  - Timezone selection

- **Campaign List:**
  - View all campaigns
  - Filter by status (draft, scheduled, sent, paused)
  - Filter by date range
  - Search campaigns
  - Duplicate campaign
  - Delete campaign

- **Campaign Details:**
  - Campaign performance:
    - Sent count
    - Delivered count
    - Opened count (unique/total)
    - Clicked count (unique/total)
    - Unsubscribed count
    - Bounced count
    - Open rate
    - Click rate
  - Recipient list
  - Email preview
  - Edit campaign (if draft)

#### 2.3.4 Email Analytics
**Location:** `/dashboard/founder/newsletter/analytics`

**Features:**
- **Overall Stats:**
  - Total subscribers
  - Active subscribers
  - Unsubscribed count
  - Bounce rate
  - Average open rate
  - Average click rate

- **Campaign Performance:**
  - Best performing campaigns
  - Worst performing campaigns
  - Engagement trends over time
  - Best send times
  - Best subject lines

- **Subscriber Engagement:**
  - Most engaged subscribers
  - Subscriber growth over time
  - Unsubscribe reasons (if collected)

#### 2.3.5 Public Newsletter Signup
**Location:** `/newsletter` (public page)

**Features:**
- Newsletter signup form
- Double opt-in option
- Custom fields (name, interests, etc.)
- Success message
- Thank you page
- Unsubscribe page

#### 2.3.6 Database Schema

```sql
-- Newsletter subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id bigserial PRIMARY KEY,
  email text UNIQUE NOT NULL,
  name text,
  status text DEFAULT 'active', -- 'active', 'unsubscribed', 'bounced'
  subscribed_at timestamptz DEFAULT now(),
  unsubscribed_at timestamptz,
  unsubscribe_reason text,
  source text, -- 'website', 'manual', 'import'
  tags text[],
  custom_fields jsonb,
  last_email_sent_at timestamptz,
  last_email_opened_at timestamptz,
  last_email_clicked_at timestamptz,
  total_emails_sent integer DEFAULT 0,
  total_emails_opened integer DEFAULT 0,
  total_emails_clicked integer DEFAULT 0
);

-- Newsletter campaigns table
CREATE TABLE IF NOT EXISTS newsletter_campaigns (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  subject text NOT NULL,
  preview_text text,
  content_html text,
  content_text text,
  template_id bigint,
  status text DEFAULT 'draft', -- 'draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled'
  scheduled_for timestamptz,
  sent_at timestamptz,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  recipient_count integer DEFAULT 0,
  sent_count integer DEFAULT 0,
  delivered_count integer DEFAULT 0,
  opened_count integer DEFAULT 0,
  clicked_count integer DEFAULT 0,
  unsubscribed_count integer DEFAULT 0,
  bounced_count integer DEFAULT 0,
  recipient_selection jsonb -- filters/tags for recipients
);

-- Newsletter templates table
CREATE TABLE IF NOT EXISTS newsletter_templates (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  description text,
  content_html text,
  content_text text,
  thumbnail_url text,
  is_system_template boolean DEFAULT false,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

-- Email tracking table
CREATE TABLE IF NOT EXISTS email_tracking (
  id bigserial PRIMARY KEY,
  campaign_id bigint REFERENCES newsletter_campaigns(id),
  subscriber_id bigint REFERENCES newsletter_subscribers(id),
  email_address text NOT NULL,
  event_type text, -- 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'unsubscribed'
  event_data jsonb,
  created_at timestamptz DEFAULT now()
);

-- Newsletter segments table
CREATE TABLE IF NOT EXISTS newsletter_segments (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  description text,
  filter_rules jsonb, -- criteria for segment
  subscriber_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
```

#### 2.3.7 API Endpoints

```
GET    /api/newsletter/subscribers          - List subscribers
POST   /api/newsletter/subscribers          - Add subscriber
GET    /api/newsletter/subscribers/[id]     - Get subscriber
PUT    /api/newsletter/subscribers/[id]     - Update subscriber
DELETE /api/newsletter/subscribers/[id]     - Delete subscriber
POST   /api/newsletter/subscribers/import   - Import CSV
GET    /api/newsletter/subscribers/export   - Export CSV
POST   /api/newsletter/subscribe            - Public signup
POST   /api/newsletter/unsubscribe          - Public unsubscribe

GET    /api/newsletter/campaigns            - List campaigns
POST   /api/newsletter/campaigns            - Create campaign
GET    /api/newsletter/campaigns/[id]       - Get campaign
PUT    /api/newsletter/campaigns/[id]       - Update campaign
DELETE /api/newsletter/campaigns/[id]       - Delete campaign
POST   /api/newsletter/campaigns/[id]/send  - Send campaign
POST   /api/newsletter/campaigns/[id]/test - Send test email

GET    /api/newsletter/templates             - List templates
POST   /api/newsletter/templates             - Create template
GET    /api/newsletter/templates/[id]        - Get template
PUT    /api/newsletter/templates/[id]        - Update template
DELETE /api/newsletter/templates/[id]        - Delete template

GET    /api/newsletter/analytics             - Get analytics
GET    /api/newsletter/tracking/[token]      - Email tracking pixel
```

### 2.4 User Stories

**As a founder, I want to:**
- Manage newsletter subscribers
- Create beautiful email campaigns without coding
- Schedule emails to send at optimal times
- See how many people opened and clicked my emails
- Segment subscribers by interests or behavior
- Import subscribers from CSV
- Use pre-built templates for common emails

**As a subscriber, I want to:**
- Easily sign up for the newsletter
- Unsubscribe with one click
- Receive relevant, well-designed emails

### 2.5 Success Metrics
- Email open rate > 25%
- Click rate > 5%
- Unsubscribe rate < 1%
- Campaign creation time < 10 minutes

---

## 3. Volunteer Workflow & Onboarding

### 3.1 Overview
Complete volunteer onboarding workflow from signup to active volunteer, including orientation, training, and document collection.

### 3.2 Current State
- Basic volunteer signup form exists
- No structured onboarding process
- No orientation scheduling
- No training tracking

### 3.3 Requirements

#### 3.3.1 Onboarding Workflow Builder
**Location:** `/dashboard/founder/volunteer-workflow`

**Features:**
- **Workflow Steps Configuration:**
  - Define onboarding steps
  - Set step order
  - Mark steps as required/optional
  - Set completion criteria
  - Add automated actions (emails, notifications)

- **Default Steps:**
  1. Application submitted
  2. Application reviewed
  3. Background check submitted
  4. Waiver signed
  5. Orientation scheduled
  6. Orientation completed
  7. Training modules assigned
  8. Training completed
  9. First presentation assigned
  10. Active volunteer

- **Step Types:**
  - Form submission
  - Document upload
  - Training completion
  - Event attendance (orientation)
  - Manual approval
  - Email sent
  - Notification sent

#### 3.3.2 Volunteer Application Review
**Location:** `/dashboard/founder/volunteers/applications`

**Features:**
- **Application List:**
  - View pending applications
  - Filter by date, source, status
  - Search applications
  - Bulk approve/reject

- **Application Detail:**
  - Applicant information
  - Application answers
  - Application date
  - Review status
  - Reviewer notes
  - Approve/Reject buttons
  - Send custom email

#### 3.3.3 Orientation Scheduling
**Location:** `/dashboard/founder/volunteer-workflow/orientations`

**Features:**
- **Create Orientation Sessions:**
  - Date and time
  - Location (physical or virtual link)
  - Capacity
  - Required/optional
  - Description
  - Materials/agenda

- **Orientation Management:**
  - View all sessions
  - See registered volunteers
  - Mark attendance
  - Send reminders
  - Reschedule/cancel

- **Volunteer View:**
  - See available orientations
  - Register for session
  - View orientation materials
  - Complete post-orientation survey

#### 3.3.4 Training Module System
**Location:** `/dashboard/founder/volunteer-workflow/training`

**Features:**
- **Training Modules:**
  - Create training modules
  - Add content (text, video, documents)
  - Set completion criteria
  - Add quizzes/assessments
  - Set prerequisites
  - Assign to volunteers

- **Training Progress:**
  - Track volunteer progress
  - See completion rates
  - Identify volunteers needing support
  - Generate certificates

- **Volunteer View:**
  - See assigned training
  - Complete modules
  - Take quizzes
  - Download certificates

#### 3.3.5 Document Collection
**Location:** `/dashboard/founder/volunteer-workflow/documents`

**Features:**
- **Required Documents:**
  - Define required documents (waiver, background check, etc.)
  - Set expiration rules
  - Track document status per volunteer
  - Send reminders for expired documents

- **Document Upload:**
  - Volunteers upload documents
  - Founders review and approve
  - Store securely
  - Track expiration dates

#### 3.3.6 Welcome Email Sequence
**Automated emails:**
1. Application received confirmation
2. Application approved (with next steps)
3. Orientation reminder (24h before)
4. Post-orientation follow-up
5. Training assigned notification
6. Welcome to active volunteer status

#### 3.3.7 Database Schema

```sql
-- Volunteer onboarding workflows table
CREATE TABLE IF NOT EXISTS volunteer_workflows (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  description text,
  steps jsonb NOT NULL, -- array of step definitions
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Volunteer onboarding progress table
CREATE TABLE IF NOT EXISTS volunteer_onboarding_progress (
  id bigserial PRIMARY KEY,
  volunteer_id bigint REFERENCES volunteers(id),
  workflow_id bigint REFERENCES volunteer_workflows(id),
  current_step integer DEFAULT 0,
  completed_steps jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'in_progress', -- 'in_progress', 'completed', 'paused', 'cancelled'
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  step_data jsonb -- data for each step
);

-- Orientation sessions table
CREATE TABLE IF NOT EXISTS orientation_sessions (
  id bigserial PRIMARY KEY,
  title text NOT NULL,
  description text,
  scheduled_date timestamptz NOT NULL,
  location text, -- physical or virtual link
  capacity integer,
  registered_count integer DEFAULT 0,
  is_required boolean DEFAULT true,
  materials_url text,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

-- Orientation registrations table
CREATE TABLE IF NOT EXISTS orientation_registrations (
  id bigserial PRIMARY KEY,
  session_id bigint REFERENCES orientation_sessions(id),
  volunteer_id bigint REFERENCES volunteers(id),
  status text DEFAULT 'registered', -- 'registered', 'attended', 'no_show', 'cancelled'
  registered_at timestamptz DEFAULT now(),
  attended_at timestamptz
);

-- Training modules table
CREATE TABLE IF NOT EXISTS training_modules (
  id bigserial PRIMARY KEY,
  title text NOT NULL,
  description text,
  content_html text,
  video_url text,
  documents jsonb DEFAULT '[]'::jsonb,
  quiz_data jsonb, -- quiz questions and answers
  completion_criteria text, -- 'view', 'quiz_pass', 'time_spent'
  prerequisites bigint[], -- array of module IDs
  estimated_duration integer, -- minutes
  is_required boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Training progress table
CREATE TABLE IF NOT EXISTS training_progress (
  id bigserial PRIMARY KEY,
  volunteer_id bigint REFERENCES volunteers(id),
  module_id bigint REFERENCES training_modules(id),
  status text DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed', 'failed'
  progress_percent integer DEFAULT 0,
  started_at timestamptz,
  completed_at timestamptz,
  quiz_score numeric(5,2),
  time_spent integer DEFAULT 0 -- minutes
);

-- Volunteer applications table
CREATE TABLE IF NOT EXISTS volunteer_applications (
  id bigserial PRIMARY KEY,
  volunteer_id bigint REFERENCES volunteers(id),
  application_data jsonb, -- form responses
  status text DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'on_hold'
  reviewed_by uuid REFERENCES users(id),
  reviewed_at timestamptz,
  review_notes text,
  submitted_at timestamptz DEFAULT now()
);
```

#### 3.3.8 API Endpoints

```
GET    /api/volunteer-workflow/workflows         - List workflows
POST   /api/volunteer-workflow/workflows         - Create workflow
GET    /api/volunteer-workflow/progress/[id]     - Get volunteer progress
POST   /api/volunteer-workflow/progress/[id]/step - Complete step

GET    /api/orientations                         - List sessions
POST   /api/orientations                         - Create session
POST   /api/orientations/[id]/register           - Register volunteer
POST   /api/orientations/[id]/attendance         - Mark attendance

GET    /api/training/modules                     - List modules
POST   /api/training/modules                     - Create module
GET    /api/training/progress/[id]               - Get volunteer progress
POST   /api/training/progress                     - Update progress

GET    /api/volunteer-applications               - List applications
POST   /api/volunteer-applications/[id]/review   - Review application
```

### 3.4 User Stories

**As a founder, I want to:**
- Define custom onboarding workflows
- See where each volunteer is in the onboarding process
- Schedule orientation sessions
- Track training completion
- Automatically send welcome emails
- Ensure all required documents are collected

**As a volunteer, I want to:**
- Know what steps I need to complete
- Schedule my orientation easily
- Complete training at my own pace
- See my progress clearly

### 3.5 Success Metrics
- Onboarding completion rate > 80%
- Average onboarding time < 2 weeks
- Training completion rate > 90%
- Volunteer satisfaction with onboarding > 4/5

---

## 4. Calendar View for Founders/Admin

### 4.1 Overview
Comprehensive calendar system for viewing and managing all events, presentations, orientations, and meetings in one place.

### 4.2 Current State
- Presentations have dates but no calendar view
- No unified event management
- No calendar integration

### 4.3 Requirements

#### 4.3.1 Calendar Interface
**Location:** `/dashboard/founder/calendar`

**Views:**
- **Month View:**
  - Full month calendar
  - Color-coded events by type
  - Event count badges on days
  - Click day to see events

- **Week View:**
  - 7-day week view
  - Time slots (hourly)
  - Events shown as blocks
  - Drag-and-drop to reschedule

- **Day View:**
  - Single day detailed view
  - Hourly timeline
  - All events for the day
  - Time conflicts highlighted

- **Agenda View:**
  - List of upcoming events
  - Grouped by date
  - Filterable and sortable

#### 4.3.2 Event Types
- **Presentations:**
  - School presentations
  - Status (scheduled, confirmed, completed, cancelled)
  - Volunteer assignments
  - Location

- **Orientations:**
  - New volunteer orientations
  - Capacity and registrations

- **Meetings:**
  - Team meetings
  - Chapter meetings
  - Board meetings

- **Events:**
  - Fundraisers
  - Community events
  - Training sessions
  - Social events

- **Deadlines:**
  - Grant deadlines
  - Report due dates
  - Training deadlines

#### 4.3.3 Event Management
**Features:**
- **Create Event:**
  - Event type
  - Title
  - Date and time
  - Duration
  - Location (physical or virtual)
  - Description
  - Attendees/volunteers
  - Reminders
  - Recurring events support

- **Edit Event:**
  - Update all fields
  - Reschedule (drag-and-drop)
  - Add/remove attendees
  - Change status

- **Event Details:**
  - Full event information
  - Attendee list
  - Related documents
  - Notes
  - History/changelog

#### 4.3.4 Calendar Features
- **Filters:**
  - By event type
  - By status
  - By team/chapter
  - By volunteer
  - By location

- **Search:**
  - Search events by title, description
  - Quick date navigation
  - Jump to date

- **Export:**
  - Export to iCal format
  - Export to Google Calendar
  - Export to PDF
  - Share calendar link

- **Notifications:**
  - Upcoming events reminder
  - Event changes notification
  - Conflict warnings

#### 4.3.5 Calendar Integration
- **Google Calendar:**
  - Sync events to Google Calendar
  - Import from Google Calendar
  - Two-way sync option

- **iCal Export:**
  - Subscribe to calendar feed
  - Import iCal files

#### 4.3.6 Database Schema

```sql
-- Events table (unified)
CREATE TABLE IF NOT EXISTS events (
  id bigserial PRIMARY KEY,
  event_type text NOT NULL, -- 'presentation', 'orientation', 'meeting', 'event', 'deadline'
  title text NOT NULL,
  description text,
  start_date timestamptz NOT NULL,
  end_date timestamptz,
  all_day boolean DEFAULT false,
  location text,
  location_type text, -- 'physical', 'virtual', 'hybrid'
  virtual_link text,
  status text DEFAULT 'scheduled', -- 'scheduled', 'confirmed', 'completed', 'cancelled'
  color text, -- for calendar display
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  related_id bigint, -- ID of related record (presentation_id, orientation_id, etc.)
  recurrence_rule text, -- RRULE format for recurring events
  reminder_minutes integer[], -- array of reminder times in minutes before event
  metadata jsonb -- additional event-specific data
);

-- Event attendees table
CREATE TABLE IF NOT EXISTS event_attendees (
  id bigserial PRIMARY KEY,
  event_id bigint REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id),
  volunteer_id bigint REFERENCES volunteers(id),
  role text, -- 'organizer', 'attendee', 'optional'
  status text DEFAULT 'invited', -- 'invited', 'accepted', 'declined', 'tentative'
  response_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Calendar subscriptions table
CREATE TABLE IF NOT EXISTS calendar_subscriptions (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  calendar_type text, -- 'google', 'ical'
  external_calendar_id text,
  sync_token text,
  last_synced_at timestamptz,
  sync_direction text DEFAULT 'both', -- 'import', 'export', 'both'
  created_at timestamptz DEFAULT now()
);
```

#### 4.3.7 API Endpoints

```
GET    /api/calendar/events                    - List events (with filters)
POST   /api/calendar/events                   - Create event
GET    /api/calendar/events/[id]              - Get event
PUT    /api/calendar/events/[id]              - Update event
DELETE /api/calendar/events/[id]              - Delete event
POST   /api/calendar/events/[id]/attendees    - Add attendee
DELETE /api/calendar/events/[id]/attendees/[userId] - Remove attendee

GET    /api/calendar/export/ical             - Export iCal
POST   /api/calendar/import/ical             - Import iCal
GET    /api/calendar/google/sync             - Sync with Google Calendar
POST   /api/calendar/google/authorize        - Authorize Google Calendar
```

### 4.4 User Stories

**As a founder, I want to:**
- See all events in one calendar view
- Quickly identify scheduling conflicts
- Drag-and-drop to reschedule events
- Export calendar to my personal calendar
- Filter events by type or team
- Get reminders for upcoming events

### 4.5 Success Metrics
- Calendar load time < 2 seconds
- Event creation time < 1 minute
- Zero scheduling conflicts
- 90% of events synced to external calendars

---

## 5. Site-Wide Search

### 5.1 Overview
Global search functionality that allows users to search across all content types in the platform.

### 5.2 Current State
- Search exists only for messaging
- No global search functionality

### 5.3 Requirements

#### 5.3.1 Search Interface
**Location:** Global search bar (header) + `/search` page

**Features:**
- **Search Bar:**
  - Always visible in header
  - Auto-complete suggestions
  - Recent searches
  - Quick results preview
  - Keyboard shortcut (Ctrl/Cmd + K)

- **Search Results Page:**
  - Unified results from all content types
  - Filter by content type
  - Sort by relevance/date
  - Pagination
  - "No results" suggestions

#### 5.3.2 Searchable Content Types
1. **Blog Posts:**
   - Title, content, author, tags
   - Published date
   - Category

2. **Users/Volunteers:**
   - Name, email
   - Role, status
   - Team/chapter

3. **Presentations:**
   - Topic, school
   - Date, status
   - Volunteers assigned

4. **Events:**
   - Title, description
   - Date, location
   - Type

5. **Resources/Documents:**
   - Filename, description
   - Content (if text-based)
   - Tags, category

6. **Schools:**
   - Name, district
   - Location
   - Teacher name

7. **Chapters:**
   - Name, region
   - Leader
   - Status

8. **Tasks:**
   - Title, description
   - Assignee
   - Status

9. **Bulletin Posts:**
   - Title, content
   - Author
   - Date

10. **Messages:**
    - Content
    - Sender
    - Channel

#### 5.3.3 Search Features
- **Advanced Search:**
  - Filter by content type
  - Filter by date range
  - Filter by author/creator
  - Filter by status
  - Boolean operators (AND, OR, NOT)

- **Search Suggestions:**
  - Auto-complete as you type
  - Popular searches
  - Recent searches
  - Related searches

- **Search Results:**
  - Highlighted search terms
  - Snippet/preview
  - Relevance score
  - Quick actions (view, edit, delete)

#### 5.3.4 Search Analytics
- Track popular searches
- Track searches with no results
- Identify content gaps
- Search performance metrics

#### 5.3.5 Database Schema

```sql
-- Search index table (for full-text search)
CREATE TABLE IF NOT EXISTS search_index (
  id bigserial PRIMARY KEY,
  content_type text NOT NULL, -- 'blog_post', 'user', 'presentation', etc.
  content_id text NOT NULL, -- ID of the content
  title text,
  content text,
  tags text[],
  metadata jsonb,
  search_vector tsvector, -- PostgreSQL full-text search vector
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(content_type, content_id)
);

-- Search history table
CREATE TABLE IF NOT EXISTS search_history (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  query text NOT NULL,
  results_count integer,
  clicked_result_id bigint REFERENCES search_index(id),
  created_at timestamptz DEFAULT now()
);

-- Create GIN index for fast full-text search
CREATE INDEX IF NOT EXISTS idx_search_vector ON search_index USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_search_content_type ON search_index(content_type);
CREATE INDEX IF NOT EXISTS idx_search_history_user ON search_history(user_id);
```

#### 5.3.6 API Endpoints

```
GET    /api/search                           - Search (with query params)
GET    /api/search/suggestions               - Get search suggestions
GET    /api/search/history                   - Get user search history
POST   /api/search/index                     - Index content (internal)
DELETE /api/search/index/[type]/[id]        - Remove from index
```

### 5.4 User Stories

**As a user, I want to:**
- Search for anything on the platform quickly
- See suggestions as I type
- Filter search results by type
- Find content even if I don't remember exact words

**As a founder, I want to:**
- See what users are searching for
- Identify content gaps
- Improve content discoverability

### 5.5 Success Metrics
- Search response time < 500ms
- 80% of searches return relevant results
- Average results per search > 5
- Search usage increases by 50%

---

## 6. Document Management UI

### 6.1 Overview
Comprehensive document management system with organization, versioning, sharing, and permissions.

### 6.2 Current State
- Basic file upload exists
- Resources table exists
- No document management UI
- No versioning or sharing

### 6.3 Requirements

#### 6.3.1 Document Library
**Location:** `/dashboard/founder/documents`

**Views:**
- **Grid View:**
  - Document thumbnails
  - Document name
  - File type icon
  - Last modified
  - Size

- **List View:**
  - Detailed table
  - More columns visible
  - Sortable columns

- **Tree View:**
  - Folder structure
  - Nested folders
  - Expand/collapse

#### 6.3.2 Folder Organization
**Features:**
- **Create Folders:**
  - Name folder
  - Set parent folder
  - Add description
  - Set permissions

- **Folder Management:**
  - Move folders
  - Rename folders
  - Delete folders
  - Share folders

- **Default Folders:**
  - Presentations
  - Training Materials
  - Policies & Procedures
  - Forms & Templates
  - Reports
  - Public Documents

#### 6.3.3 Document Operations
**Features:**
- **Upload:**
  - Drag-and-drop upload
  - Multiple file upload
  - Folder selection
  - Auto-tagging by folder

- **View:**
  - Preview (images, PDFs, text)
  - Full-screen view
  - Download
  - Share link

- **Edit:**
  - Rename
  - Move to folder
  - Add tags
  - Add description
  - Change permissions

- **Delete:**
  - Move to trash
  - Permanent delete
  - Bulk delete

#### 6.3.4 Document Versioning
**Features:**
- **Version History:**
  - View all versions
  - Compare versions
  - Restore previous version
  - Download specific version

- **Version Management:**
  - Auto-version on upload
  - Manual version creation
  - Version notes/comments
  - Version numbering

#### 6.3.5 Document Sharing & Permissions
**Features:**
- **Sharing:**
  - Share with specific users
  - Share with roles
  - Generate public link
  - Set link expiration
  - Password protection

- **Permissions:**
  - View
  - Download
  - Edit
  - Delete
  - Share

- **Access Control:**
  - Private (owner only)
  - Team/Chapter access
  - Role-based access
  - Public

#### 6.3.6 Document Features
- **Tags & Categories:**
  - Add multiple tags
  - Filter by tags
  - Tag suggestions
  - Category assignment

- **Search:**
  - Search within documents (text files)
  - Search by name, tags, content
  - Advanced filters

- **Metadata:**
  - File size
  - File type
  - Upload date
  - Last modified
  - Uploaded by
  - Download count
  - View count

#### 6.3.7 Document Types Support
- **Viewable:**
  - Images (JPG, PNG, GIF, WebP)
  - PDFs
  - Text files
  - Markdown

- **Downloadable:**
  - All file types
  - Office documents (Word, Excel, PowerPoint)
  - Archives (ZIP, RAR)

#### 6.3.8 Database Schema

```sql
-- Document folders table
CREATE TABLE IF NOT EXISTS document_folders (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  parent_id bigint REFERENCES document_folders(id),
  description text,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enhanced documents table
CREATE TABLE IF NOT EXISTS documents (
  id bigserial PRIMARY KEY,
  filename text NOT NULL,
  original_filename text,
  file_type text,
  file_size bigint, -- bytes
  folder_id bigint REFERENCES document_folders(id),
  storage_path text NOT NULL, -- Supabase Storage path
  thumbnail_url text,
  description text,
  tags text[],
  category text,
  is_public boolean DEFAULT false,
  access_level text DEFAULT 'private', -- 'private', 'team', 'role', 'public'
  uploaded_by uuid REFERENCES users(id),
  uploaded_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  download_count integer DEFAULT 0,
  view_count integer DEFAULT 0,
  version integer DEFAULT 1,
  parent_version_id bigint REFERENCES documents(id), -- for versioning
  metadata jsonb
);

-- Document permissions table
CREATE TABLE IF NOT EXISTS document_permissions (
  id bigserial PRIMARY KEY,
  document_id bigint REFERENCES documents(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id),
  role text,
  permission_type text, -- 'view', 'download', 'edit', 'delete', 'share'
  granted_by uuid REFERENCES users(id),
  granted_at timestamptz DEFAULT now()
);

-- Document shares table
CREATE TABLE IF NOT EXISTS document_shares (
  id bigserial PRIMARY KEY,
  document_id bigint REFERENCES documents(id) ON DELETE CASCADE,
  share_token text UNIQUE NOT NULL,
  shared_by uuid REFERENCES users(id),
  share_type text, -- 'user', 'role', 'public_link'
  recipient_id uuid REFERENCES users(id),
  recipient_role text,
  expires_at timestamptz,
  password_hash text,
  access_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Document versions table
CREATE TABLE IF NOT EXISTS document_versions (
  id bigserial PRIMARY KEY,
  document_id bigint REFERENCES documents(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  filename text,
  file_size bigint,
  storage_path text,
  uploaded_by uuid REFERENCES users(id),
  version_notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(document_id, version_number)
);
```

#### 6.3.9 API Endpoints

```
GET    /api/documents                        - List documents
POST   /api/documents                        - Upload document
GET    /api/documents/[id]                   - Get document
PUT    /api/documents/[id]                   - Update document
DELETE /api/documents/[id]                   - Delete document
GET    /api/documents/[id]/download          - Download document
GET    /api/documents/[id]/preview           - Preview document
GET    /api/documents/[id]/versions          - Get versions
POST   /api/documents/[id]/versions          - Create version
GET    /api/documents/[id]/share             - Get share link
POST   /api/documents/[id]/share             - Share document
DELETE /api/documents/[id]/share/[token]     - Revoke share

GET    /api/documents/folders                - List folders
POST   /api/documents/folders                - Create folder
PUT    /api/documents/folders/[id]           - Update folder
DELETE /api/documents/folders/[id]           - Delete folder
```

### 6.4 User Stories

**As a founder, I want to:**
- Organize documents in folders
- Share documents with specific people
- Track document versions
- See who accessed what documents
- Control document permissions

**As a volunteer, I want to:**
- Easily find training materials
- Download presentation templates
- Access shared documents

### 6.5 Success Metrics
- Document upload time < 5 seconds
- Document search time < 1 second
- 100% of documents organized in folders
- Document access tracking accuracy > 95%

---

## 7. Photo Gallery Management

### 7.1 Overview
Complete photo gallery system for managing, organizing, and displaying photos from presentations and events.

### 7.2 Current State
- Basic gallery page exists
- Shows images from resources table
- No organization or management features

### 7.3 Requirements

#### 7.3.1 Gallery Management Interface
**Location:** `/dashboard/founder/gallery`

**Features:**
- **Photo Upload:**
  - Drag-and-drop multiple photos
  - Bulk upload
  - Auto-resize/optimization
  - Auto-tagging by event/presentation

- **Photo Organization:**
  - Create albums
  - Add photos to albums
  - Tag photos
  - Add captions
  - Add location data
  - Add date taken

- **Photo Editing:**
  - Crop
  - Rotate
  - Basic filters
  - Brightness/contrast
  - Add text overlay

#### 7.3.2 Albums
**Features:**
- **Create Albums:**
  - Album name
  - Description
  - Cover photo
  - Privacy settings
  - Event/presentation association

- **Album Management:**
  - Edit album details
  - Reorder photos
  - Add/remove photos
  - Delete album
  - Share album

- **Default Albums:**
  - By event/presentation
  - By year
  - By chapter/team
  - Featured photos

#### 7.3.3 Public Gallery
**Location:** `/gallery` (public page)

**Features:**
- **Gallery Views:**
  - Grid view
  - Masonry view
  - Lightbox view
  - Slideshow mode

- **Filtering:**
  - By album
  - By date
  - By event
  - By tag
  - Search

- **Photo Details:**
  - Full-size view
  - Caption
  - Date
  - Location
  - Related photos
  - Share buttons

#### 7.3.4 Photo Features
- **Tags:**
  - Add multiple tags
  - Auto-suggest tags
  - Tag management
  - Filter by tags

- **Metadata:**
  - EXIF data (if available)
  - Upload date
  - Uploaded by
  - View count
  - Download count

- **Sharing:**
  - Share individual photos
  - Share albums
  - Social media sharing
  - Embed code

#### 7.3.5 Database Schema

```sql
-- Photo albums table
CREATE TABLE IF NOT EXISTS photo_albums (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  description text,
  cover_photo_id bigint REFERENCES photos(id),
  is_public boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  event_id bigint, -- optional link to event
  presentation_id bigint REFERENCES presentations(id),
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Photos table
CREATE TABLE IF NOT EXISTS photos (
  id bigserial PRIMARY KEY,
  filename text NOT NULL,
  original_filename text,
  storage_path text NOT NULL,
  thumbnail_path text,
  album_id bigint REFERENCES photo_albums(id),
  caption text,
  tags text[],
  location text,
  date_taken timestamptz,
  exif_data jsonb,
  width integer,
  height integer,
  file_size bigint,
  is_public boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  view_count integer DEFAULT 0,
  download_count integer DEFAULT 0,
  uploaded_by uuid REFERENCES users(id),
  uploaded_at timestamptz DEFAULT now(),
  display_order integer DEFAULT 0
);

-- Photo tags table (for tag management)
CREATE TABLE IF NOT EXISTS photo_tags (
  id bigserial PRIMARY KEY,
  name text UNIQUE NOT NULL,
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
```

#### 7.3.6 API Endpoints

```
GET    /api/gallery/albums                    - List albums
POST   /api/gallery/albums                    - Create album
GET    /api/gallery/albums/[id]               - Get album
PUT    /api/gallery/albums/[id]                - Update album
DELETE /api/gallery/albums/[id]                - Delete album

GET    /api/gallery/photos                    - List photos
POST   /api/gallery/photos                    - Upload photos
GET    /api/gallery/photos/[id]               - Get photo
PUT    /api/gallery/photos/[id]                - Update photo
DELETE /api/gallery/photos/[id]                - Delete photo
GET    /api/gallery/photos/[id]/download       - Download photo

GET    /api/gallery/tags                      - List tags
POST   /api/gallery/tags                      - Create tag
```

### 7.4 User Stories

**As a founder, I want to:**
- Upload photos from events easily
- Organize photos into albums
- Feature best photos on public gallery
- Track which photos are most viewed

**As a visitor, I want to:**
- Browse photos from presentations
- See photos organized by event
- Share photos I like

### 7.5 Success Metrics
- Photo upload time < 3 seconds per photo
- Gallery load time < 2 seconds
- 90% of photos organized in albums
- Public gallery engagement increases by 50%

---

## 8. Volunteer Recognition & Badges

### 8.1 Overview
Gamification system to recognize and reward volunteer achievements through badges, certificates, and leaderboards.

### 8.2 Current State
- Basic milestones exist in volunteer profile
- No badge system
- No recognition features

### 8.3 Requirements

#### 8.3.1 Badge System
**Location:** `/dashboard/founder/recognition/badges`

**Features:**
- **Badge Types:**
  - Hours milestones (10, 25, 50, 100, 250, 500, 1000)
  - Presentation milestones (1, 5, 10, 25, 50, 100)
  - Special achievements:
    - First presentation
    - Perfect attendance (month/quarter/year)
    - Top performer (month/quarter/year)
    - Mentor badge
    - Leadership badge
    - Innovation badge
    - Community impact badge

- **Badge Design:**
  - Custom badge images
  - Badge colors
  - Badge icons
  - Badge descriptions
  - Badge rarity (common, rare, epic, legendary)

- **Badge Management:**
  - Create custom badges
  - Edit badge details
  - Set auto-award rules
  - Manual badge awarding
  - Revoke badges (if needed)

#### 8.3.2 Badge Display
**Features:**
- **Volunteer Profile:**
  - Badge showcase
  - Badge collection
  - Recent badges
  - Badge progress

- **Badge Details:**
  - Badge name and description
  - Earned date
  - How to earn
  - Progress to next badge

- **Public Recognition:**
  - Volunteer of the month
  - Top performers leaderboard
  - Badge hall of fame
  - Recent achievements feed

#### 8.3.3 Certificates
**Features:**
- **Certificate Generation:**
  - Auto-generate certificates for milestones
  - Custom certificate templates
  - PDF download
  - Email certificate

- **Certificate Types:**
  - Hours completion certificates
  - Training completion certificates
  - Presentation participation certificates
  - Special achievement certificates

#### 8.3.4 Leaderboards
**Features:**
- **Leaderboard Types:**
  - All-time hours leaderboard
  - Monthly hours leaderboard
  - Presentations leaderboard
  - Badge collection leaderboard
  - Team/chapter leaderboard

- **Leaderboard Display:**
  - Top 10/25/50
  - User's rank
  - Points system (optional)
  - Time period filters

#### 8.3.5 Recognition Features
- **Volunteer of the Month:**
  - Nomination system
  - Voting (optional)
  - Announcement
  - Featured on homepage

- **Achievement Notifications:**
  - Email notification
  - In-app notification
  - Public announcement (optional)

- **Recognition Wall:**
  - Display all achievements
  - Filter by volunteer
  - Filter by badge type
  - Timeline view

#### 8.3.6 Database Schema

```sql
-- Badges table
CREATE TABLE IF NOT EXISTS badges (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  description text,
  icon_url text,
  badge_type text, -- 'hours', 'presentations', 'special', 'custom'
  criteria jsonb, -- criteria for earning badge
  rarity text DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Volunteer badges table
CREATE TABLE IF NOT EXISTS volunteer_badges (
  id bigserial PRIMARY KEY,
  volunteer_id bigint REFERENCES volunteers(id),
  badge_id bigint REFERENCES badges(id),
  earned_at timestamptz DEFAULT now(),
  awarded_by uuid REFERENCES users(id), -- null if auto-awarded
  notes text,
  UNIQUE(volunteer_id, badge_id)
);

-- Certificates table
CREATE TABLE IF NOT EXISTS certificates (
  id bigserial PRIMARY KEY,
  volunteer_id bigint REFERENCES volunteers(id),
  certificate_type text, -- 'hours', 'training', 'presentation', 'achievement'
  title text NOT NULL,
  description text,
  template_id bigint,
  pdf_url text,
  issued_at timestamptz DEFAULT now(),
  issued_by uuid REFERENCES users(id),
  expires_at timestamptz -- null if no expiration
);

-- Leaderboard entries table (for caching)
CREATE TABLE IF NOT EXISTS leaderboard_entries (
  id bigserial PRIMARY KEY,
  leaderboard_type text NOT NULL, -- 'hours_all_time', 'hours_monthly', etc.
  volunteer_id bigint REFERENCES volunteers(id),
  rank integer,
  score numeric, -- hours, presentations, points, etc.
  period_start date,
  period_end date,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(leaderboard_type, volunteer_id, period_start)
);

-- Volunteer of the month table
CREATE TABLE IF NOT EXISTS volunteer_of_month (
  id bigserial PRIMARY KEY,
  volunteer_id bigint REFERENCES volunteers(id),
  month date NOT NULL, -- first day of month
  reason text,
  featured_image_url text,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(month)
);
```

#### 8.3.7 API Endpoints

```
GET    /api/recognition/badges               - List badges
POST   /api/recognition/badges                - Create badge
GET    /api/recognition/badges/[id]           - Get badge
PUT    /api/recognition/badges/[id]           - Update badge

GET    /api/recognition/volunteers/[id]/badges - Get volunteer badges
POST   /api/recognition/volunteers/[id]/badges - Award badge
DELETE /api/recognition/volunteers/[id]/badges/[badgeId] - Revoke badge

GET    /api/recognition/leaderboard           - Get leaderboard
GET    /api/recognition/volunteer-of-month     - Get current VOTM
POST   /api/recognition/volunteer-of-month     - Set VOTM

GET    /api/recognition/certificates/[id]     - Get certificate
POST   /api/recognition/certificates          - Generate certificate
```

### 8.4 User Stories

**As a founder, I want to:**
- Recognize top volunteers
- Motivate volunteers with badges
- Track volunteer achievements
- Generate certificates automatically

**As a volunteer, I want to:**
- See my badges and achievements
- Know how to earn badges
- See where I rank
- Download my certificates

### 8.5 Success Metrics
- Badge earning increases volunteer engagement by 30%
- 80% of volunteers earn at least one badge
- Leaderboard participation > 60%
- Certificate generation time < 3 seconds

---

## 9. Advanced Analytics for Founders

### 9.1 Overview
Comprehensive analytics dashboard with custom reports, data visualization, and insights for founders to make data-driven decisions.

### 9.2 Current State
- Basic analytics exist
- Simple charts
- Limited metrics
- No custom reports

### 9.3 Requirements

#### 9.3.1 Analytics Dashboard
**Location:** `/dashboard/founder/analytics`

**Sections:**
1. **Executive Summary:**
   - Key metrics at a glance
   - Trends (up/down indicators)
   - Quick insights
   - Comparison periods

2. **Volunteer Analytics:**
   - Volunteer growth over time
   - Active vs inactive
   - Retention rate
   - Churn analysis
   - Hours distribution
   - Performance distribution
   - Engagement trends

3. **Presentation Analytics:**
   - Presentations over time
   - Completion rate
   - Schools reached
   - Students reached
   - Presentation quality scores
   - Volunteer participation
   - Geographic distribution

4. **Engagement Analytics:**
   - Website traffic
   - Blog views
   - Newsletter engagement
   - Social media metrics
   - Form submissions
   - Event registrations

5. **Financial Analytics:**
   - Donations over time
   - Donation sources
   - Grant status
   - Expense tracking (if added)
   - Revenue vs expenses

6. **Operational Analytics:**
   - Task completion rates
   - Average task duration
   - Team performance
   - Chapter activity
   - System usage

#### 9.3.2 Custom Reports Builder
**Features:**
- **Report Types:**
  - Volunteer reports
  - Presentation reports
  - Financial reports
  - Engagement reports
  - Custom data reports

- **Report Builder:**
  - Select data sources
  - Choose metrics
  - Apply filters
  - Select date range
  - Choose visualization type
  - Add calculations
  - Save report templates

- **Visualization Types:**
  - Line charts
  - Bar charts
  - Pie charts
  - Area charts
  - Tables
  - Heatmaps
  - Funnels
  - Gauges

#### 9.3.3 Report Scheduling
**Features:**
- **Scheduled Reports:**
  - Daily, weekly, monthly reports
  - Email delivery
  - PDF export
  - Multiple recipients

- **Report Templates:**
  - Pre-built templates
  - Custom templates
  - Share templates

#### 9.3.4 Data Export
**Features:**
- **Export Formats:**
  - CSV
  - Excel
  - PDF
  - JSON

- **Export Options:**
  - All data or filtered
  - Selected columns
  - Date range
  - Scheduled exports

#### 9.3.5 Insights & Recommendations
**Features:**
- **AI-Powered Insights:**
  - Trend analysis
  - Anomaly detection
  - Predictive analytics
  - Recommendations

- **Alerts:**
  - Metric thresholds
  - Significant changes
  - Goal tracking
  - Custom alerts

#### 9.3.6 Database Schema

```sql
-- Analytics cache table (for performance)
CREATE TABLE IF NOT EXISTS analytics_cache (
  id bigserial PRIMARY KEY,
  metric_key text NOT NULL,
  metric_value jsonb,
  period_start date,
  period_end date,
  calculated_at timestamptz DEFAULT now(),
  UNIQUE(metric_key, period_start, period_end)
);

-- Custom reports table
CREATE TABLE IF NOT EXISTS custom_reports (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  description text,
  report_config jsonb NOT NULL, -- report definition
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_template boolean DEFAULT false
);

-- Scheduled reports table
CREATE TABLE IF NOT EXISTS scheduled_reports (
  id bigserial PRIMARY KEY,
  report_id bigint REFERENCES custom_reports(id),
  schedule_type text, -- 'daily', 'weekly', 'monthly', 'custom'
  schedule_config jsonb, -- cron expression or schedule details
  recipients text[], -- email addresses
  format text DEFAULT 'pdf', -- 'pdf', 'csv', 'excel'
  is_active boolean DEFAULT true,
  last_sent_at timestamptz,
  next_send_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Analytics events table (for tracking)
CREATE TABLE IF NOT EXISTS analytics_events (
  id bigserial PRIMARY KEY,
  event_type text NOT NULL,
  event_data jsonb,
  user_id uuid REFERENCES users(id),
  session_id text,
  created_at timestamptz DEFAULT now()
);
```

#### 9.3.7 API Endpoints

```
GET    /api/analytics/metrics                - Get metrics
GET    /api/analytics/metrics/[key]          - Get specific metric
POST   /api/analytics/calculate              - Calculate metrics

GET    /api/analytics/reports                - List reports
POST   /api/analytics/reports                - Create report
GET    /api/analytics/reports/[id]           - Get report
PUT    /api/analytics/reports/[id]           - Update report
DELETE /api/analytics/reports/[id]           - Delete report
POST   /api/analytics/reports/[id]/export    - Export report

GET    /api/analytics/scheduled-reports      - List scheduled reports
POST   /api/analytics/scheduled-reports      - Create scheduled report
PUT    /api/analytics/scheduled-reports/[id]  - Update scheduled report
DELETE /api/analytics/scheduled-reports/[id]  - Delete scheduled report

GET    /api/analytics/insights               - Get AI insights
POST   /api/analytics/events                 - Track event
```

### 9.4 User Stories

**As a founder, I want to:**
- See all key metrics in one place
- Create custom reports for board meetings
- Schedule reports to be emailed automatically
- Identify trends and patterns
- Export data for external analysis
- Get insights and recommendations

### 9.5 Success Metrics
- Dashboard load time < 3 seconds
- Report generation time < 10 seconds
- 100% of key metrics tracked
- Founders use analytics weekly

---

## Implementation Priority

### Phase 1 (Weeks 1-3): Foundation
1. Enhanced Volunteer Tracking System
2. Calendar View
3. Site-Wide Search

### Phase 2 (Weeks 4-6): Communication & Workflow
4. Newsletter Marketing System
5. Volunteer Workflow & Onboarding

### Phase 3 (Weeks 7-9): Content & Recognition
6. Document Management UI
7. Photo Gallery Management
8. Volunteer Recognition & Badges

### Phase 4 (Week 10): Analytics
9. Advanced Analytics for Founders

---

## Technical Considerations

### Database Migrations
- All schema changes will be added as Supabase migrations
- Backward compatibility maintained
- Data migration scripts for existing data

### Performance
- Index all searchable fields
- Cache frequently accessed data
- Paginate large lists
- Optimize image uploads and processing

### Security
- Row-level security (RLS) on all tables
- Permission checks on all API endpoints
- Secure file uploads and storage
- Audit logs for sensitive operations

### Testing
- Unit tests for API endpoints
- Integration tests for workflows
- E2E tests for critical paths
- Performance testing

---

## Success Criteria

### Overall Platform Goals
- All 9 features implemented and functional
- Zero critical bugs
- Performance targets met
- User satisfaction > 4.5/5
- Founders can manage entire platform without code

### Individual Feature Goals
- Each feature meets its specific success metrics
- 90%+ feature adoption rate
- Positive user feedback
- Improved operational efficiency

---

## Appendix

### A. Database Schema Summary
All new tables and columns needed across all features.

### B. API Endpoints Summary
Complete list of all new API endpoints.

### C. UI Components Needed
List of reusable components to build.

### D. Third-Party Integrations
- Email service (SendGrid/Mailgun for newsletters)
- Image processing (Sharp for photo optimization)
- PDF generation (for certificates and reports)
- Calendar sync (Google Calendar API)

---

**Document Status:** Ready for Review  
**Next Steps:** Technical design review, resource allocation, sprint planning

