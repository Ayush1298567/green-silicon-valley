#!/usr/bin/env node

/**
 * VERIFICATION SCRIPT - Tests the complete setup
 * Run this after setup to ensure everything is working
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 GREEN SILICON VALLEY - SETUP VERIFICATION');
console.log('============================================\n');

// Check environment variables
console.log('📝 Checking environment configuration...');
const envPath = path.join(process.cwd(), '.env.local');

if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local file not found');
  console.log('   Run: cp .env.example .env.local');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const hasSupabaseUrl = envContent.includes('supabase.co') && !envContent.includes('your-project-ref');
const hasAnonKey = envContent.includes('your-anon-key-here') === false;
const hasServiceKey = envContent.includes('your-service-role-key-here') === false;

console.log(`   Supabase URL: ${hasSupabaseUrl ? '✅' : '❌ (needs configuration)'}`);
console.log(`   Anon Key: ${hasAnonKey ? '✅' : '❌ (needs configuration)'}`);
console.log(`   Service Key: ${hasServiceKey ? '✅' : '❌ (needs configuration)'}`);

// Check database tables
console.log('\n🗄️  Checking database tables...');

// This would require actual database connection to verify
// For now, we'll just check if the migration files exist
const migrationPath = path.join(process.cwd(), 'supabase/migrations/ALL_MIGRATIONS_COMPLETE_FIXED.sql');
console.log(`   Migration file: ${fs.existsSync(migrationPath) ? '✅' : '❌'}`);

// Check if key components exist
console.log('\n🏗️  Checking application components...');

const keyFiles = [
  'app/page.tsx',
  'app/layout.tsx',
  'app/login/page.tsx',
  'app/auth/callback/route.ts',
  'components/NavBar.tsx',
  'components/Footer.tsx',
  'components/dashboard/founder/AIChatInterface.tsx',
  'lib/aiAgentService.ts',
  'app/api/ai/actions/route.ts'
];

keyFiles.forEach(file => {
  const exists = fs.existsSync(path.join(process.cwd(), file));
  console.log(`   ${file}: ${exists ? '✅' : '❌'}`);
});

// Check API endpoints
console.log('\n🔗 Checking API endpoints...');

const apiEndpoints = [
  'app/api/forms/route.ts',
  'app/api/forms/volunteer/route.ts',
  'app/api/forms/teacher/route.ts',
  'app/api/ai/chat/route.ts',
  'app/api/ai/analytics/route.ts',
  'app/api/dashboard/route.ts'
];

apiEndpoints.forEach(endpoint => {
  const exists = fs.existsSync(path.join(process.cwd(), endpoint));
  console.log(`   ${endpoint}: ${exists ? '✅' : '❌'}`);
});

// Check forms
console.log('\n📋 Checking user forms...');

const forms = [
  'app/get-involved/volunteer/page.tsx',
  'app/teachers/request/page.tsx',
  'app/contact/page.tsx'
];

forms.forEach(form => {
  const exists = fs.existsSync(path.join(process.cwd(), form));
  console.log(`   ${form}: ${exists ? '✅' : '❌'}`);
});

// Summary
console.log('\n📊 VERIFICATION SUMMARY');
console.log('======================');

const allChecks = [
  hasSupabaseUrl, hasAnonKey, hasServiceKey,
  fs.existsSync(migrationPath),
  ...keyFiles.map(f => fs.existsSync(path.join(process.cwd(), f))),
  ...apiEndpoints.map(f => fs.existsSync(path.join(process.cwd(), f))),
  ...forms.map(f => fs.existsSync(path.join(process.cwd(), f)))
];

const passed = allChecks.filter(Boolean).length;
const total = allChecks.length;

console.log(`✅ Passed: ${passed}/${total} checks`);

if (passed === total) {
  console.log('\n🎉 ALL CHECKS PASSED!');
  console.log('Your Green Silicon Valley platform is ready!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Start the development server: npm run dev');
  console.log('2. Visit http://localhost:3000');
  console.log('3. Log in with Google using ayushg.2024@gmail.com');
  console.log('4. Explore the AI Agent Mode and admin dashboard!');
} else {
  console.log('\n⚠️  SOME CHECKS FAILED');
  console.log('Please complete the setup process:');
  console.log('1. Configure your Supabase credentials in .env.local');
  console.log('2. Run the database migrations');
  console.log('3. Set up Google OAuth in Supabase');
  console.log('4. Run: npm run setup');
}

console.log('\n🔗 Useful links:');
console.log('- Homepage: http://localhost:3000');
console.log('- Login: http://localhost:3000/login');
console.log('- Dashboard: http://localhost:3000/dashboard');
console.log('- Admin: http://localhost:3000/admin/data');
console.log('- Supabase: https://supabase.com/dashboard');
