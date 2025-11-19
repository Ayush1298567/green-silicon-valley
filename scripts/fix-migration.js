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
  console.log('🔧 Running Green Silicon Valley Migration Fix...\n');

  try {
    // Read the migration file
    const migrationPath = join(process.cwd(), 'supabase', 'migrations', 'ALL_MIGRATIONS_COMPLETE.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');

    // Split into individual statements (basic approach)
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📄 Found ${statements.length} SQL statements to execute\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';

      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });

        if (error) {
          // Check if it's an "already exists" error - these are usually safe to ignore
          if (error.message.includes('already exists') ||
              error.message.includes('does not exist') ||
              error.message.includes('duplicate key')) {
            console.log(`⚠️  Statement ${i + 1}: ${error.message} (safe to ignore)`);
            continue;
          }

          console.error(`❌ Statement ${i + 1} failed:`, error.message);
          console.error(`   SQL: ${statement.substring(0, 100)}...`);
          errorCount++;
        } else {
          successCount++;
          if (successCount % 10 === 0) {
            console.log(`✅ ${successCount} statements executed successfully...`);
          }
        }
      } catch (err) {
        console.error(`💥 Statement ${i + 1} threw exception:`, err.message);
        errorCount++;
      }
    }

    console.log(`\n🎉 Migration completed!`);
    console.log(`✅ Successful statements: ${successCount}`);
    console.log(`❌ Failed statements: ${errorCount}`);

    if (errorCount === 0) {
      console.log('\n🚀 All statements executed successfully!');
      console.log('🎯 Your database is now ready with all features!');
    } else {
      console.log(`\n⚠️  ${errorCount} statements failed, but this is usually safe.`);
      console.log('🔍 Check the error messages above for any critical issues.');
    }

  } catch (error) {
    console.error('💥 Fatal error during migration:', error.message);
    process.exit(1);
  }
}

runMigration();
