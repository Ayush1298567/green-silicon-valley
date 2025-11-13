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
  const folderId = searchParams.get("folder_id");
  const search = searchParams.get("search");

  let query = supabase.from("documents").select("*").order("uploaded_at", { ascending: false });

  if (folderId) {
    query = query.eq("folder_id", parseInt(folderId));
  } else {
    query = query.is("folder_id", null);
  }

  if (search) {
    query = query.or(`filename.ilike.%${search}%,description.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, documents: data || [] });
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
  const { filename, file_type, file_size, folder_id, description, tags, storage_path } = body;

  if (!filename || !storage_path) {
    return NextResponse.json({ ok: false, error: "Filename and storage_path required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("documents")
    .insert({
      filename,
      original_filename: filename,
      file_type,
      file_size,
      folder_id,
      storage_path,
      description,
      tags: tags || [],
      uploaded_by: session.user.id
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, document: data });
}

