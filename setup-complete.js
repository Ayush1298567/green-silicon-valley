#!/usr/bin/env node

/**
 * GREEN SILICON VALLEY - COMPLETE SETUP SCRIPT
 * This script handles the entire setup process automatically
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🌱 GREEN SILICON VALLEY - COMPLETE SETUP');
console.log('=====================================\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.error('❌ Error: Please run this script from the project root directory');
  process.exit(1);
}

console.log('📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully\n');
} catch (error) {
  console.error('❌ Failed to install dependencies');
  process.exit(1);
}

// Check for .env.local file
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env.local file...');

  const envTemplate = `# ============================================================================
# GREEN SILICON VALLEY - ENVIRONMENT CONFIGURATION
# ============================================================================
# IMPORTANT: Replace these values with your actual Supabase credentials
# Get them from: https://supabase.com/dashboard/project/[your-project]/settings/api

# REQUIRED: Supabase Configuration (REPLACE THESE VALUES)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# OPTIONAL: AI Configuration (for enhanced features)
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b

# SYSTEM CONFIGURATION
NEXTAUTH_SECRET=${generateRandomSecret()}
AUTOMATION_TIMES=03:30,20:00
CRON_SECRET=${generateRandomSecret()}

# ============================================================================
# NEXT STEPS:
# ============================================================================
# 1. Create a Supabase project at https://supabase.com
# 2. Copy your project URL and API keys above
# 3. Run: node setup-complete.js
# 4. Configure Google OAuth in Supabase Auth settings
# 5. Start with: npm run dev
# ============================================================================
`;

  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ Created .env.local file');
  console.log('⚠️  IMPORTANT: Edit .env.local and add your Supabase credentials!\n');
}

// Check if Supabase credentials are configured
console.log('🔍 Checking Supabase configuration...');
const envContent = fs.readFileSync(envPath, 'utf8');
const hasSupabaseUrl = envContent.includes('supabase.co') && !envContent.includes('your-project-ref');
const hasAnonKey = envContent.includes('your-anon-key-here') === false;
const hasServiceKey = envContent.includes('your-service-role-key-here') === false;

if (!hasSupabaseUrl || !hasAnonKey || !hasServiceKey) {
  console.log('❌ Supabase credentials not configured');
  console.log('Please edit .env.local and add your Supabase credentials\n');
  console.log('Need help? Follow these steps:');
  console.log('1. Go to https://supabase.com');
  console.log('2. Create a new project');
  console.log('3. Go to Settings > API');
  console.log('4. Copy the Project URL and anon/service_role keys');
  console.log('5. Paste them into .env.local\n');
  process.exit(1);
}

console.log('✅ Supabase credentials configured');

// Run database migration
console.log('\n🗄️  Setting up database...');
try {
  console.log('Running database migrations...');
  execSync('npm run db:migrate', { stdio: 'inherit' });
  console.log('✅ Database migrations completed');
} catch (error) {
  console.error('❌ Database migration failed');
  console.error('Make sure your Supabase credentials are correct');
  process.exit(1);
}

// Seed initial data
console.log('\n🌱 Seeding initial data...');
try {
  execSync('npm run db:init', { stdio: 'inherit' });
  console.log('✅ Initial data seeded');
} catch (error) {
  console.error('❌ Data seeding failed');
  process.exit(1);
}

// Set up founder user
console.log('\n👑 Setting up founder user...');
try {
  execSync('npm run set-founder', { stdio: 'inherit' });
  console.log('✅ Founder user configured');
} catch (error) {
  console.error('❌ Founder setup failed');
  process.exit(1);
}

// Create sample content
console.log('\n📝 Creating sample content...');
try {
  execSync('npm run create-content', { stdio: 'inherit' });
  console.log('✅ Sample content created');
} catch (error) {
  console.error('❌ Sample content creation failed');
  process.exit(1);
}

console.log('\n🎉 SETUP COMPLETE!');
console.log('================');
console.log('Your Green Silicon Valley platform is ready!');
console.log('');
console.log('Next steps:');
console.log('1. Configure Google OAuth in your Supabase project:');
console.log('   - Go to Authentication > Providers');
console.log('   - Enable Google provider');
console.log('   - Add redirect URL: http://localhost:3000/auth/callback');
console.log('');
console.log('2. Start the development server:');
console.log('   npm run dev');
console.log('');
console.log('3. Log in with Google using: ayushg.2024@gmail.com');
console.log('');
console.log('4. Access your founder dashboard and explore the AI Agent Mode!');
console.log('');
console.log('🚀 Happy coding! 🌱');

function generateRandomSecret() {
  return require('crypto').randomBytes(32).toString('hex');
}

function createSampleContent() {
  // This would create sample blog posts, testimonials, etc.
  console.log('Creating sample blog posts and content...');

  // For now, just log that we're creating content
  // In a real implementation, this would insert sample data
  console.log('✅ Sample content created');
}
