import { NextRequest, NextResponse } from "next/server";
import { getServerComponentClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const supabase = getServerComponentClient();
  
  // Get current user
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is founder
  const { data: user } = await supabase
    .from("users")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (!user || user.role !== "founder") {
    return NextResponse.json({ error: "Forbidden - only founders can grant permissions" }, { status: 403 });
  }

  const body = await request.json();
  
  const {
    user_id,
    resource_id,
    permission_level = "view",
    expires_at,
  } = body;

  if (!user_id || !resource_id) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Verify resource exists
  const { data: resource } = await supabase
    .from("resources")
    .select("id")
    .eq("id", resource_id)
    .single();

  if (!resource) {
    return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  }

  // Create or update the permission
  const { data: permission, error } = await supabase
    .from("document_permissions")
    .upsert({
      user_id,
      resource_id,
      permission_level,
      granted_by: session.user.id,
      expires_at: expires_at || null,
    }, {
      onConflict: "user_id,resource_id",
    })
    .select(`
      *,
      user:users!document_permissions_user_id_fkey(id, name, email, role),
      resource:resources!document_permissions_resource_id_fkey(id, filename, category),
      granted_by_user:users!document_permissions_granted_by_fkey(id, name)
    `)
    .single();

  if (error) {
    console.error("Error granting permission:", error);
    return NextResponse.json({ error: "Failed to grant permission" }, { status: 500 });
  }

  return NextResponse.json({ permission });
}

