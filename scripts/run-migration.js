import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables from .env.local
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  try {
    const envPath = join(process.cwd(), '.env.local');
    const envContent = readFileSync(envPath, 'utf8');
    const envLines = envContent.split('\n');

    for (const line of envLines) {
      if (line.trim().startsWith('#') || !line.includes('=')) continue;

      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=').trim();

      if (key.trim() === 'NEXT_PUBLIC_SUPABASE_URL') {
        supabaseUrl = value;
      } else if (key.trim() === 'SUPABASE_SERVICE_ROLE_KEY') {
        supabaseServiceKey = value;
      }
    }
  } catch (error) {
    console.log('Could not read .env.local file');
  }
}

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  console.log('🔧 Running Green Silicon Valley Migration...\n');

  try {
    // Read the migration file
    const migrationPath = join(process.cwd(), 'supabase', 'migrations', 'ALL_MIGRATIONS_COMPLETE_FIXED.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');

    // Execute the entire migration as one statement
    console.log('📄 Executing migration file...');

    const { error } = await supabase.rpc('exec', { query: migrationSQL });

    if (error) {
      console.error('❌ Migration failed:', error.message);
      console.error('This might be because the exec function doesn\'t exist.');
      console.error('Please try copying the SQL directly to Supabase SQL Editor instead.');
      process.exit(1);
    } else {
      console.log('✅ Migration executed successfully!');
    }

  } catch (error) {
    console.error('💥 Fatal error during migration:', error.message);
    console.error('\n💡 Alternative: Copy the SQL from supabase/migrations/ALL_MIGRATIONS_COMPLETE_FIXED.sql');
    console.error('   and paste it directly into your Supabase SQL Editor.');
    process.exit(1);
  }
}

runMigration();
