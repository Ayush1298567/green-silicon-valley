# Volunteer Onboarding Flow Implementation

## Overview
Complete volunteer onboarding system that guides new volunteers through activity selection, resource access, group chat setup, and presentation creation.

## ✅ What Was Implemented

### 1. Database Schema
**Migration:** `supabase/migrations/0026_volunteer_onboarding_flow.sql`

**New Tables:**
- `presentation_topics` - Available presentation topics/activities
- `topic_resources` - Resources (presentations, guides, rubrics) for each topic

**Enhanced Tables:**
- `volunteers` - Added:
  - `selected_topic_id` - The topic the volunteer chose
  - `selected_topic_at` - When they selected it
  - `group_channel_id` - Reference to their group chat
  - `onboarding_step` - Current step in onboarding
  - `presentation_draft_url` - Google Slides link
  - `group_member_contacts` - Contact info for group members

**Default Topics Created:**
- Renewable Energy
- Climate Change & Sustainability
- Pollution & Environmental Cleanup
- Ecosystems & Biodiversity
- Water Conservation & Environmental Engineering

### 2. Onboarding Flow Page
**Location:** `/dashboard/volunteer/onboarding`

**Features:**
- Multi-step progress bar showing current step
- Step 1: Activity Selection - Choose from available topics
- Step 2: View Resources - Download base presentation, guides, rubrics
- Step 3: Group Chat Setup - Create group chat, collect member contacts
- Step 4: Presentation Creation - Submit Google Slides link
- Step 5: Submit for Review - Final submission

**Components:**
- `ActivitySelectionCard` - Topic selection cards with descriptions
- `OnboardingProgressBar` - Visual progress indicator

### 3. Group Chat Integration
**API Route:** `/api/volunteer-onboarding/create-group-chat`

**Features:**
- Creates a team channel for the volunteer group
- Adds group members to the channel (if they have accounts)
- Sets channel description with instructions
- Links channel to volunteer record

**Instructions Displayed:**
- "Please text the group chat with your name and phone number"
- Link to open group chat
- Member contact collection

### 4. Volunteer Dashboard Updates
**Location:** `/dashboard/volunteer`

**Features:**
- Auto-redirects to onboarding if volunteer is approved but hasn't completed onboarding
- Shows onboarding status banner with current step
- Displays group chat link if available
- Quick access to continue onboarding

### 5. API Routes
- `/api/volunteer-onboarding/select-activity` - Handle topic selection
- `/api/volunteer-onboarding/create-group-chat` - Create group chat channel

## 📋 Onboarding Steps

1. **Activity Selected** (`activity_selected`)
   - Volunteer chooses a presentation topic
   - Topic is saved to volunteer record

2. **Resources Viewed** (`resources_viewed`)
   - Volunteer views/downloads resources for selected topic
   - Base presentation template, activity guide, rubric

3. **Group Chat Setup** (`group_chat_setup`)
   - Group chat channel is created
   - Members are added
   - Instructions to text name/phone number

4. **Presentation Created** (`presentation_created`)
   - Volunteer creates Google Slides presentation
   - Submits presentation draft URL

5. **Submitted for Review** (`submitted_for_review`)
   - Presentation submitted for founder/intern review
   - Waiting for approval

6. **Scheduled** (`scheduled`)
   - Presentation approved and scheduled with school

7. **Completed** (`completed`)
   - Presentation delivered
   - Onboarding complete

## 🔄 Flow Logic

### When Volunteer Logs In:
1. Check `application_status` - if "approved" and `onboarding_step` not "completed" or "scheduled"
2. Redirect to `/dashboard/volunteer/onboarding`
3. Show appropriate step based on `onboarding_step`

### Activity Selection:
- Display all active topics from `presentation_topics`
- Allow selection
- Save to `volunteers.selected_topic_id`
- Update `onboarding_step` to "resources_viewed"

### Resource Access:
- Load resources for selected topic from `topic_resources`
- Display download links
- Track if resources were viewed

### Group Chat:
- Create channel with team name
- Add creator as owner
- Try to add group members (if they have accounts)
- Save channel ID to volunteer record
- Display instructions for members to join

### Presentation Submission:
- Collect Google Slides URL
- Save to `presentation_draft_url`
- Update `onboarding_step` to "submitted_for_review"
- Notify founders/interns for review

## 🎯 Next Steps

1. **Run Database Migration:**
   ```sql
   -- Run in Supabase SQL Editor
   -- File: supabase/migrations/0026_volunteer_onboarding_flow.sql
   ```

2. **Add Topic Resources:**
   - Upload base presentation templates to Supabase Storage
   - Add activity guides and rubrics
   - Link them to topics in `topic_resources` table

3. **Test Flow:**
   - Approve a volunteer application (set `application_status` to "approved")
   - Login as volunteer
   - Go through onboarding steps
   - Verify group chat creation
   - Test resource downloads

4. **Optional Enhancements:**
   - Add resource upload interface for founders/interns
   - Add presentation review interface
   - Add email notifications for each step
   - Add progress tracking for founders

## 📊 Database Queries for Testing

```sql
-- Check topics
SELECT * FROM presentation_topics WHERE is_active = true;

-- Check volunteer onboarding status
SELECT id, team_name, selected_topic_id, onboarding_step, group_channel_id 
FROM volunteers 
WHERE application_status = 'approved';

-- Check topic resources
SELECT tr.*, pt.name as topic_name 
FROM topic_resources tr
JOIN presentation_topics pt ON tr.topic_id = pt.id
WHERE pt.is_active = true;
```

## 🎨 UI Features

- **Progress Bar:** Visual indicator of onboarding progress
- **Topic Cards:** Beautiful cards with icons and descriptions
- **Resource Viewer:** Clean interface for downloading resources
- **Group Chat Setup:** Step-by-step instructions
- **Status Banners:** Clear indicators on dashboard
- **Responsive Design:** Works on all devices

## 🔐 Permissions

- **Volunteers:** Can select activities, view resources, create group chats (team type), submit presentations
- **Founders/Interns:** Can manage topics, upload resources, review presentations, create any channel type
- **Group Chat:** Volunteers can create team channels for their groups

