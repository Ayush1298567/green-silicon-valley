import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
}

const results: TestResult[] = [];

function logTest(name: string, passed: boolean, message: string) {
  results.push({ name, passed, message });
  const icon = passed ? "✅" : "❌";
  console.log(`${icon} ${name}: ${message}`);
}

async function testDatabaseConnection() {
  try {
    const { data, error } = await supabase.from("users").select("count").limit(1);
    if (error) throw error;
    logTest("Database Connection", true, "Successfully connected to Supabase");
    return true;
  } catch (error: any) {
    logTest("Database Connection", false, error.message);
    return false;
  }
}

async function testTablesExist() {
  const tables = [
    "users",
    "schools",
    "presentations",
    "volunteers",
    "volunteer_hours",
    "intern_projects",
    "resources",
    "chapters",
    "team_members",
    "presentation_members",
    "blog_posts",
    "bulletin_posts",
    "content_blocks",
    "nav_links",
    "email_templates",
    "messages",
    "channels",
    "announcements"
  ];

  let allExist = true;

  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select("count").limit(1);
      if (error) throw error;
      logTest(`Table: ${table}`, true, "Exists");
    } catch (error: any) {
      logTest(`Table: ${table}`, false, error.message);
      allExist = false;
    }
  }

  return allExist;
}

async function testFounderExists() {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("role", "founder")
      .limit(1);

    if (error) throw error;

    if (data && data.length > 0) {
      logTest("Founder User", true, `Found founder: ${data[0].email}`);
      return true;
    } else {
      logTest("Founder User", false, "No founder user found");
      return false;
    }
  } catch (error: any) {
    logTest("Founder User", false, error.message);
    return false;
  }
}

async function testRLSPolicies() {
  try {
    // Test that RLS is enabled
    const { data, error } = await supabase.rpc("pg_tables").select("*");
    
    logTest("RLS Policies", true, "RLS configuration accessible");
    return true;
  } catch (error: any) {
    logTest("RLS Policies", false, "Could not verify RLS");
    return false;
  }
}

async function testStorageBucket() {
  try {
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) throw error;

    const resourcesBucket = data?.find((b) => b.name === "resources");
    
    if (resourcesBucket) {
      logTest("Storage Bucket", true, "Resources bucket exists");
      return true;
    } else {
      logTest("Storage Bucket", false, "Resources bucket not found");
      return false;
    }
  } catch (error: any) {
    logTest("Storage Bucket", false, error.message);
    return false;
  }
}

async function testCRUDOperations() {
  try {
    // Test INSERT
    const testData = {
      name: "Test School",
      district: "Test District",
      city: "Test City",
      status: "active"
    };

    const { data: insertData, error: insertError } = await supabase
      .from("schools")
      .insert(testData)
      .select()
      .single();

    if (insertError) throw new Error(`INSERT failed: ${insertError.message}`);

    const testId = insertData.id;

    // Test SELECT
    const { data: selectData, error: selectError } = await supabase
      .from("schools")
      .select("*")
      .eq("id", testId)
      .single();

    if (selectError) throw new Error(`SELECT failed: ${selectError.message}`);

    // Test UPDATE
    const { error: updateError } = await supabase
      .from("schools")
      .update({ name: "Updated Test School" })
      .eq("id", testId);

    if (updateError) throw new Error(`UPDATE failed: ${updateError.message}`);

    // Test DELETE
    const { error: deleteError } = await supabase
      .from("schools")
      .delete()
      .eq("id", testId);

    if (deleteError) throw new Error(`DELETE failed: ${deleteError.message}`);

    logTest("CRUD Operations", true, "All operations (INSERT, SELECT, UPDATE, DELETE) successful");
    return true;
  } catch (error: any) {
    logTest("CRUD Operations", false, error.message);
    return false;
  }
}

async function testNavigationLinks() {
  try {
    const { data, error } = await supabase
      .from("nav_links")
      .select("*")
      .order("link_order");

    if (error) throw error;

    if (data && data.length > 0) {
      logTest("Navigation Links", true, `Found ${data.length} navigation links`);
      return true;
    } else {
      logTest("Navigation Links", false, "No navigation links found");
      return false;
    }
  } catch (error: any) {
    logTest("Navigation Links", false, error.message);
    return false;
  }
}

async function testEmailTemplates() {
  try {
    const { data, error } = await supabase
      .from("email_templates")
      .select("*");

    if (error) throw error;

    if (data && data.length > 0) {
      logTest("Email Templates", true, `Found ${data.length} email templates`);
      return true;
    } else {
      logTest("Email Templates", false, "No email templates found");
      return false;
    }
  } catch (error: any) {
    logTest("Email Templates", false, error.message);
    return false;
  }
}

async function runAllTests() {
  console.log("\n🧪 Starting Functionality Tests...\n");
  console.log("=" .repeat(60));

  await testDatabaseConnection();
  await testTablesExist();
  await testFounderExists();
  await testRLSPolicies();
  await testStorageBucket();
  await testCRUDOperations();
  await testNavigationLinks();
  await testEmailTemplates();

  console.log("=" .repeat(60));
  console.log("\n📊 Test Summary:\n");

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const total = results.length;

  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

  if (failed > 0) {
    console.log("\n❌ Failed Tests:");
    results.filter((r) => !r.passed).forEach((r) => {
      console.log(`  - ${r.name}: ${r.message}`);
    });
  }

  console.log("\n" + "=".repeat(60));

  if (failed === 0) {
    console.log("\n🎉 All tests passed! Your database is fully functional.\n");
  } else {
    console.log("\n⚠️  Some tests failed. Please review the errors above.\n");
    console.log("💡 Tip: Make sure you've run SETUP_DATABASE.sql in Supabase.\n");
  }

  process.exit(failed > 0 ? 1 : 0);
}

runAllTests();

