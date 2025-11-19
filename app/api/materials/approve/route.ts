import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { getUserRoleServer } from "@/lib/auth/guards";
import { withRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

interface ApprovalData {
  requestId: string;
  action: 'approve' | 'reject';
  notes?: string;
  messageToGroup?: string;
}

// POST /api/materials/approve - Approve or reject material requests
async function postHandler(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const role = await getUserRoleServer(supabase as any);

    // Only founders and authorized interns can approve/reject
    if (role !== "founder" && role !== "intern") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const approvalData: ApprovalData = await request.json();

    if (!approvalData.requestId || !approvalData.action) {
      return NextResponse.json({
        ok: false,
        error: "Request ID and action are required"
      }, { status: 400 });
    }

    if (!['approve', 'reject'].includes(approvalData.action)) {
      return NextResponse.json({
        ok: false,
        error: "Action must be 'approve' or 'reject'"
      }, { status: 400 });
    }

    // Check intern permissions if user is an intern
    if (role === "intern") {
      const { data: permissions, error: permError } = await supabase
        .from("intern_permissions")
        .select("permissions")
        .eq("intern_id", session.user.id)
        .single();

      if (permError || !(permissions?.permissions as any)?.material_requests_approve) {
        return NextResponse.json({
          ok: false,
          error: "You don't have permission to approve material requests"
        }, { status: 403 });
      }
    }

    // Get the material request
    const { data: materialRequest, error: requestError } = await supabase
      .from("material_requests")
      .select(`
        *,
        presentation:presentations(title, scheduled_date),
        group:volunteers(team_name),
        created_by_user:users(name, email)
      `)
      .eq("id", approvalData.requestId)
      .single();

    if (requestError) {
      console.error("Database error fetching material request:", requestError);
      return NextResponse.json({
        ok: false,
        error: "Database error occurred"
      }, { status: 500 });
    }

    if (!materialRequest) {
      return NextResponse.json({
        ok: false,
        error: "Material request not found"
      }, { status: 404 });
    }

    // Check if request is in a valid state for approval/rejection
    if (!['submitted', 'approved'].includes(materialRequest.status)) {
      return NextResponse.json({
        ok: false,
        error: `Cannot ${approvalData.action} a request that is ${materialRequest.status}`
      }, { status: 400 });
    }

    // Get procurement settings for validation
    const { data: settings, error: settingsError } = await supabase
      .from("procurement_settings")
      .select("*")
      .single();

    if (settingsError) {
      console.error("Error fetching procurement settings:", settingsError);
      return NextResponse.json({
        ok: false,
        error: "Unable to validate approval against procurement settings"
      }, { status: 500 });
    }

    // Validate budget for GSV provided requests
    if (approvalData.action === 'approve' && materialRequest.request_type === 'gsv_provided') {
      if (materialRequest.estimated_cost > settings.max_budget_per_group) {
        return NextResponse.json({
          ok: false,
          error: `Cannot approve request exceeding budget limit of $${settings.max_budget_per_group.toFixed(2)}`
        }, { status: 400 });
      }
    }

    const newStatus = approvalData.action === 'approve' ? 'approved' : 'cancelled';
    const updateData: any = {
      status: newStatus,
      approved_by: session.user.id,
      approved_at: new Date().toISOString(),
      purchase_notes: approvalData.notes || null
    };

    if (approvalData.action === 'reject') {
      updateData.cancellation_reason = approvalData.notes || "Request rejected by approver";
    }

    // Update the material request
    const { data: updatedRequest, error: updateError } = await supabase
      .from("material_requests")
      .update(updateData)
      .eq("id", approvalData.requestId)
      .select(`
        *,
        presentation:presentations(title, scheduled_date),
        group:volunteers(team_name),
        created_by_user:users(name, email),
        approved_by_user:users(name, email)
      `)
      .single();

    if (updateError) {
      throw updateError;
    }

    // Create notification for the volunteer
    if (settings.notify_on_approval) {
      const baseMessage = approvalData.action === 'approve'
        ? `Your material request for $${materialRequest.estimated_cost.toFixed(2)} has been approved. Procurement will begin shortly.`
        : `Your material request for $${materialRequest.estimated_cost.toFixed(2)} has been rejected. ${approvalData.notes || ''}`;

      const customMessage = approvalData.messageToGroup
        ? `\n\nMessage from Green Silicon Valley: ${approvalData.messageToGroup}`
        : '';

      const notificationData = {
        user_id: materialRequest.created_by,
        notification_type: approvalData.action === 'approve' ? "material_request_approved" : "material_request_rejected",
        title: approvalData.action === 'approve'
          ? "Material Request Approved"
          : "Material Request Rejected",
        message: baseMessage + customMessage,
        action_url: "/dashboard/volunteer/materials",
        priority: approvalData.action === 'approve' ? "medium" : "high"
      };

      await supabase
        .from("notifications")
        .insert(notificationData);
    }

    // Log approval/rejection in audit trail
    await supabase
      .from("system_logs")
      .insert({
        actor_id: session.user.id,
        action_type: approvalData.action === 'approve' ? 'material_request_approved' : 'material_request_rejected',
        resource_type: 'material_request',
        resource_id: approvalData.requestId,
        details: {
          request_type: materialRequest.request_type,
          estimated_cost: materialRequest.estimated_cost,
          group_name: materialRequest.group.team_name,
          presentation_title: materialRequest.presentation.title,
          notes: approvalData.notes
        },
        ip_address: request.headers.get('x-forwarded-for') || 'unknown'
      });

    return NextResponse.json({
      ok: true,
      request: updatedRequest,
      message: approvalData.action === 'approve'
        ? "Material request approved successfully"
        : "Material request rejected"
    });
  } catch (error: any) {
    console.error("Error processing material request approval:", error);
    return NextResponse.json({
      ok: false,
      error: error.message
    }, { status: 500 });
  }
}

// Export with rate limiting
export const POST = withRateLimit(postHandler, RATE_LIMITS.MATERIAL_APPROVE);
