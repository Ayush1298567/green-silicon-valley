import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { getUserRoleServer } from "@/lib/auth/guards";

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const role = await getUserRoleServer(supabase as any);
  
  if (role !== "founder") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") || "csv";
  const volunteerIds = searchParams.get("ids")?.split(",").map(id => parseInt(id));

  // Build query
  let query = supabase
    .from("volunteers")
    .select(`
      *,
      user:users!volunteers_user_id_fkey(id, name, email, role)
    `);

  if (volunteerIds && volunteerIds.length > 0) {
    query = query.in("id", volunteerIds);
  }

  const { data: volunteers, error } = await query;

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  if (format === "csv") {
    // Generate CSV
    const headers = ["ID", "Name", "Email", "Status", "Total Hours", "Presentations", "Join Date", "Last Activity"];
    const rows = (volunteers || []).map((v: any) => [
      v.id,
      v.user?.name || "",
      v.user?.email || "",
      v.status || "pending",
      v.hours_total || 0,
      v.presentations_completed || 0,
      v.join_date || "",
      v.last_activity_date || ""
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row: any[]) => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="volunteers-${new Date().toISOString().split("T")[0]}.csv"`
      }
    });
  } else if (format === "json") {
    return NextResponse.json({ ok: true, volunteers });
  }

  return NextResponse.json({ ok: false, error: "Invalid format" }, { status: 400 });
}

