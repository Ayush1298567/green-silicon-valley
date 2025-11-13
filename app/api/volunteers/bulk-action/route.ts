import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { getUserRoleServer } from "@/lib/auth/guards";

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const role = await getUserRoleServer(supabase as any);
  
  if (role !== "founder") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { action, volunteer_ids, data } = body;

  if (!action || !volunteer_ids || !Array.isArray(volunteer_ids) || volunteer_ids.length === 0) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  let result: any = {};

  switch (action) {
    case "update_status":
      if (!data?.status) {
        return NextResponse.json({ ok: false, error: "Status required" }, { status: 400 });
      }
      const { error: statusError } = await supabase
        .from("volunteers")
        .update({ status: data.status })
        .in("id", volunteer_ids);
      
      if (statusError) {
        return NextResponse.json({ ok: false, error: statusError.message }, { status: 500 });
      }
      result = { updated: volunteer_ids.length };
      break;

    case "assign_chapter":
      if (!data?.chapter_id) {
        return NextResponse.json({ ok: false, error: "Chapter ID required" }, { status: 400 });
      }
      const { error: chapterError } = await supabase
        .from("volunteers")
        .update({ chapter_id: data.chapter_id })
        .in("id", volunteer_ids);
      
      if (chapterError) {
        return NextResponse.json({ ok: false, error: chapterError.message }, { status: 500 });
      }
      result = { updated: volunteer_ids.length };
      break;

    case "award_badge":
      if (!data?.badge_id) {
        return NextResponse.json({ ok: false, error: "Badge ID required" }, { status: 400 });
      }
      const badgeInserts = volunteer_ids.map((vid: number) => ({
        volunteer_id: vid,
        badge_id: data.badge_id
      }));
      
      const { error: badgeError } = await supabase
        .from("volunteer_badges")
        .upsert(badgeInserts, { onConflict: "volunteer_id,badge_id" });
      
      if (badgeError) {
        return NextResponse.json({ ok: false, error: badgeError.message }, { status: 500 });
      }
      result = { awarded: volunteer_ids.length };
      break;

    default:
      return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
  }

  return NextResponse.json({ ok: true, result });
}

