/* eslint-disable no-console */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false }
});

async function upsertUser(id: string, name: string, email: string, role: string) {
  await supabase.from("users").upsert({ id, name, email, role }, { onConflict: "id" });
}

async function main() {
  console.log("Seeding baseline data...");
  // Create a few deterministic UUIDs for demo users
  const founder = "00000000-0000-0000-0000-000000000001";
  const intern = "00000000-0000-0000-0000-000000000002";
  const volunteer = "00000000-0000-0000-0000-000000000003";
  const teacher = "00000000-0000-0000-0000-000000000004";

  await upsertUser(founder, "Founder One", "founder@example.com", "founder");
  await upsertUser(intern, "Intern One", "intern@example.com", "intern");
  await upsertUser(volunteer, "Volunteer One", "volunteer@example.com", "volunteer");
  await upsertUser(teacher, "Teacher One", "teacher@example.com", "teacher");

  await supabase.from("chapters").upsert(
    [
      { name: "San Jose", region: "California", leader_user_id: founder, volunteers_count: 18, status: "active" },
      { name: "Sunnyvale", region: "California", leader_user_id: intern, volunteers_count: 12, status: "active" }
    ],
    { onConflict: "name" }
  );

  const { data: schoolRows } = await supabase
    .from("schools")
    .insert([
      { name: "Maple Elementary", district: "Santa Clara USD", teacher_name: "Ms. Lee", email: "mlee@school.org" },
      { name: "Cedar Middle", district: "San Jose USD", teacher_name: "Mr. Chen", email: "mchen@school.org" }
    ])
    .select("id");

  await supabase.from("volunteers").upsert(
    [{ user_id: volunteer, team_name: "Team Green", hours_total: 0, milestones: [] }],
    { onConflict: "user_id" }
  );

  const mapleId = schoolRows?.[0]?.id ?? null;
  await supabase.from("presentations").insert([
    { school_id: mapleId, volunteer_team: "Team Green", topic: "Sustainability", date: new Date().toISOString(), status: "completed", hours: 1 }
  ]);

  console.log("Seed complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


