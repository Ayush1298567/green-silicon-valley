import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { getUserRoleServer } from "@/lib/auth/guards";

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  
  // Allow public access for badges
  const { searchParams } = new URL(req.url);
  const badgeType = searchParams.get("type");
  const isActive = searchParams.get("active") !== "false";

  let query = supabase.from("badges").select("*").order("created_at", { ascending: false });

  if (badgeType) {
    query = query.eq("badge_type", badgeType);
  }

  if (isActive) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, badges: data || [] });
}

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const role = await getUserRoleServer(supabase as any);
  
  if (role !== "founder") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { name, description, icon_url, badge_type, criteria, rarity } = body;

  if (!name || !badge_type) {
    return NextResponse.json({ ok: false, error: "Name and badge_type required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("badges")
    .insert({
      name,
      description,
      icon_url,
      badge_type,
      criteria: criteria || {},
      rarity: rarity || "common"
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, badge: data });
}

