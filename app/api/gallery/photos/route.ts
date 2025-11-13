import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { getUserRoleServer } from "@/lib/auth/guards";

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const role = await getUserRoleServer(supabase as any);
  
  // Allow public access for gallery
  const { searchParams } = new URL(req.url);
  const albumId = searchParams.get("album_id");
  const search = searchParams.get("search");
  const isPublic = searchParams.get("public") === "true";

  let query = supabase
    .from("photos")
    .select("*")
    .order("uploaded_at", { ascending: false });

  if (isPublic || role !== "founder" && role !== "intern") {
    query = query.eq("is_public", true);
  }

  if (albumId) {
    query = query.eq("album_id", parseInt(albumId));
  }

  if (search) {
    query = query.or(`caption.ilike.%${search}%,filename.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, photos: data || [] });
}

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const role = await getUserRoleServer(supabase as any);
  
  if (role !== "founder" && role !== "intern") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const {
    data: { session }
  } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const {
    filename,
    storage_path,
    thumbnail_path,
    album_id,
    caption,
    tags,
    is_public,
    width,
    height,
    file_size
  } = body;

  if (!filename || !storage_path) {
    return NextResponse.json({ ok: false, error: "Filename and storage_path required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("photos")
    .insert({
      filename,
      original_filename: filename,
      storage_path,
      thumbnail_path,
      album_id,
      caption,
      tags: tags || [],
      is_public: is_public !== false,
      width,
      height,
      file_size,
      uploaded_by: session.user.id
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, photo: data });
}

