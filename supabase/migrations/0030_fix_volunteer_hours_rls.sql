-- ============================================================================
-- FIX VOLUNTEER HOURS RLS POLICIES
-- Migration: 0030_fix_volunteer_hours_rls.sql
-- Date: December 2024
-- Purpose: Update RLS policies to use team-based model instead of user_id
-- ============================================================================

BEGIN;

-- ============================================================================
-- STEP 1: DROP OLD POLICIES
-- ============================================================================

DO $$
BEGIN
  -- Drop policies that reference user_id directly
  IF EXISTS (SELECT 1 FROM pg_policies WHERE polname = 'vol_hours_insert_member') THEN
    DROP POLICY vol_hours_insert_member ON volunteer_hours;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE polname = 'vol_hours_update_pending_self') THEN
    DROP POLICY vol_hours_update_pending_self ON volunteer_hours;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE polname = 'vol_hours_member_read') THEN
    DROP POLICY vol_hours_member_read ON volunteer_hours;
  END IF;
END $$;

-- ============================================================================
-- STEP 2: CREATE NEW TEAM-BASED POLICIES
-- ============================================================================

-- Policy: Volunteers can insert hours if they're part of the team
-- Check via team_members table that user belongs to the volunteer team
CREATE POLICY vol_hours_insert_member ON volunteer_hours FOR INSERT
  WITH CHECK (
    submitted_by = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM team_members tm
      WHERE tm.user_id = auth.uid()
        AND tm.volunteer_team_id = volunteer_hours.volunteer_id
    )
  );

-- Policy: Volunteers can read hours for their team
CREATE POLICY vol_hours_member_read ON volunteer_hours FOR SELECT
  USING (
    -- User is part of the team
    EXISTS (
      SELECT 1
      FROM team_members tm
      WHERE tm.user_id = auth.uid()
        AND tm.volunteer_team_id = volunteer_hours.volunteer_id
    )
    OR
    -- User submitted the hours
    submitted_by = auth.uid()
    OR
    -- Staff (founder/intern) can read all
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.role IN ('founder', 'intern')
    )
  );

-- Policy: Volunteers can update their own pending submissions
CREATE POLICY vol_hours_update_pending_self ON volunteer_hours FOR UPDATE
  USING (
    status = 'pending'
    AND submitted_by = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM team_members tm
      WHERE tm.user_id = auth.uid()
        AND tm.volunteer_team_id = volunteer_hours.volunteer_id
    )
  );

-- Policy: Staff (founder/intern) can update any hours (approve/reject)
-- This policy should already exist, but ensure it's correct
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE polname = 'vol_hours_update_staff'
  ) THEN
    CREATE POLICY vol_hours_update_staff ON volunteer_hours FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM users u 
          WHERE u.id = auth.uid() 
          AND u.role IN ('founder', 'intern')
        )
      );
  END IF;
END $$;

COMMENT ON POLICY vol_hours_insert_member ON volunteer_hours IS 
  'Volunteers can insert hours for their team (checked via team_members)';
COMMENT ON POLICY vol_hours_member_read ON volunteer_hours IS 
  'Volunteers can read hours for their team, or staff can read all';
COMMENT ON POLICY vol_hours_update_pending_self ON volunteer_hours IS 
  'Volunteers can update their own pending submissions for their team';

COMMIT;

