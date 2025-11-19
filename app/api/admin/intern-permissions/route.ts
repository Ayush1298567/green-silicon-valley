import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { getUserRoleServer } from "@/lib/auth/guards";

interface InternPermissions {
  dashboard_access: boolean;
  analytics_view: boolean;
  reports_export: boolean;
  applications_view: boolean;
  applications_approve: boolean;
  applications_reject: boolean;
  volunteer_profiles_edit: boolean;
  teams_view_all: boolean;
  teams_assign_members: boolean;
  teams_edit_details: boolean;
  teams_progress_tracking: boolean;
  website_content_edit: boolean;
  blog_posts_create: boolean;
  announcements_create: boolean;
  resources_upload: boolean;
  procurement_settings_edit: boolean;
  material_requests_approve: boolean;
  material_requests_view: boolean;
  budget_reports_view: boolean;
  email_templates_edit: boolean;
  bulk_messaging_send: boolean;
  notifications_manage: boolean;
  user_management_create: boolean;
  user_management_edit: boolean;
  system_settings_edit: boolean;
  audit_logs_view: boolean;
  international_settings_edit: boolean;
  multi_language_content_edit: boolean;
}

// GET /api/admin/intern-permissions
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const role = await getUserRoleServer(supabase as any);

    if (role !== "founder") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const internId = searchParams.get("internId");

    let query = supabase
      .from("intern_permissions")
      .select(`
        *,
        intern:users(id, name, email)
      `);

    if (internId) {
      query = query.eq("intern_id", internId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      ok: true,
      permissions: data || []
    });
  } catch (error: any) {
    console.error("Error fetching intern permissions:", error);
    return NextResponse.json({
      ok: false,
      error: error.message
    }, { status: 500 });
  }
}

// POST /api/admin/intern-permissions
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

    const { internId, permissions }: { internId: string; permissions: InternPermissions } = await request.json();

    if (!internId) {
      return NextResponse.json({
        ok: false,
        error: "Intern ID is required"
      }, { status: 400 });
    }

    // Verify intern exists and is actually an intern
    const { data: internUser, error: internError } = await supabase
      .from("users")
      .select("id, name, email, role")
      .eq("id", internId)
      .eq("role", "intern")
      .single();

    if (internError || !internUser) {
      return NextResponse.json({
        ok: false,
        error: "Invalid intern ID or user is not an intern"
      }, { status: 400 });
    }

    // Get existing permissions to log changes
    const { data: existingPermissions, error: existingError } = await supabase
      .from("intern_permissions")
      .select("permissions")
      .eq("intern_id", internId)
      .single();

    // Upsert permissions
    const { data, error } = await supabase
      .from("intern_permissions")
      .upsert({
        intern_id: internId,
        permissions: permissions,
        granted_by: session.user.id
      })
      .select(`
        *,
        intern:users(id, name, email)
      `)
      .single();

    if (error) {
      throw error;
    }

    // Log permission changes
    if (existingPermissions) {
      const oldPerms = existingPermissions.permissions as InternPermissions;
      for (const [key, newValue] of Object.entries(permissions)) {
        const oldValue = oldPerms[key as keyof InternPermissions];
        if (oldValue !== newValue) {
          await supabase.rpc('log_permission_change', {
            p_intern_id: internId,
            p_action: newValue ? 'granted' : 'revoked',
            p_permission_key: key,
            p_old_value: oldValue,
            p_new_value: newValue,
            p_changed_by: session.user.id
          });
        }
      }
    } else {
      // New permission set - log all granted permissions
      for (const [key, value] of Object.entries(permissions)) {
        if (value) {
          await supabase.rpc('log_permission_change', {
            p_intern_id: internId,
            p_action: 'granted',
            p_permission_key: key,
            p_old_value: false,
            p_new_value: true,
            p_changed_by: session.user.id
          });
        }
      }
    }

    return NextResponse.json({
      ok: true,
      permissions: data,
      message: "Intern permissions updated successfully"
    });
  } catch (error: any) {
    console.error("Error updating intern permissions:", error);
    return NextResponse.json({
      ok: false,
      error: error.message
    }, { status: 500 });
  }
}

// DELETE /api/admin/intern-permissions?internId=xxx
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const internId = searchParams.get("internId");

    if (!internId) {
      return NextResponse.json({
        ok: false,
        error: "Intern ID is required"
      }, { status: 400 });
    }

    // Get existing permissions before deletion for logging
    const { data: existingPermissions, error: existingError } = await supabase
      .from("intern_permissions")
      .select("permissions")
      .eq("intern_id", internId)
      .single();

    // Delete permissions
    const { error } = await supabase
      .from("intern_permissions")
      .delete()
      .eq("intern_id", internId);

    if (error) {
      throw error;
    }

    // Log revocation of all permissions
    if (existingPermissions) {
      const oldPerms = existingPermissions.permissions as InternPermissions;
      for (const [key, value] of Object.entries(oldPerms)) {
        if (value) {
          await supabase.rpc('log_permission_change', {
            p_intern_id: internId,
            p_action: 'revoked',
            p_permission_key: key,
            p_old_value: true,
            p_new_value: false,
            p_changed_by: session.user.id
          });
        }
      }
    }

    return NextResponse.json({
      ok: true,
      message: "Intern permissions removed successfully"
    });
  } catch (error: any) {
    console.error("Error removing intern permissions:", error);
    return NextResponse.json({
      ok: false,
      error: error.message
    }, { status: 500 });
  }
}
