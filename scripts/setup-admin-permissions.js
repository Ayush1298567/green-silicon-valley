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
      const [key, value] = line.split('=');
      if (key === 'NEXT_PUBLIC_SUPABASE_URL') {
        supabaseUrl = value;
      } else if (key === 'SUPABASE_SERVICE_ROLE_KEY') {
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

async function setupAdminPermissions() {
  console.log('🔧 Setting up Green Silicon Valley Admin Permissions...\n');

  try {
    // 1. Set up default procurement settings ($25/group limit)
    console.log('📦 Configuring procurement settings...');
    const { data: procurementData, error: procurementError } = await supabase
      .from("procurement_settings")
      .upsert({
        procurement_enabled: false, // Founders must enable this
        max_budget_per_group: 25.00,
        volunteer_self_fund_allowed: true,
        kit_recommendations_enabled: true,
        procurement_instructions: 'Please specify exactly what materials you need for your presentation. Include quantities and any specific requirements. Budget limit: $25 per group.',
        require_budget_justification: true,
        notify_on_request: true,
        notify_on_approval: true
      })
      .select();

    if (procurementError) {
      console.error('❌ Error setting up procurement settings:', procurementError.message);
    } else {
      console.log('✅ Procurement settings configured');
      console.log('   • Budget limit: $25 per group');
      console.log('   • Manual approval required: All requests');
      console.log('   • Volunteer self-funding: Enabled');
      console.log('   • Kit recommendations: Enabled\n');
    }

    // 2. Set up AI alert settings (weekly + critical only)
    console.log('🤖 Configuring AI alert settings...');
    const { data: aiData, error: aiError } = await supabase
      .from("ai_alert_settings")
      .upsert({
        alert_frequency: 'weekly_critical',
        weekly_digest_day: 'sunday',
        weekly_digest_time: '18:00',
        critical_inactivity_days: 7,
        critical_deadline_hours: 48,
        critical_budget_overrun_percent: 10,
        critical_delivery_delay_hours: 24,
        email_alerts: true,
        in_app_alerts: true,
        sms_alerts: false
      })
      .select();

    if (aiError) {
      console.error('❌ Error setting up AI alerts:', aiError.message);
    } else {
      console.log('✅ AI alerts configured');
      console.log('   • Frequency: Weekly + Critical only');
      console.log('   • Weekly digest: Sunday at 6:00 PM');
      console.log('   • Critical triggers: 7+ days inactive, 48+ hours to deadline');
      console.log('   • Email alerts: Enabled');
      console.log('   • SMS alerts: Disabled\n');
    }

    // 3. Set up international settings (hidden by default)
    console.log('🌍 Configuring international settings...');
    const { data: internationalData, error: internationalError } = await supabase
      .from("international_settings")
      .upsert({
        international_enabled: false,
        coming_soon_message: 'International expansion coming Q3 2025. Sign up for updates!',
        supported_countries: [],
        language_options: ['en'],
        timezone_support: false,
        compliance_requirements: {
          gdpr_enabled: false,
          ccpa_enabled: false,
          pipeda_enabled: false
        },
        localized_content: {}
      })
      .select();

    if (internationalError) {
      console.error('❌ Error setting up international settings:', internationalError.message);
    } else {
      console.log('✅ International settings configured');
      console.log('   • Features: Hidden (Coming Soon)');
      console.log('   • Languages: English only');
      console.log('   • Compliance: None enabled');
      console.log('   • Countries: None configured\n');
    }

    // 4. Create default intern permission templates
    console.log('🔐 Creating intern permission templates...');

    // Get all users with intern role
    const { data: interns, error: internsError } = await supabase
      .from("users")
      .select("id, name, email")
      .eq("role", "intern");

    if (internsError) {
      console.error('❌ Error fetching interns:', internsError.message);
    } else if (interns && interns.length > 0) {
      console.log(`📋 Found ${interns.length} interns to configure permissions for:`);

      for (const intern of interns) {
        // Create default permissions (all disabled - founders must enable)
        const { error: permError } = await supabase
          .from("intern_permissions")
          .upsert({
            intern_id: intern.id,
            permissions: {
              // Dashboard Access
              dashboard_access: false,
              analytics_view: false,
              reports_export: false,

              // Volunteer Management
              applications_view: false,
              applications_approve: false,
              applications_reject: false,
              volunteer_profiles_edit: false,

              // Team Management
              teams_view_all: false,
              teams_assign_members: false,
              teams_edit_details: false,
              teams_progress_tracking: false,

              // Content Management
              website_content_edit: false,
              blog_posts_create: false,
              announcements_create: false,
              resources_upload: false,

              // Procurement Management
              procurement_settings_edit: false,
              material_requests_approve: false,
              material_requests_view: false,
              budget_reports_view: false,

              // Communication
              email_templates_edit: false,
              bulk_messaging_send: false,
              notifications_manage: false,

              // System Administration
              user_management_create: false,
              user_management_edit: false,
              system_settings_edit: false,
              audit_logs_view: false,

              // International Features
              international_settings_edit: false,
              multi_language_content_edit: false
            }
          });

        if (permError) {
          console.error(`❌ Error creating permissions for ${intern.name}:`, permError.message);
        } else {
          console.log(`   ✅ ${intern.name} (${intern.email}) - Permissions initialized`);
        }
      }
      console.log('');
    } else {
      console.log('ℹ️  No interns found. Permission templates will be created when interns are added.\n');
    }

    console.log('🎉 Admin permissions setup complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. Founders can now access /dashboard/founder/admin-settings');
    console.log('2. Configure procurement settings and enable funding options');
    console.log('3. Grant specific permissions to interns as needed');
    console.log('4. Set up kit inventory for volunteer recommendations');
    console.log('5. Enable international features when infrastructure is ready');

  } catch (error) {
    console.error('💥 Fatal error during setup:', error.message);
    process.exit(1);
  }
}

setupAdminPermissions();
