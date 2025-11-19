import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { getUserRoleServer } from "@/lib/auth/guards";
import { validateMaterialRequest, sanitizeString } from "@/lib/validation";
import { withRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { APILogger, BusinessLogicLogger, extractRequestContext } from "@/lib/logger";
import { executeDatabaseQuery, databaseCircuitBreaker } from "@/lib/timeout";

interface MaterialItem {
  category: 'science_equipment' | 'presentation_materials' | 'activity_supplies';
  name: string;
  quantity: number;
  estimated_cost: number;
}

interface MaterialRequestData {
  presentationId: string;
  requestType: 'gsv_provided' | 'volunteer_funded' | 'kit_recommendation';
  items: MaterialItem[];
  deliveryPreference: 'school_address' | 'volunteer_address';
  neededByDate: string;
  budgetJustification?: string;
}

// POST /api/materials/request - Create new material request
async function postHandler(request: NextRequest) {
  const startTime = Date.now();

  try {
    const supabase = createRouteHandlerClient({ cookies });
    const role = await getUserRoleServer(supabase as any);

    const { data: { session } } = await supabase.auth.getSession();
    const context = extractRequestContext(request, session);

    APILogger.logRequest(request, context);

    if (role !== "volunteer") {
      return NextResponse.json({ error: "Only volunteers can create material requests" }, { status: 403 });
    }
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const requestData: MaterialRequestData = await request.json();

    // Comprehensive input validation
    const validation = validateMaterialRequest(requestData);
    if (!validation.isValid) {
      return NextResponse.json({
        ok: false,
        error: `Validation failed: ${validation.errors.join(', ')}`
      }, { status: 400 });
    }

    // Get procurement settings
    const { data: settings, error: settingsError } = await executeDatabaseQuery(
      () => databaseCircuitBreaker.execute(() =>
        supabase.from("procurement_settings").select("*").single()
      ),
      'Fetch procurement settings'
    );

    if (settingsError) {
      console.error("Error fetching procurement settings:", settingsError);
      return NextResponse.json({
        ok: false,
        error: "Unable to validate request against procurement settings"
      }, { status: 500 });
    }

    // Check if GSV procurement is enabled
    if (requestData.requestType === 'gsv_provided' && !settings.procurement_enabled) {
      return NextResponse.json({
        ok: false,
        error: "GSV material procurement is currently disabled. Please select 'Volunteer Funded' or 'Kit Recommendation'."
      }, { status: 400 });
    }

    // Check if volunteer self-funding is allowed
    if (requestData.requestType === 'volunteer_funded' && !settings.volunteer_self_fund_allowed) {
      return NextResponse.json({
        ok: false,
        error: "Volunteer self-funding is currently disabled. Please select 'GSV Provided' or 'Kit Recommendation'."
      }, { status: 400 });
    }

    // Calculate total estimated cost
    const estimatedCost = requestData.items.reduce((total, item) => total + (item.estimated_cost * item.quantity), 0);

    // Validate budget limit for GSV provided requests
    if (requestData.requestType === 'gsv_provided' && estimatedCost > settings.max_budget_per_group) {
      return NextResponse.json({
        ok: false,
        error: `Estimated cost $${estimatedCost.toFixed(2)} exceeds the maximum budget of $${settings.max_budget_per_group.toFixed(2)} per group.`
      }, { status: 400 });
    }

    // Check if budget justification is required
    if (settings.require_budget_justification &&
        (!requestData.budgetJustification || requestData.budgetJustification.trim().length < 10)) {
      return NextResponse.json({
        ok: false,
        error: "Budget justification is required and must be at least 10 characters long."
      }, { status: 400 });
    }

    // Get user's team ID
    const { data: teamMembers, error: teamError } = await supabase
      .from("team_members")
      .select("volunteer_team_id")
      .eq("user_id", session.user.id)
      .single();

    if (teamError) {
      console.error("Database error fetching team membership:", teamError);
      return NextResponse.json({
        ok: false,
        error: "Database error occurred"
      }, { status: 500 });
    }

    if (!teamMembers || !teamMembers.volunteer_team_id) {
      return NextResponse.json({
        ok: false,
        error: "You are not currently assigned to a volunteer team"
      }, { status: 400 });
    }

    // Verify presentation belongs to user's team
    const { data: presentation, error: presError } = await supabase
      .from("presentations")
      .select("id, volunteer_team_id")
      .eq("id", requestData.presentationId)
      .eq("volunteer_team_id", teamMembers.volunteer_team_id)
      .single();

    if (presError) {
      console.error("Database error fetching presentation:", presError);
      return NextResponse.json({
        ok: false,
        error: "Database error occurred"
      }, { status: 500 });
    }

    if (!presentation) {
      return NextResponse.json({
        ok: false,
        error: "Presentation not found or you don't have permission to request materials for it"
      }, { status: 400 });
    }

    // Create the material request
    const { data: materialRequest, error: insertError } = await supabase
      .from("material_requests")
      .insert({
        group_id: teamMembers.volunteer_team_id,
        presentation_id: requestData.presentationId,
        request_type: requestData.requestType,
        estimated_cost: estimatedCost,
        budget_justification: requestData.budgetJustification ? sanitizeString(requestData.budgetJustification) : null,
        items: requestData.items,
        delivery_preference: requestData.deliveryPreference,
        needed_by_date: requestData.neededByDate,
        status: 'submitted', // Auto-submit for volunteers
        created_by: session.user.id
      })
      .select(`
        *,
        presentation:presentations(title, scheduled_date),
        group:volunteers(team_name)
      `)
      .single();

    if (insertError) {
      console.error("Error creating material request:", insertError);
      throw insertError;
    }

    // Create notification for founders if enabled
    if (settings.notify_on_request) {
      await supabase
        .from("notifications")
        .insert({
          notification_type: "material_request",
          title: "New Material Request Submitted",
          message: `${materialRequest.group.team_name} has submitted a material request for $${estimatedCost.toFixed(2)} (${requestData.requestType.replace('_', ' ')})`,
          action_url: `/dashboard/founder/material-requests`,
          priority: estimatedCost > 15 ? "high" : "medium"
        });
    }

    // All requests require manual founder approval - no auto-approval

    BusinessLogicLogger.logMaterialRequest(materialRequest.id, 'submitted', {
      ...context,
      estimatedCost,
      requestType: requestData.requestType
    });

    const response = NextResponse.json({
      ok: true,
      request: materialRequest,
      message: "Material request submitted successfully and is pending founder approval."
    });

    APILogger.logResponse(request, response, Date.now() - startTime, context);

    return response;
  } catch (error: any) {
    const context = extractRequestContext(request);
    APILogger.logError(request, error, context);

    return NextResponse.json({
      ok: false,
      error: error.message
    }, { status: 500 });
  }
}

// GET /api/materials/request - Get material requests (filtered by permissions)
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const role = await getUserRoleServer(supabase as any);

    if (!role) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const requestType = searchParams.get("requestType");

    let query = supabase
      .from("material_requests")
      .select(`
        *,
        presentation:presentations(title, scheduled_date),
        group:volunteers(team_name),
        created_by_user:users(name, email),
        approved_by_user:users(name, email)
      `)
      .order("created_at", { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq("status", status);
    }
    if (requestType) {
      query = query.eq("request_type", requestType);
    }

    // Apply permission-based filtering
    if (role === "volunteer") {
      query = query.eq("created_by", session.user.id);
    } else if (role === "intern") {
      // Check if intern has permission to view material requests
      const { data: permissions, error: permError } = await supabase
        .from("intern_permissions")
        .select("permissions")
        .eq("intern_id", session.user.id)
        .single();

      if (permError || !(permissions?.permissions as any)?.material_requests_view) {
        return NextResponse.json({
          ok: false,
          error: "You don't have permission to view material requests"
        }, { status: 403 });
      }
      // Interns can see all requests if they have permission
    }
    // Founders can see all requests (no additional filtering needed)

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      ok: true,
      requests: data || []
    });
  } catch (error: any) {
    console.error("Error fetching material requests:", error);
    return NextResponse.json({
      ok: false,
      error: error.message
    }, { status: 500 });
  }
}

// Export with rate limiting
export const POST = withRateLimit(postHandler, RATE_LIMITS.MATERIAL_REQUEST);
