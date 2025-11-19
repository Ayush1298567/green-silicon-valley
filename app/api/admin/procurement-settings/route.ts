import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { getUserRoleServer } from "@/lib/auth/guards";

interface ProcurementSettings {
  id?: string;
  procurement_enabled: boolean;
  max_budget_per_group: number;
  volunteer_self_fund_allowed: boolean;
  kit_recommendations_enabled: boolean;
  kit_inventory_link?: string;
  procurement_instructions: string;
  require_budget_justification: boolean;
  notify_on_request: boolean;
  notify_on_approval: boolean;
}

// GET /api/admin/procurement-settings
export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const role = await getUserRoleServer(supabase as any);

    if (role !== "founder") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("procurement_settings")
      .select("*")
      .single();

    if (error && error.code !== "PGRST116") { // PGRST116 = no rows returned
      throw error;
    }

    return NextResponse.json({
      ok: true,
      settings: data || null
    });
  } catch (error: any) {
    console.error("Error fetching procurement settings:", error);
    return NextResponse.json({
      ok: false,
      error: error.message
    }, { status: 500 });
  }
}

// POST /api/admin/procurement-settings
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const role = await getUserRoleServer(supabase as any);

    if (role !== "founder") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const settings: ProcurementSettings = await request.json();

    // Validate required fields
    if (typeof settings.procurement_enabled !== "boolean" ||
        typeof settings.max_budget_per_group !== "number" ||
        typeof settings.volunteer_self_fund_allowed !== "boolean" ||
        typeof settings.kit_recommendations_enabled !== "boolean" ||
        typeof settings.require_budget_justification !== "boolean" ||
        typeof settings.notify_on_request !== "boolean" ||
        typeof settings.notify_on_approval !== "boolean") {
      return NextResponse.json({
        ok: false,
        error: "Invalid settings data"
      }, { status: 400 });
    }

    // Validate budget limits
    if (settings.max_budget_per_group <= 0 || settings.max_budget_per_group > 100) {
      return NextResponse.json({
        ok: false,
        error: "Budget per group must be between $1 and $100"
      }, { status: 400 });
    }

    // Update or insert settings
    const { data, error } = await supabase
      .from("procurement_settings")
      .upsert({
        procurement_enabled: settings.procurement_enabled,
        max_budget_per_group: settings.max_budget_per_group,
        volunteer_self_fund_allowed: settings.volunteer_self_fund_allowed,
        kit_recommendations_enabled: settings.kit_recommendations_enabled,
        kit_inventory_link: settings.kit_inventory_link || null,
        procurement_instructions: settings.procurement_instructions || "Please specify exactly what materials you need for your presentation.",
        require_budget_justification: settings.require_budget_justification,
        notify_on_request: settings.notify_on_request,
        notify_on_approval: settings.notify_on_approval,
        updated_by: session.user.id
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      ok: true,
      settings: data,
      message: "Procurement settings updated successfully"
    });
  } catch (error: any) {
    console.error("Error updating procurement settings:", error);
    return NextResponse.json({
      ok: false,
      error: error.message
    }, { status: 500 });
  }
}
