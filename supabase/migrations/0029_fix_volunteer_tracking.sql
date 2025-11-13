-- ============================================================================
-- FIX VOLUNTEER TRACKING CONSISTENCY
-- Migration: 0029_fix_volunteer_tracking.sql
-- Date: December 2024
-- Purpose: Fix type mismatches and establish consistent team-based tracking
-- ============================================================================

BEGIN;

-- ============================================================================
-- STEP 1: DATA AUDIT (Log current state)
-- ============================================================================

DO $$
DECLARE
  hours_count integer;
  orphaned_hours_count integer;
BEGIN
  SELECT COUNT(*) INTO hours_count FROM volunteer_hours;
  SELECT COUNT(*) INTO orphaned_hours_count FROM volunteer_hours vh
    LEFT JOIN team_members tm ON vh.volunteer_id::text = tm.user_id::text
    WHERE vh.volunteer_id IS NOT NULL AND tm.user_id IS NULL;
  
  RAISE NOTICE 'Current volunteer_hours records: %', hours_count;
  RAISE NOTICE 'Orphaned hours records (users not in teams): %', orphaned_hours_count;
END $$;

-- ============================================================================
-- STEP 2: FIX volunteer_hours.volunteer_id
-- ============================================================================

-- Step 2.1: Add temporary column for team ID
ALTER TABLE volunteer_hours ADD COLUMN IF NOT EXISTS volunteer_team_id_temp bigint;

-- Step 2.2: Migrate data: Find team for each user via team_members
UPDATE volunteer_hours vh
SET volunteer_team_id_temp = tm.volunteer_team_id
FROM team_members tm
WHERE vh.volunteer_id::text = tm.user_id::text
AND tm.volunteer_team_id IS NOT NULL;

-- Step 2.3: Handle orphaned records (users not in teams)
-- Option: Set to NULL - these will need to be handled in code or manually migrated
-- For now, we'll leave them NULL and log them
DO $$
DECLARE
  orphaned_count integer;
BEGIN
  SELECT COUNT(*) INTO orphaned_count FROM volunteer_hours 
    WHERE volunteer_id IS NOT NULL AND volunteer_team_id_temp IS NULL;
  
  IF orphaned_count > 0 THEN
    RAISE NOTICE 'Warning: % orphaned volunteer_hours records (users not in teams). These will be set to NULL.', orphaned_count;
  END IF;
END $$;

-- Step 2.4: Drop old constraint and column
DO $$
BEGIN
  -- Drop foreign key constraint if it exists
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'volunteer_hours_volunteer_id_fkey'
  ) THEN
    ALTER TABLE volunteer_hours DROP CONSTRAINT volunteer_hours_volunteer_id_fkey;
  END IF;
END $$;

-- Step 2.5: Drop old column and rename new column
ALTER TABLE volunteer_hours DROP COLUMN IF EXISTS volunteer_id;
ALTER TABLE volunteer_hours RENAME COLUMN volunteer_team_id_temp TO volunteer_id;

-- Step 2.6: Add new foreign key constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'volunteer_hours_volunteer_id_fkey'
  ) THEN
    ALTER TABLE volunteer_hours
      ADD CONSTRAINT volunteer_hours_volunteer_id_fkey
      FOREIGN KEY (volunteer_id) REFERENCES volunteers(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ============================================================================
-- STEP 3: FIX volunteer_hours.presentation_id TYPE
-- ============================================================================

-- Step 3.1: Drop old constraint if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'volunteer_hours_presentation_id_fkey'
  ) THEN
    ALTER TABLE volunteer_hours DROP CONSTRAINT volunteer_hours_presentation_id_fkey;
  END IF;
END $$;

-- Step 3.2: Migrate presentation_id data
-- If presentation_id is currently uuid (string), we need to match with presentations.id
-- If it's already a number, keep it
DO $$
BEGIN
  -- Check if presentation_id column exists and has data
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'volunteer_hours' AND column_name = 'presentation_id'
  ) THEN
    -- Try to match existing presentation_ids with presentations table
    -- If presentation_id is a uuid string, try to find matching presentation
    -- If it's already a number, it should match directly
    
    -- First, try direct numeric match (if already bigint stored as text)
    UPDATE volunteer_hours vh
    SET presentation_id = p.id
    FROM presentations p
    WHERE vh.presentation_id IS NOT NULL
    AND vh.presentation_id::text = p.id::text;
    
    -- For any remaining unmatched, set to NULL
    -- (These would be invalid references anyway)
    UPDATE volunteer_hours
    SET presentation_id = NULL
    WHERE presentation_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM presentations p 
      WHERE p.id::text = volunteer_hours.presentation_id::text
    );
  END IF;
END $$;

-- Step 3.3: Change column type to bigint
-- Handle conversion: if it's text/uuid, convert to bigint; if already numeric, keep it
DO $$
BEGIN
  -- Check current column type
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'volunteer_hours' 
    AND column_name = 'presentation_id'
    AND data_type != 'bigint'
  ) THEN
    -- Convert to bigint
    ALTER TABLE volunteer_hours 
      ALTER COLUMN presentation_id TYPE bigint 
      USING CASE 
        WHEN presentation_id IS NULL THEN NULL
        WHEN presentation_id::text ~ '^[0-9]+$' THEN presentation_id::text::bigint
        ELSE NULL  -- Invalid format, set to NULL
      END;
  END IF;
END $$;

-- Step 3.4: Add foreign key constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'volunteer_hours_presentation_id_fkey'
  ) THEN
    ALTER TABLE volunteer_hours
      ADD CONSTRAINT volunteer_hours_presentation_id_fkey
      FOREIGN KEY (presentation_id) REFERENCES presentations(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ============================================================================
-- STEP 4: VERIFY DATA INTEGRITY
-- ============================================================================

DO $$
DECLARE
  orphaned_hours integer;
  orphaned_presentations integer;
BEGIN
  -- Check for orphaned volunteer_hours (volunteer_id doesn't exist in volunteers)
  SELECT COUNT(*) INTO orphaned_hours FROM volunteer_hours vh
    LEFT JOIN volunteers v ON vh.volunteer_id = v.id
    WHERE vh.volunteer_id IS NOT NULL AND v.id IS NULL;
  
  -- Check for orphaned presentation references
  SELECT COUNT(*) INTO orphaned_presentations FROM volunteer_hours vh
    LEFT JOIN presentations p ON vh.presentation_id = p.id
    WHERE vh.presentation_id IS NOT NULL AND p.id IS NULL;
  
  IF orphaned_hours > 0 THEN
    RAISE WARNING 'Found % orphaned volunteer_hours records (volunteer_id not in volunteers)', orphaned_hours;
  END IF;
  
  IF orphaned_presentations > 0 THEN
    RAISE WARNING 'Found % orphaned volunteer_hours records (presentation_id not in presentations)', orphaned_presentations;
  END IF;
  
  RAISE NOTICE 'Migration completed. Orphaned hours: %, Orphaned presentations: %', orphaned_hours, orphaned_presentations;
END $$;

-- ============================================================================
-- STEP 5: UPDATE INDEXES
-- ============================================================================

-- Recreate indexes if needed
CREATE INDEX IF NOT EXISTS idx_volunteer_hours_volunteer ON volunteer_hours(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_hours_presentation ON volunteer_hours(presentation_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_hours_status ON volunteer_hours(status);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON COLUMN volunteer_hours.volunteer_id IS 'References volunteers.id (team ID), not users.id';
COMMENT ON COLUMN volunteer_hours.presentation_id IS 'References presentations.id (bigint)';

COMMIT;

