// Script to populate progress tracking data for existing volunteers
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
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
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function populateProgressData() {
  console.log('🚀 Populating progress tracking data...\n');

  try {
    // Get all volunteer teams
    const { data: volunteers, error: volunteersError } = await supabase
      .from('volunteers')
      .select('id, team_name, application_status, onboarding_step, presentation_status, group_channel_id, presentation_draft_url, slides_shared');

    if (volunteersError) {
      console.error('❌ Error fetching volunteers:', volunteersError);
      return;
    }

    console.log(`Found ${volunteers?.length || 0} volunteer teams`);

    for (const volunteer of volunteers || []) {
      console.log(`\nProcessing team: ${volunteer.team_name} (ID: ${volunteer.id})`);

      // Create group milestones based on current status
      const milestones = [];

      // Application milestone
      milestones.push({
        volunteer_team_id: volunteer.id,
        milestone_type: 'applied',
        milestone_name: 'Application Submitted',
        description: 'Initial volunteer application submitted',
        is_required: true,
        is_completed: volunteer.application_status === 'approved',
        progress_percentage: volunteer.application_status === 'approved' ? 100 : 0
      });

      // Group chat milestone
      milestones.push({
        volunteer_team_id: volunteer.id,
        milestone_type: 'group_chat_created',
        milestone_name: 'Group Chat Setup',
        description: 'Group communication channel established',
        is_required: true,
        is_completed: !!volunteer.group_channel_id,
        progress_percentage: volunteer.group_channel_id ? 100 : 0
      });

      // Topic selection milestone (inferred from onboarding step)
      milestones.push({
        volunteer_team_id: volunteer.id,
        milestone_type: 'topic_selected',
        milestone_name: 'Topic Selected',
        description: 'Presentation topic chosen and confirmed',
        is_required: true,
        is_completed: volunteer.onboarding_step !== 'activity_selected',
        progress_percentage: volunteer.onboarding_step !== 'activity_selected' ? 100 : 0
      });

      // Resources viewed milestone
      milestones.push({
        volunteer_team_id: volunteer.id,
        milestone_type: 'resources_viewed',
        milestone_name: 'Resources Reviewed',
        description: 'Presentation templates and guidelines reviewed',
        is_required: true,
        is_completed: volunteer.onboarding_step !== 'activity_selected' && volunteer.onboarding_step !== 'resources_viewed',
        progress_percentage: volunteer.onboarding_step !== 'activity_selected' && volunteer.onboarding_step !== 'resources_viewed' ? 100 : 0
      });

      // Presentation draft milestone
      milestones.push({
        volunteer_team_id: volunteer.id,
        milestone_type: 'presentation_draft_created',
        milestone_name: 'Presentation Draft Created',
        description: 'Google Slides presentation draft completed',
        is_required: true,
        is_completed: !!volunteer.presentation_draft_url,
        progress_percentage: volunteer.presentation_draft_url ? 100 : 0
      });

      // Presentation submitted milestone
      milestones.push({
        volunteer_team_id: volunteer.id,
        milestone_type: 'presentation_submitted',
        milestone_name: 'Submitted for Review',
        description: 'Presentation submitted to founders for review',
        is_required: true,
        is_completed: volunteer.presentation_status === 'submitted_for_review' || volunteer.presentation_status === 'in_review',
        progress_percentage: volunteer.presentation_status === 'submitted_for_review' || volunteer.presentation_status === 'in_review' ? 100 : 0
      });

      // Insert milestones
      const { error: milestonesError } = await supabase
        .from('group_milestones')
        .upsert(milestones, {
          onConflict: 'volunteer_team_id,milestone_type',
          ignoreDuplicates: false
        });

      if (milestonesError) {
        console.error(`❌ Error inserting milestones for team ${volunteer.id}:`, milestonesError);
      } else {
        console.log(`✅ Inserted ${milestones.length} milestones`);
      }

      // Create checklist items
      const checklistItems = [
        {
          volunteer_team_id: volunteer.id,
          item_name: "Submit Group Application",
          item_description: "Complete and submit the volunteer group application form",
          item_category: "application",
          is_required: true,
          is_completed: volunteer.application_status === 'approved',
          order_index: 1
        },
        {
          volunteer_team_id: volunteer.id,
          item_name: "Join Group Chat",
          item_description: "Join your team group chat for coordination",
          item_category: "onboarding",
          is_required: true,
          is_completed: !!volunteer.group_channel_id,
          order_index: 2
        },
        {
          volunteer_team_id: volunteer.id,
          item_name: "Choose Presentation Topic",
          item_description: "Select and confirm your environmental presentation topic",
          item_category: "onboarding",
          is_required: true,
          is_completed: volunteer.onboarding_step !== 'activity_selected',
          order_index: 3
        },
        {
          volunteer_team_id: volunteer.id,
          item_name: "Review Resources",
          item_description: "Review presentation templates and guidelines",
          item_category: "onboarding",
          is_required: true,
          is_completed: volunteer.onboarding_step !== 'activity_selected' && volunteer.onboarding_step !== 'resources_viewed',
          order_index: 4
        },
        {
          volunteer_team_id: volunteer.id,
          item_name: "Create Presentation Draft",
          item_description: "Build your Google Slides presentation draft",
          item_category: "preparation",
          is_required: true,
          is_completed: !!volunteer.presentation_draft_url,
          order_index: 5
        },
        {
          volunteer_team_id: volunteer.id,
          item_name: "Share with GSV",
          item_description: "Share your presentation with greensiliconvalley27@gmail.com",
          item_category: "preparation",
          is_required: true,
          is_completed: !!volunteer.slides_shared,
          order_index: 6
        },
        {
          volunteer_team_id: volunteer.id,
          item_name: "Submit for Review",
          item_description: "Submit your final presentation for founder review",
          item_category: "presentation",
          is_required: true,
          is_completed: volunteer.presentation_status === 'submitted_for_review' || volunteer.presentation_status === 'in_review',
          order_index: 7
        }
      ];

      // Add completion-based items
      const { data: presentations } = await supabase
        .from('presentations')
        .select('status')
        .eq('volunteer_team_id', volunteer.id)
        .eq('status', 'completed');

      const { data: hours } = await supabase
        .from('volunteer_hours')
        .select('id')
        .eq('volunteer_id', volunteer.id)
        .eq('status', 'approved');

      const { data: documents } = await supabase
        .from('volunteer_documents')
        .select('id')
        .eq('volunteer_id', volunteer.id)
        .in('status', ['approved', 'completed']);

      checklistItems.push(
        {
          volunteer_team_id: volunteer.id,
          item_name: "Complete Presentation",
          item_description: "Successfully deliver your environmental presentation",
          item_category: "followup",
          is_required: true,
          is_completed: presentations && presentations.length > 0,
          order_index: 8
        },
        {
          volunteer_team_id: volunteer.id,
          item_name: "Log Volunteer Hours",
          item_description: "Record and submit your volunteer hours",
          item_category: "followup",
          is_required: true,
          is_completed: hours && hours.length > 0,
          order_index: 9
        },
        {
          volunteer_team_id: volunteer.id,
          item_name: "Upload Documents",
          item_description: "Upload required forms signed by teachers and volunteers",
          item_category: "followup",
          is_required: true,
          is_completed: documents && documents.length > 0,
          order_index: 10
        }
      );

      const { error: checklistError } = await supabase
        .from('group_checklist_items')
        .upsert(checklistItems, {
          onConflict: 'volunteer_team_id,item_name',
          ignoreDuplicates: false
        });

      if (checklistError) {
        console.error(`❌ Error inserting checklist for team ${volunteer.id}:`, checklistError);
      } else {
        console.log(`✅ Inserted ${checklistItems.length} checklist items`);
      }

      // Calculate and store progress analytics
      const totalMilestones = milestones.length;
      const completedMilestones = milestones.filter(m => m.is_completed).length;
      const progressPercentage = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

      const { error: analyticsError } = await supabase
        .from('group_progress_analytics')
        .upsert({
          volunteer_team_id: volunteer.id,
          metric_type: 'completion_time_estimate',
          metric_value: progressPercentage,
          metric_data: {
            total_milestones: totalMilestones,
            completed_milestones: completedMilestones,
            progress_percentage: progressPercentage,
            last_updated: new Date().toISOString()
          }
        }, {
          onConflict: 'volunteer_team_id,metric_type'
        });

      if (analyticsError) {
        console.error(`❌ Error inserting analytics for team ${volunteer.id}:`, analyticsError);
      } else {
        console.log(`✅ Updated progress analytics (${progressPercentage}% complete)`);
      }
    }

    console.log('\n🎉 Progress data population complete!');
    console.log('All volunteer teams now have milestones, checklists, and progress tracking.');

  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

populateProgressData().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
