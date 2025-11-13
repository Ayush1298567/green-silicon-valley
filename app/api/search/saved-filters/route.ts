import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { getUserRoleServer } from "@/lib/auth/guards";

// In a real implementation, this would be stored in a user preferences table
// For now, we'll use local storage simulation with database

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    // In a full implementation, this would fetch from a user_saved_filters table
    // For now, return some default useful filters
    const defaultFilters = [
      {
        id: "active_groups",
        name: "Active Groups",
        filters: { status: "active", type: "group" },
        isDefault: true
      },
      {
        id: "upcoming_presentations",
        name: "Upcoming Presentations",
        filters: { scheduledAfter: new Date().toISOString(), type: "presentation" },
        isDefault: true
      },
      {
        id: "stuck_groups",
        name: "Groups Needing Attention",
        filters: { status: "stuck", type: "group" },
        isDefault: true
      },
      {
        id: "high_schools",
        name: "High Schools",
        filters: { level: "high", type: "school" },
        isDefault: false
      }
    ];

    return NextResponse.json({ ok: true, filters: defaultFilters });
  } catch (error: any) {
    console.error("Error fetching saved filters:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const role = await getUserRoleServer(supabase as any);
  if (role !== "founder" && role !== "intern") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, filters } = body;

    if (!name || !filters) {
      return NextResponse.json({ ok: false, error: "Name and filters required" }, { status: 400 });
    }

    // In a real implementation, save to user_saved_filters table
    // For now, just acknowledge the request
    const filterId = `custom_${Date.now()}`;

    return NextResponse.json({
      ok: true,
      filter: {
        id: filterId,
        name,
        filters,
        isDefault: false,
        createdAt: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error("Error saving filter:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
