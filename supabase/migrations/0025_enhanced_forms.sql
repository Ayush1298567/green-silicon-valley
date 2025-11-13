-- ============================================================================
-- ENHANCED FORMS MIGRATION
-- Adds columns to store comprehensive form submission data
-- ============================================================================

-- ============================================================================
-- ENHANCE SCHOOLS TABLE (Teacher Request Form)
-- ============================================================================

-- Add columns for teacher request form
ALTER TABLE schools ADD COLUMN IF NOT EXISTS grade_levels text; -- e.g., "4th Grade Science, 7th–8th STEM"
ALTER TABLE schools ADD COLUMN IF NOT EXISTS request_type text DEFAULT 'presentation'; -- 'presentation', 'mailing_list', 'both'
ALTER TABLE schools ADD COLUMN IF NOT EXISTS preferred_months text[]; -- Array of preferred months
ALTER TABLE schools ADD COLUMN IF NOT EXISTS topic_interests text[]; -- Array of topic interests
ALTER TABLE schools ADD COLUMN IF NOT EXISTS classroom_needs text; -- Specific classroom needs or grade focus
ALTER TABLE schools ADD COLUMN IF NOT EXISTS additional_notes text; -- Any additional information
ALTER TABLE schools ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending'; -- 'pending', 'contacted', 'scheduled', 'completed', 'waitlist'
ALTER TABLE schools ADD COLUMN IF NOT EXISTS submitted_at timestamptz DEFAULT now();
ALTER TABLE schools ADD COLUMN IF NOT EXISTS contacted_at timestamptz;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS on_mailing_list boolean DEFAULT false;

-- ============================================================================
-- ENHANCE VOLUNTEERS TABLE (Volunteer Signup Form)
-- ============================================================================

-- Add columns for volunteer group signup form
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS group_city text; -- City where majority of group is located
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS group_size integer; -- 3-7 people
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS group_year text; -- 'Freshman', 'Sophomore', 'Junior', 'Senior'
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS group_members jsonb DEFAULT '[]'::jsonb; -- Array of member objects with name, email, phone, highschool
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS primary_contact_phone text; -- Phone number of one group member
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS preferred_grade_level text; -- 'Elementary (K–5)', 'Middle School (6–8)', 'No preference'
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS in_santa_clara_usd boolean DEFAULT false; -- Are they in Santa Clara Unified School District?
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS how_heard text; -- How did they hear about us
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS why_volunteer text; -- 1-2 sentence summary
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS application_status text DEFAULT 'pending'; -- 'pending', 'contacted', 'approved', 'rejected', 'active'
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS submitted_at timestamptz DEFAULT now();
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS contacted_at timestamptz;
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS approved_at timestamptz;

-- Create index for application status
CREATE INDEX IF NOT EXISTS idx_volunteers_application_status ON volunteers(application_status);
CREATE INDEX IF NOT EXISTS idx_schools_status ON schools(status);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON COLUMN schools.grade_levels IS 'Grade levels taught by the teacher (e.g., "4th Grade Science, 7th–8th STEM")';
COMMENT ON COLUMN schools.request_type IS 'Type of request: presentation, mailing_list, or both';
COMMENT ON COLUMN schools.preferred_months IS 'Array of preferred months for presentation';
COMMENT ON COLUMN schools.topic_interests IS 'Array of presentation topics of interest';
COMMENT ON COLUMN volunteers.group_members IS 'JSON array of group member information (name, email, phone, highschool)';
COMMENT ON COLUMN volunteers.application_status IS 'Status of volunteer application: pending, contacted, approved, rejected, active';

