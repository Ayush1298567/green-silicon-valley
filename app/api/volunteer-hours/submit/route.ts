import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { getUserTeamId } from "@/lib/volunteers/team-helpers";

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  
  // Find user's team
  const teamId = await getUserTeamId(session.user.id, supabase);
  if (!teamId) {
    return NextResponse.json({ ok: false, error: "Not part of a team" }, { status: 403 });
  }
  
  const body = await req.json().catch(() => ({}));
  const presentation_id = Number(body?.presentation_id ?? 0);
  const hours = Number(body?.hours ?? 0);
  const feedback = String(body?.feedback ?? "");
  if (!presentation_id || hours <= 0) {
    return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });
  }
  
  const { error } = await supabase.from("volunteer_hours").insert({
    presentation_id,
    volunteer_id: teamId, // Use team ID, not user ID
    submitted_by: session.user.id,
    hours_logged: hours,
    feedback,
    status: "pending"
  });
  
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  
      await supabase.from("system_logs").insert({
        event_type: "hours_submitted",
        description: JSON.stringify({ by: session.user.id, team_id: teamId, presentation_id, hours })
      });

      // Create notifications for founders
      const { data: founders } = await supabase
        .from("users")
        .select("id")
        .eq("role", "founder");

      if (founders && founders.length > 0) {
        const { data: presentation } = await supabase
          .from("presentations")
          .select("topic, scheduled_date")
          .eq("id", presentation_id)
          .single();

        const notifications = founders.map(founder => ({
          user_id: founder.id,
          notification_type: "hours_submitted",
          title: "New Hours Submitted",
          message: `Team submitted ${hours} hour${hours !== 1 ? "s" : ""} for presentation${presentation?.topic ? `: ${presentation.topic}` : ""}`,
          action_url: `/dashboard/founder/hours/pending`,
          related_id: teamId,
          related_type: "volunteer"
        }));

        await supabase.from("notifications").insert(notifications);
      }
      
      return NextResponse.json({ ok: true });
}


