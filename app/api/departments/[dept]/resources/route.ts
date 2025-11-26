import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET(
  req: Request,
  { params }: { params: { dept: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { data: resources, error } = await supabase
      .from("department_resources")
      .select("*")
      .eq("department", params.dept)
      .order("uploaded_at", { ascending: false });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, resources: resources || [] });

  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { dept: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const type = formData.get("type") as string;
    const description = formData.get("description") as string;
    const tags = formData.get("tags") as string;
    const access_level = formData.get("access_level") as string;
    const file = formData.get("file") as File | null;

    if (!name || !type) {
      return NextResponse.json({ ok: false, error: "Name and type are required" }, { status: 400 });
    }

    let file_url = "";
    let file_size = 0;

    if (file) {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${params.dept}/${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("department-resources")
        .upload(fileName, file);

      if (uploadError) {
        return NextResponse.json({ ok: false, error: uploadError.message }, { status: 500 });
      }

      file_url = uploadData.path;
      file_size = file.size;
    }

    const { data: resource, error } = await supabase
      .from("department_resources")
      .insert({
        department: params.dept,
        name,
        type,
        file_url,
        description,
        tags: tags ? tags.split(",").map(tag => tag.trim()) : [],
        access_level: access_level || "department",
        uploaded_by: session.user.id,
        file_size
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, resource });

  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
