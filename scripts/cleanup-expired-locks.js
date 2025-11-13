// Cleanup script for expired edit locks
// Run this periodically (e.g., via cron job) to clean up expired locks

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function cleanupExpiredLocks() {
  console.log('🧹 Starting cleanup of expired edit locks...');

  try {
    // Use the database function we created
    const { data, error } = await supabase.rpc('cleanup_expired_edit_locks');

    if (error) throw error;

    console.log(`✅ Cleaned up ${data || 0} expired edit locks`);

    // Also clean up old AI chat history (older than 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: deletedChats, error: chatError } = await supabase
      .from('ai_chat_history')
      .delete()
      .lt('created_at', thirtyDaysAgo.toISOString());

    if (chatError) {
      console.error('⚠️ Error cleaning up old chat history:', chatError.message);
    } else {
      console.log(`✅ Cleaned up ${deletedChats?.length || 0} old AI chat records`);
    }

    console.log('🎉 Cleanup completed successfully!');

  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
    process.exit(1);
  }
}

// Run the cleanup
cleanupExpiredLocks();
