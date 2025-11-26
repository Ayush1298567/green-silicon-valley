#!/usr/bin/env ts-node

/**
 * Action Items Automation Script
 *
 * This script handles various automated tasks for the action items system:
 * - Creating deadline reminders
 * - Following up on overdue items
 * - Cleaning up old completed items
 * - Generating weekly summaries
 *
 * Run with: npm run ts-node scripts/automate-action-items.ts
 * Or schedule with cron: 0 * * * * ts-node scripts/automate-action-items.ts
 */

import { createClient } from '@supabase/supabase-js';
import { actionItemsService } from '../lib/actionItemsService';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runAutomation() {
  console.log('🚀 Starting Action Items Automation...', new Date().toISOString());

  try {
    // 1. Create deadline reminders
    console.log('📅 Creating deadline reminders...');
    await actionItemsService.createDeadlineReminders();

    // 2. Follow up on overdue items
    console.log('⚠️  Following up on overdue items...');
    await followUpOverdueItems();

    // 3. Clean up old completed items
    console.log('🧹 Cleaning up old completed items...');
    await cleanupOldItems();

    // 4. Generate weekly summaries (run only on Mondays)
    const today = new Date().getDay();
    if (today === 1) { // Monday
      console.log('📊 Generating weekly summaries...');
      await generateWeeklySummaries();
    }

    console.log('✅ Action Items Automation completed successfully');

  } catch (error) {
    console.error('❌ Error in action items automation:', error);
    process.exit(1);
  }
}

async function followUpOverdueItems() {
  // Find items that are overdue by more than 24 hours
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const { data: overdueItems } = await supabase
    .from('action_items')
    .select('*')
    .eq('status', 'pending')
    .lt('due_date', yesterday.toISOString())
    .limit(50);

  for (const item of overdueItems || []) {
    // Check if we've already sent a follow-up
    const { data: existingFollowup } = await supabase
      .from('action_items')
      .select('id')
      .eq('related_entity_type', 'action_item')
      .eq('related_entity_id', item.id)
      .eq('type', 'reminder')
      .eq('metadata->>reminder_type', 'overdue_followup')
      .single();

    if (!existingFollowup) {
      await actionItemsService.createFromEvent(
        `OVERDUE: ${item.title}`,
        `This action item is now overdue and requires immediate attention.`,
        'reminder',
        'urgent',
        item.assigned_to,
        undefined, // Due immediately
        {
          original_item_id: item.id,
          reminder_type: 'overdue_followup',
          overdue_days: Math.floor((Date.now() - new Date(item.due_date).getTime()) / (1000 * 60 * 60 * 24))
        },
        'action_item',
        item.id
      );
    }
  }
}

async function cleanupOldItems() {
  // Archive completed items older than 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const { data: oldItems } = await supabase
    .from('action_items')
    .select('id')
    .eq('status', 'completed')
    .lt('completed_at', thirtyDaysAgo.toISOString())
    .limit(100);

  if (oldItems && oldItems.length > 0) {
    // Instead of deleting, we could archive them or move to a separate table
    // For now, we'll just mark them as archived in metadata
    await supabase
      .from('action_items')
      .update({
        metadata: supabase.sql`metadata || ${JSON.stringify({ archived: true, archived_at: new Date().toISOString() })}`
      })
      .in('id', oldItems.map(item => item.id));

    console.log(`📦 Archived ${oldItems.length} old completed items`);
  }
}

async function generateWeeklySummaries() {
  // Get stats for the past week
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Count new items created this week
  const { count: newItemsCount } = await supabase
    .from('action_items')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', oneWeekAgo.toISOString());

  // Count completed items this week
  const { count: completedCount } = await supabase
    .from('action_items')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'completed')
    .gte('completed_at', oneWeekAgo.toISOString());

  // Count overdue items
  const { count: overdueCount } = await supabase
    .from('action_items')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')
    .lt('due_date', new Date().toISOString());

  // Create summary action item for founders
  const { data: founders } = await supabase
    .from('users')
    .select('id')
    .eq('role', 'founder');

  if (founders && founders.length > 0) {
    await actionItemsService.createFromEvent(
      'Weekly Action Items Summary',
      `This week: ${newItemsCount} new items created, ${completedCount} completed, ${overdueCount} currently overdue.`,
      'reminder',
      'medium',
      founders.map(f => f.id),
      undefined,
      {
        summary_type: 'weekly',
        new_items: newItemsCount,
        completed: completedCount,
        overdue: overdueCount,
        period: 'weekly'
      }
    );
  }
}

// Run the automation
runAutomation().then(() => {
  console.log('🎉 Automation script finished');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Automation script failed:', error);
  process.exit(1);
});
