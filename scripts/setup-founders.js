// Quick script to add all founder users using service role key
import { createClient } from '@supabase/supabase-js';

// Hardcoded for setup - replace with your actual values
const supabaseUrl = 'https://rwcxtfwrkjmpltkwextr.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY!');
  console.error('Please set SUPABASE_SERVICE_ROLE_KEY environment variable');
  console.error('You can find this in Supabase Dashboard > Settings > API > service_role secret');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupFounders() {
  const founders = [
    { email: 'devshah2k09@gmail.com', name: 'Dev Shah' },
    { email: 'siddpokuri@gmail.com', name: 'Siddharth Pokuri' },
    { email: 'ayushg.2024@gmail.com', name: 'Ayush Gupta' },
    { email: 'abhiramtenneti2009@gmail.com', name: 'Abhiram Tenneti' },
    { email: 'sa.sc.2018@gmail.com', name: 'SA SC' }
  ];

  console.log('🚀 Setting up founder users...\n');

  for (const founder of founders) {
    try {
      console.log(`Processing ${founder.email}...`);

      // First check if user exists
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('email', founder.email)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error(`❌ Error checking ${founder.email}:`, fetchError.message);
        continue;
      }

      if (existingUser) {
        // Update existing user to founder
        const { error: updateError } = await supabase
          .from('users')
          .update({
            role: 'founder',
            status: 'active',
            name: founder.name
          })
          .eq('email', founder.email);

        if (updateError) {
          console.error(`❌ Error updating ${founder.email}:`, updateError.message);
        } else {
          console.log(`✅ Updated ${founder.email} to founder role`);
        }
      } else {
        // Create new user as founder
        const { error: createError } = await supabase
          .from('users')
          .insert({
            email: founder.email,
            name: founder.name,
            role: 'founder',
            status: 'active'
          });

        if (createError) {
          console.error(`❌ Error creating ${founder.email}:`, createError.message);
        } else {
          console.log(`✅ Created ${founder.email} as founder`);
        }
      }
    } catch (error) {
      console.error(`❌ Unexpected error processing ${founder.email}:`, error.message);
    }
  }

  console.log('\n🎉 Founder setup complete!');
  console.log('All users can now sign in and access founder features.');
}

setupFounders().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
