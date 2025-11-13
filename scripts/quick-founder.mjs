import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://rwcxtfwrkjmpltkwextr.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3Y3h0Zndya2ptcGx0a3dleHRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2NTQ4NzksImV4cCI6MjA3ODIzMDg3OX0.PDcM1DXEaePZ588ScZxbsuXlKz2jifv_EdtpCZEoEIM";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setFounder() {
  const email = "ayushg.2024@gmail.com";
  
  console.log(`\n🔍 Looking for user: ${email}...`);
  
  try {
    // Find user by email
    const { data: users, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email);

    if (fetchError) {
      console.error("❌ Error fetching user:", fetchError.message);
      return;
    }

    if (!users || users.length === 0) {
      console.log("⚠️  User not found in database.");
      console.log("📝 Creating user as founder...");
      
      // Create user directly
      const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert({
          id: crypto.randomUUID(),
          email: email,
          name: "Ayush (Founder)",
          role: "founder"
        })
        .select()
        .single();

      if (insertError) {
        console.error("❌ Error creating user:", insertError.message);
        console.log("\n💡 You need to sign in first at http://localhost:3000/login");
        console.log("   Then run this script again.");
      } else {
        console.log("✅ Successfully created user as founder!");
        console.log(`   User ID: ${newUser.id}`);
        console.log("\n🎉 You can now log in and access founder features!");
      }
    } else {
      console.log("✅ User found!");
      console.log(`   Current role: ${users[0].role}`);
      
      if (users[0].role === "founder") {
        console.log("✅ Already a founder! No changes needed.");
      } else {
        console.log("📝 Updating role to founder...");
        
        const { error: updateError } = await supabase
          .from("users")
          .update({ role: "founder" })
          .eq("email", email);

        if (updateError) {
          console.error("❌ Error updating role:", updateError.message);
        } else {
          console.log("✅ Successfully updated to founder!");
          console.log("\n🎉 Log out and log back in to see founder features!");
        }
      }
    }
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
  }
}

setFounder();

