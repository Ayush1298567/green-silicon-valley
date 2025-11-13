import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { getUserRoleServer } from "@/lib/auth/guards";

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const role = await getUserRoleServer(supabase as any);
  
  if (role !== "founder" && role !== "intern") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const tag = searchParams.get("tag");
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");
  const search = searchParams.get("search");

  let query = supabase
    .from("newsletter_subscribers")
    .select("*", { count: "exact" })
    .range(offset, offset + limit - 1)
    .order("subscribed_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }
  if (tag) {
    query = query.contains("tags", [tag]);
  }
  if (search) {
    query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, subscribers: data || [], total: count || 0 });
}

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const role = await getUserRoleServer(supabase as any);
  
  // Allow public signup or admin creation
  const body = await req.json().catch(() => ({}));
  const { email, name, tags, custom_fields, source } = body;

  if (!email) {
    return NextResponse.json({ ok: false, error: "Email required" }, { status: 400 });
  }

  // Check if already exists
  const { data: existing } = await supabase
    .from("newsletter_subscribers")
    .select("id, status")
    .eq("email", email)
    .single();

  if (existing) {
    if (existing.status === "unsubscribed") {
      // Resubscribe
      const { data, error } = await supabase
        .from("newsletter_subscribers")
        .update({
          status: "active",
          subscribed_at: new Date().toISOString(),
          unsubscribed_at: null
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
      }
      return NextResponse.json({ ok: true, subscriber: data });
    }
    return NextResponse.json({ ok: false, error: "Email already subscribed" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .insert({
      email,
      name: name || null,
      tags: tags || [],
      custom_fields: custom_fields || {},
      source: source || "website",
      status: "active"
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, subscriber: data });
}

