import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { data: translations, error } = await supabase
      .from("localization_content")
      .select("*")
      .order("content_key", { ascending: true })
      .order("language", { ascending: true });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, translations: translations || [] });

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
    const { content_key, language, value, context } = body;

    if (!content_key || !language) {
      return NextResponse.json({ ok: false, error: "Content key and language are required" }, { status: 400 });
    }

    const { data: translation, error } = await supabase
      .from("localization_content")
      .insert({
        content_key,
        language,
        value: value || "",
        context,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, translation });

  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
