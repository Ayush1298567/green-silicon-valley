import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

console.log('🔧 Generating fixed SQL migration file...\n');

// Read the original migration
const migrationPath = join(process.cwd(), 'supabase', 'migrations', 'ALL_MIGRATIONS_COMPLETE.sql');
let migrationSQL = readFileSync(migrationPath, 'utf8');

// Additional safety fixes - add more DROP statements for common conflicts
const safetyFixes = `
-- SAFETY FIXES: Drop any existing conflicting objects
DROP TRIGGER IF EXISTS update_volunteers_updated_at ON volunteers;
DROP TRIGGER IF EXISTS update_presentations_updated_at ON presentations;
DROP TRIGGER IF EXISTS update_teams_updated_at ON teams;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS create_document_notification();
DROP FUNCTION IF EXISTS intern_has_permission(uuid, text);
DROP FUNCTION IF EXISTS log_permission_change();
DROP FUNCTION IF EXISTS validate_material_budget();
DROP FUNCTION IF EXISTS user_role();

-- Recreate the update function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

`;

// Insert safety fixes at the beginning
migrationSQL = migrationSQL.replace(
  '-- ============================================================================\n-- MIGRATION 1: DOCUMENT WORKFLOW (0032)\n-- ============================================================================',
  safetyFixes + '-- ============================================================================\n-- MIGRATION 1: DOCUMENT WORKFLOW (0032)\n-- ============================================================================'
);

// Write the fixed version
const fixedPath = join(process.cwd(), 'supabase', 'migrations', 'ALL_MIGRATIONS_COMPLETE_FIXED.sql');
writeFileSync(fixedPath, migrationSQL);

console.log('✅ Fixed SQL migration generated!');
console.log(`📄 File saved to: ${fixedPath}`);
console.log('');
console.log('🚀 NEXT STEPS:');
console.log('1. Open the FIXED migration file');
console.log('2. Copy ALL content');
console.log('3. Paste into Supabase SQL Editor');
console.log('4. Click "Run"');
console.log('');
console.log('This version includes safety fixes to prevent trigger conflicts!');
