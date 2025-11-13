import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check permissions
  const { data: userRoleData } = await supabase
    .from("users")
    .select("role, permissions")
    .eq("id", session.user.id)
    .single();

  if (userRoleData?.role !== "founder" && !userRoleData?.permissions?.manage_documents) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const subcategory = formData.get("subcategory") as string;

    if (!file || !title) {
      return NextResponse.json({ error: "File and title are required" }, { status: 400 });
    }

    // Upload file to Supabase Storage
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `resources/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("documents")
      .getPublicUrl(filePath);

    // Insert into resources table
    const { error: dbError } = await supabase.from("resources").insert({
      filename: title,
      file_url: urlData.publicUrl,
      description,
      category: category || "general",
      subcategory,
      uploaded_by: session.user.id,
      created_at: new Date().toISOString(),
      download_count: 0,
    });

    if (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    // Log the action
    await supabase.from("system_logs").insert({
      action: "uploaded_resource",
      actor_id: session.user.id,
      target_table: "resources",
      details: `Uploaded resource: ${title}`,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ message: "File uploaded successfully", url: urlData.publicUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to process upload" }, { status: 500 });
  }
}

