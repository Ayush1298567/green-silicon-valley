import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rwcxtfwrkjmpltkwextr.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseServiceKey) {
  console.error("SUPABASE_SERVICE_ROLE_KEY is required");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setFounders() {
  const founderEmails = [
    "devshah2k09@gmail.com",
    "siddpokuri@gmail.com",
    "ayushg.2024@gmail.com",
    "abhiramtenneti2009@gmail.com",
    "sa.sc.2018@gmail.com"
  ];

  console.log("Setting up founder users...\n");

  for (const email of founderEmails) {
    console.log(`Setting ${email} as founder...`);

    try {
      // First, try to find the user by email
      const { data: existingUsers, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("email", email);

      if (fetchError) {
        console.error(`❌ Error fetching user ${email}:`, fetchError.message);
        continue;
      }

      if (existingUsers && existingUsers.length > 0) {
        // User exists, update their role
        const userId = existingUsers[0].id;
        const { error: updateError } = await supabase
          .from("users")
          .update({ role: "founder", status: "active" })
          .eq("id", userId);

        if (updateError) {
          console.error(`❌ Error updating ${email} to founder role:`, updateError.message);
        } else {
          console.log(`✅ Successfully updated ${email} to founder role!`);
          console.log(`   User ID: ${userId}`);
        }
      } else {
        console.log(`⚠️  User ${email} not found in database.`);
        console.log(`   They need to sign in at least once first, then run this script again.`);

        // Optionally create the user if they don't exist
        const { error: createError } = await supabase
          .from("users")
          .insert({
            email: email,
            name: email.split('@')[0].replace(/[0-9]/g, ''), // Basic name from email
            role: "founder",
            status: "active"
          });

        if (createError) {
          console.log(`   Could not create user: ${createError.message}`);
        } else {
          console.log(`✅ Created new founder user: ${email}`);
        }
      }

      console.log(""); // Empty line for spacing

    } catch (error: any) {
      console.error(`❌ Error processing ${email}:`, error.message);
    }
  }

  console.log("Founder setup complete!");
}

setFounders();

