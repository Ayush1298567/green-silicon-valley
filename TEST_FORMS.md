# Testing Guide for Enhanced Forms

## ✅ Database Migration Complete
The migration `0025_enhanced_forms.sql` has been run successfully.

## 🧪 Testing Steps

### 1. Test Teacher Request Form

**URL:** `http://localhost:3000/teachers/request` (or your deployed URL)

**What to Test:**
- Fill out all fields in the form
- Select preferred months (multiple checkboxes)
- Select topic interests (multiple checkboxes)
- Choose request type (presentation, mailing list, or both)
- Submit the form
- Verify success message appears
- Check database: Go to Supabase → Table Editor → `schools` table
  - Verify new row was created/updated
  - Check that all fields are populated correctly:
    - `grade_levels`
    - `request_type`
    - `preferred_months` (should be an array)
    - `topic_interests` (should be an array)
    - `status` should be 'pending'
    - `submitted_at` should have a timestamp

### 2. Test Volunteer Signup Form

**URL:** `http://localhost:3000/get-involved` → Click "Start Application"

**What to Test:**
- Go through all 12 sections
- Section 1: Enter email
- Section 2: Enter group city, size (3-7), and year
- Sections 3-9: Enter information for at least 3 group members
  - Name, email, phone, high school for each member
  - For members beyond your group size, you can put "N/A"
- Section 10: Select grade preference, district, and contact phone
- Section 11: Enter how you heard about GSV and why you want to volunteer
- Section 12: Review and submit
- Verify success message appears
- Check database: Go to Supabase → Table Editor → `volunteers` table
  - Verify new row was created
  - Check that all fields are populated:
    - `group_city`
    - `group_size` (should be a number 3-7)
    - `group_year`
    - `group_members` (should be JSON array with member objects)
    - `primary_contact_phone`
    - `preferred_grade_level`
    - `in_santa_clara_usd` (boolean)
    - `how_heard`
    - `why_volunteer`
    - `application_status` should be 'pending'
    - `submitted_at` should have a timestamp

### 3. Verify Form Data Structure

**In Supabase SQL Editor, run:**

```sql
-- Check teacher requests
SELECT 
  id, 
  name, 
  teacher_name, 
  email, 
  grade_levels, 
  request_type, 
  preferred_months, 
  topic_interests, 
  status, 
  submitted_at 
FROM schools 
WHERE submitted_at IS NOT NULL 
ORDER BY submitted_at DESC 
LIMIT 5;

-- Check volunteer applications
SELECT 
  id, 
  team_name, 
  group_city, 
  group_size, 
  group_year, 
  group_members, 
  application_status, 
  submitted_at 
FROM volunteers 
WHERE submitted_at IS NOT NULL 
ORDER BY submitted_at DESC 
LIMIT 5;
```

### 4. Test Error Handling

**Teacher Form:**
- Try submitting without required fields
- Verify error messages appear

**Volunteer Form:**
- Try submitting with less than 3 group members
- Verify error message appears
- Try skipping required fields in each section
- Verify validation works

### 5. Test Intern Access (if you have intern account)

**Pages Interns Should Access:**
- `/admin/content-editor` ✅
- `/admin/blog` ✅
- `/admin/media-manager` ✅
- `/admin/page-builder` ✅ (limited)
- `/admin/user-manager` ✅ (view-only)
- `/admin/announcements` ✅

**Pages Interns Should NOT Access:**
- `/admin/settings/ai` ❌
- `/admin/marketing` ❌
- `/admin/data` ❌
- `/admin/email-templates` ❌
- `/admin/permissions` ❌

## 🐛 Troubleshooting

### If forms don't submit:
1. Check browser console for errors
2. Check network tab for API errors
3. Verify API routes are working: `/api/forms/teacher` and `/api/forms/volunteer`

### If database columns don't exist:
- Re-run the migration: `0025_enhanced_forms.sql`
- Check Supabase → Table Editor → `schools` and `volunteers` tables
- Verify columns were added

### If you see TypeScript errors:
- Run `npm run build` to check for type errors
- Verify all imports are correct

## 📊 Expected Results

After successful testing:
- ✅ Teacher form submissions create/update records in `schools` table
- ✅ Volunteer form submissions create records in `volunteers` table
- ✅ All form data is stored correctly with proper types
- ✅ Success messages appear after submission
- ✅ Error handling works for invalid inputs
- ✅ Interns can access allowed admin pages
- ✅ Interns cannot access restricted pages

## 🎯 Next Steps After Testing

1. **If everything works:**
   - Forms are ready for production use
   - Consider adding status tracking pages (optional)
   - Consider adding newsletter signup to homepage (optional)

2. **If issues found:**
   - Report specific errors
   - Check database structure
   - Verify API routes are accessible

