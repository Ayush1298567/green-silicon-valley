import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { getUserRoleServer } from "@/lib/auth/guards";

interface AIAlertSettings {
  alert_frequency: 'weekly_critical' | 'critical_only';
  weekly_digest_day: string;
  weekly_digest_time: string;
  critical_inactivity_days: number;
  critical_deadline_hours: number;
  critical_budget_overrun_percent: number;
  critical_delivery_delay_hours: number;
  email_alerts: boolean;
  in_app_alerts: boolean;
  sms_alerts: boolean;
}

// GET /api/admin/ai-alert-settings
export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const role = await getUserRoleServer(supabase as any);

    if (role !== "founder") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("ai_alert_settings")
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
    console.error("Error fetching AI alert settings:", error);
    return NextResponse.json({
      ok: false,
      error: error.message
    }, { status: 500 });
  }
}

// POST /api/admin/ai-alert-settings
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

    const settings: AIAlertSettings = await request.json();

    // Validate required fields
    if (!settings.alert_frequency || !settings.weekly_digest_day || !settings.weekly_digest_time) {
      return NextResponse.json({
        ok: false,
        error: "Missing required fields"
      }, { status: 400 });
    }

    // Validate alert frequency
    if (!['weekly_critical', 'critical_only'].includes(settings.alert_frequency)) {
      return NextResponse.json({
        ok: false,
        error: "Invalid alert frequency. Must be 'weekly_critical' or 'critical_only'"
      }, { status: 400 });
    }

    // Validate weekly digest day
    const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    if (!validDays.includes(settings.weekly_digest_day.toLowerCase())) {
      return NextResponse.json({
        ok: false,
        error: "Invalid weekly digest day"
      }, { status: 400 });
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(settings.weekly_digest_time)) {
      return NextResponse.json({
        ok: false,
        error: "Invalid time format. Must be HH:MM (24-hour format)"
      }, { status: 400 });
    }

    // Validate numeric fields
    if (settings.critical_inactivity_days < 1 || settings.critical_inactivity_days > 30) {
      return NextResponse.json({
        ok: false,
        error: "Critical inactivity days must be between 1 and 30"
      }, { status: 400 });
    }

    if (settings.critical_deadline_hours < 1 || settings.critical_deadline_hours > 168) {
      return NextResponse.json({
        ok: false,
        error: "Critical deadline hours must be between 1 and 168 (1 week)"
      }, { status: 400 });
    }

    if (settings.critical_budget_overrun_percent < 1 || settings.critical_budget_overrun_percent > 100) {
      return NextResponse.json({
        ok: false,
        error: "Critical budget overrun percent must be between 1 and 100"
      }, { status: 400 });
    }

    if (settings.critical_delivery_delay_hours < 1 || settings.critical_delivery_delay_hours > 168) {
      return NextResponse.json({
        ok: false,
        error: "Critical delivery delay hours must be between 1 and 168"
      }, { status: 400 });
    }

    // Validate boolean fields
    if (typeof settings.email_alerts !== "boolean" ||
        typeof settings.in_app_alerts !== "boolean" ||
        typeof settings.sms_alerts !== "boolean") {
      return NextResponse.json({
        ok: false,
        error: "Alert delivery preferences must be boolean values"
      }, { status: 400 });
    }

    // Update or insert settings
    const { data, error } = await supabase
      .from("ai_alert_settings")
      .upsert({
        alert_frequency: settings.alert_frequency,
        weekly_digest_day: settings.weekly_digest_day.toLowerCase(),
        weekly_digest_time: settings.weekly_digest_time,
        critical_inactivity_days: settings.critical_inactivity_days,
        critical_deadline_hours: settings.critical_deadline_hours,
        critical_budget_overrun_percent: settings.critical_budget_overrun_percent,
        critical_delivery_delay_hours: settings.critical_delivery_delay_hours,
        email_alerts: settings.email_alerts,
        in_app_alerts: settings.in_app_alerts,
        sms_alerts: settings.sms_alerts,
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
      message: "AI alert settings updated successfully"
    });
  } catch (error: any) {
    console.error("Error updating AI alert settings:", error);
    return NextResponse.json({
      ok: false,
      error: error.message
    }, { status: 500 });
  }
}
