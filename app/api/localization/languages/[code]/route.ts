import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function PUT(
  req: Request,
  { params }: { params: { code: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, native_name, is_active, is_default } = body;

    // If setting as default, unset other defaults
    if (is_default) {
      await supabase
        .from("supported_languages")
        .update({ is_default: false })
        .neq("code", params.code);
    }

    const { data: language, error } = await supabase
      .from("supported_languages")
      .update({
        name,
        native_name,
        is_active,
        is_default
      })
      .eq("code", params.code)
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

export async function DELETE(
  req: Request,
  { params }: { params: { code: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Delete associated translations first
    await supabase
      .from("localization_content")
      .delete()
      .eq("language", params.code);

    // Then delete the language
    const { error } = await supabase
      .from("supported_languages")
      .delete()
      .eq("code", params.code);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: "Language deleted successfully" });

  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
