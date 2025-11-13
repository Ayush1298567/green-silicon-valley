// Quick script to add ayushg.2024@gmail.com as a founder
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rwcxtfwrkjmpltkwextr.supabase.co';
// Note: For production, use SUPABASE_SERVICE_ROLE_KEY to bypass RLS
// For now, this will only work if the user is authenticated and has permissions
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3Y3h0Zndya2ptcGx0a3dleHRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2NTQ4NzksImV4cCI6MjA3ODIzMDg3OX0.PDcM1DXEaePZ588ScZxbsuXlKz2jifv_EdtpCZEoEIM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addFounders() {
  const founders = [
    { email: 'devshah2k09@gmail.com', name: 'Dev Shah' },
    { email: 'siddpokuri@gmail.com', name: 'Siddharth Pokuri' },
    { email: 'ayushg.2024@gmail.com', name: 'Ayush Gupta' },
    { email: 'abhiramtenneti2009@gmail.com', name: 'Abhiram Tenneti' },
    { email: 'sa.sc.2018@gmail.com', name: 'SA SC' }
  ];

  console.log('Setting up founder users...\n');

  for (const founder of founders) {
    try {
      console.log(`Processing ${founder.email}...`);

      // First check if user exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', founder.email)
        .single();

      if (existingUser) {
        // Update existing user to founder
        const { error } = await supabase
          .from('users')
          .update({ role: 'founder', status: 'active' })
          .eq('email', founder.email);

        if (error) {
          console.error(`❌ Error updating ${founder.email}:`, error.message);
        } else {
          console.log(`✅ Updated ${founder.email} to founder role`);
        }
      } else {
        // Create new user as founder
        const { error } = await supabase
          .from('users')
          .insert({
            email: founder.email,
            name: founder.name,
            role: 'founder',
            status: 'active'
          });

        if (error) {
          console.error(`❌ Error creating ${founder.email}:`, error.message);
        } else {
          console.log(`✅ Created ${founder.email} as founder`);
        }
      }
    } catch (error) {
      console.error(`❌ Error processing ${founder.email}:`, error.message);
    }
  }

  console.log('\nFounder setup complete!');
}

addFounders();
