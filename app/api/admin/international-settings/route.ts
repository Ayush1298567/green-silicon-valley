import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { getUserRoleServer } from "@/lib/auth/guards";

interface InternationalSettings {
  international_enabled: boolean;
  coming_soon_message: string;
  supported_countries?: string[];
  language_options?: string[];
  timezone_support?: boolean;
  compliance_requirements?: {
    gdpr_enabled: boolean;
    ccpa_enabled: boolean;
    pipeda_enabled: boolean;
  };
  localized_content?: Record<string, any>;
}

// GET /api/admin/international-settings
export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const role = await getUserRoleServer(supabase as any);

    if (role !== "founder") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("international_settings")
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
    console.error("Error fetching international settings:", error);
    return NextResponse.json({
      ok: false,
      error: error.message
    }, { status: 500 });
  }
}

// POST /api/admin/international-settings
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

    const settings: InternationalSettings = await request.json();

    // Validate required fields
    if (typeof settings.international_enabled !== "boolean") {
      return NextResponse.json({
        ok: false,
        error: "International enabled flag is required"
      }, { status: 400 });
    }

    if (!settings.coming_soon_message || settings.coming_soon_message.trim().length === 0) {
      return NextResponse.json({
        ok: false,
        error: "Coming soon message is required"
      }, { status: 400 });
    }

    // Validate arrays if provided
    if (settings.supported_countries && !Array.isArray(settings.supported_countries)) {
      return NextResponse.json({
        ok: false,
        error: "Supported countries must be an array"
      }, { status: 400 });
    }

    if (settings.language_options && !Array.isArray(settings.language_options)) {
      return NextResponse.json({
        ok: false,
        error: "Language options must be an array"
      }, { status: 400 });
    }

    // Validate compliance requirements structure
    if (settings.compliance_requirements) {
      const compliance = settings.compliance_requirements;
      if (typeof compliance.gdpr_enabled !== "boolean" ||
          typeof compliance.ccpa_enabled !== "boolean" ||
          typeof compliance.pipeda_enabled !== "boolean") {
        return NextResponse.json({
          ok: false,
          error: "Compliance requirements must contain valid boolean flags"
        }, { status: 400 });
      }
    }

    // Prepare data for upsert
    const upsertData: any = {
      international_enabled: settings.international_enabled,
      coming_soon_message: settings.coming_soon_message.trim(),
      supported_countries: settings.supported_countries || [],
      language_options: settings.language_options || ['en'],
      timezone_support: settings.timezone_support || false,
      compliance_requirements: settings.compliance_requirements || {
        gdpr_enabled: false,
        ccpa_enabled: false,
        pipeda_enabled: false
      },
      localized_content: settings.localized_content || {},
      updated_by: session.user.id
    };

    // Update or insert settings
    const { data, error } = await supabase
      .from("international_settings")
      .upsert(upsertData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      ok: true,
      settings: data,
      message: "International settings updated successfully"
    });
  } catch (error: any) {
    console.error("Error updating international settings:", error);
    return NextResponse.json({
      ok: false,
      error: error.message
    }, { status: 500 });
  }
}
