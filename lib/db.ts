import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function saveContactMessage(input: {
  name: string;
  email: string;
  message: string;
}) {
  const supabase = createRouteHandlerClient({ cookies });
  return supabase.from("system_logs").insert({
    event_type: "contact_message",
    description: JSON.stringify(input)
  });
}

export async function saveVolunteerSignup(input: {
  name: string;
  email: string;
}) {
  const supabase = createRouteHandlerClient({ cookies });
  return supabase.from("volunteers").insert({
    user_id: null,
    team_name: null,
    hours_total: 0,
    milestones: [],
    // Also create users row if desired; kept minimal here.
  } as any);
}

export async function saveInternApplication(input: {
  name: string;
  email: string;
  department: string;
}) {
  const supabase = createRouteHandlerClient({ cookies });
  return supabase.from("intern_projects").insert({
    department: input.department,
    task: `Application: ${input.name}`,
    due_date: null,
    status: "Planning",
    notes: `Applicant email: ${input.email}`
  });
}

export async function saveTeacherRequest(input: {
  school: string;
  teacher_name: string;
  email: string;
}) {
  const supabase = createRouteHandlerClient({ cookies });
  return supabase.from("schools").insert({
    name: input.school,
    district: null,
    teacher_name: input.teacher_name,
    email: input.email,
    address: null
  });
}


