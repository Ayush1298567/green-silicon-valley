import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { data: languages, error } = await supabase
      .from("supported_languages")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, languages: languages || [] });

  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { code, name, native_name, is_active, is_default } = body;

    if (!code || !name || !native_name) {
      return NextResponse.json({ ok: false, error: "Code, name, and native name are required" }, { status: 400 });
    }

    // If setting as default, unset other defaults
    if (is_default) {
      await supabase
        .from("supported_languages")
        .update({ is_default: false })
        .neq("code", code);
    }

    const { data: language, error } = await supabase
      .from("supported_languages")
      .upsert({
        code,
        name,
        native_name,
        is_active: is_active ?? true,
        is_default: is_default ?? false
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, language });

  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
