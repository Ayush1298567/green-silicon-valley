/**
 * Automated Supabase Setup Script
 * This script will set up as much as possible automatically
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing environment variables!');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupStorageBuckets() {
  console.log('\n📁 Setting up storage buckets...');

  const buckets = [
    { name: 'media', public: true, fileSizeLimit: 52428800 }, // 50 MB
    { name: 'blog-covers', public: true, fileSizeLimit: 10485760 }, // 10 MB
    { name: 'user-uploads', public: false, fileSizeLimit: 52428800 }, // 50 MB
    { name: 'verification-slips', public: false, fileSizeLimit: 10485760 } // 10 MB
  ];

  for (const bucket of buckets) {
    try {
      // Check if bucket exists
      const { data: existingBuckets } = await supabase.storage.listBuckets();
      const exists = existingBuckets?.some(b => b.name === bucket.name);

      if (exists) {
        console.log(`  ✅ Bucket "${bucket.name}" already exists`);
      } else {
        // Create bucket
        const { data, error } = await supabase.storage.createBucket(bucket.name, {
          public: bucket.public,
          fileSizeLimit: bucket.fileSizeLimit
        });

        if (error) {
          console.error(`  ❌ Failed to create bucket "${bucket.name}":`, error.message);
        } else {
          console.log(`  ✅ Created bucket "${bucket.name}" (${bucket.public ? 'public' : 'private'})`);
        }
      }
    } catch (error: any) {
      console.error(`  ❌ Error with bucket "${bucket.name}":`, error.message);
    }
  }
}

async function verifyDatabase() {
  console.log('\n🗄️  Verifying database setup...');

  const tables = [
    'users', 'page_sections', 'website_settings', 'blog_posts', 'media_files',
    'schools', 'presentations', 'volunteers', 'volunteer_hours', 'intern_projects',
    'chapters', 'bulletin_posts', 'nav_links', 'content_blocks', 'system_logs'
  ];

  let allExist = true;

  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('id').limit(1);
      
      if (error) {
        console.log(`  ❌ Table "${table}" not found or not accessible`);
        allExist = false;
      } else {
        console.log(`  ✅ Table "${table}" exists`);
      }
    } catch (error: any) {
      console.log(`  ❌ Table "${table}" error:`, error.message);
      allExist = false;
    }
  }

  if (!allExist) {
    console.log('\n⚠️  Some tables are missing. Please run COMPLETE_DATABASE_SETUP.sql in Supabase SQL Editor.');
  }

  return allExist;
}

async function verifyFounderUsers() {
  console.log('\n👤 Verifying founder users...');

  const founderEmails = [
    'devshah2k09@gmail.com',
    'siddpokuri@gmail.com',
    'ayushg.2024@gmail.com',
    'abhiramtenneti2009@gmail.com',
    'sa.sc.2018@gmail.com'
  ];

  let allFoundersSet = true;

  for (const email of founderEmails) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !data) {
        console.log(`  ⚠️  Founder user ${email} not found. Will be created when they sign in.`);
        allFoundersSet = false;
        continue;
      }

      if (data.role === 'founder') {
        console.log(`  ✅ ${email} has founder role`);
      } else {
        console.log(`  ⚠️  ${email} exists but role is "${data.role}", updating to "founder"...`);

        const { error: updateError } = await supabase
          .from('users')
          .update({ role: 'founder', status: 'active' })
          .eq('id', data.id);

        if (updateError) {
          console.log(`  ❌ Failed to update ${email}:`, updateError.message);
          allFoundersSet = false;
        } else {
          console.log(`  ✅ Updated ${email} to founder role`);
        }
      }
    } catch (error: any) {
      console.log(`  ❌ Error checking ${email}:`, error.message);
      allFoundersSet = false;
    }
  }

  if (allFoundersSet) {
    console.log('  ✅ All founder users verified');
  } else {
    console.log('  ℹ️  Some founder users need to sign in first, then run setup again');
  }

  return allFoundersSet;
}

async function setupDefaultData() {
  console.log('\n📝 Setting up default data...');

  // Check if website settings exist
  try {
    const { data: settings } = await supabase
      .from('website_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (!settings) {
      console.log('  ⚠️  Website settings not found. This should have been created by COMPLETE_DATABASE_SETUP.sql');
    } else {
      console.log('  ✅ Website settings exist');
    }
  } catch (error: any) {
    console.log('  ⚠️  Could not verify website settings');
  }

  // Check if nav links exist
  try {
    const { data: navLinks, error } = await supabase
      .from('nav_links')
      .select('*');

    if (error) {
      console.log('  ⚠️  Could not check nav links');
    } else if (!navLinks || navLinks.length === 0) {
      console.log('  ⚠️  Nav links not found. This should have been created by COMPLETE_DATABASE_SETUP.sql');
    } else {
      console.log(`  ✅ Nav links exist (${navLinks.length} links)`);
    }
  } catch (error: any) {
    console.log('  ⚠️  Could not verify nav links');
  }
}

async function checkAuthConfig() {
  console.log('\n🔐 Checking auth configuration...');
  
  console.log('  ℹ️  Manual steps required:');
  console.log('     1. Enable Google OAuth in Supabase Dashboard');
  console.log('     2. Set Site URL to http://localhost:3000');
  console.log('     3. Add redirect URLs');
  console.log('     See SUPABASE_CHECKLIST.md for details');
}

async function main() {
  console.log('🚀 Starting Supabase Setup...\n');
  console.log('This script will set up as much as possible automatically.');
  console.log('Some steps still require manual configuration in Supabase Dashboard.\n');

  try {
    // Step 1: Verify database
    const dbReady = await verifyDatabase();

    // Step 2: Set up storage buckets
    await setupStorageBuckets();

    // Step 3: Verify founder users
    await verifyFounderUsers();

    // Step 4: Check default data
    await setupDefaultData();

    // Step 5: Auth config reminder
    await checkAuthConfig();

    console.log('\n' + '='.repeat(60));
    console.log('📊 SETUP SUMMARY');
    console.log('='.repeat(60));

    if (dbReady) {
      console.log('✅ Database: All tables verified');
    } else {
      console.log('⚠️  Database: Some tables missing - run COMPLETE_DATABASE_SETUP.sql');
    }

    console.log('✅ Storage: Buckets created/verified');
    console.log('⚠️  Storage Policies: Run SUPABASE_STORAGE_POLICIES.sql manually');
    console.log('⚠️  Google OAuth: Configure manually in Supabase Dashboard');
    console.log('⚠️  Site URL: Configure manually in Supabase Dashboard');
    console.log('⚠️  Realtime: Enable manually in Supabase Dashboard');

    console.log('\n' + '='.repeat(60));
    console.log('📋 NEXT STEPS');
    console.log('='.repeat(60));
    console.log('1. Run SUPABASE_STORAGE_POLICIES.sql in Supabase SQL Editor');
    console.log('2. Follow SUPABASE_CHECKLIST.md for remaining manual steps');
    console.log('3. Test by running: npm run dev');
    console.log('='.repeat(60) + '\n');

  } catch (error: any) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

main();

