import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is founder or has permission
  const { data: userRoleData } = await supabase
    .from("users")
    .select("role, permissions")
    .eq("id", session.user.id)
    .single();

  if (userRoleData?.role !== "founder" && !userRoleData?.permissions?.manage_documents) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { title, url, description, category, subcategory } = await req.json();

  if (!title || !url) {
    return NextResponse.json({ error: "Title and URL are required" }, { status: 400 });
  }

  // Validate it's a Google Docs URL
  if (!url.includes("docs.google.com")) {
    return NextResponse.json({ error: "Must be a Google Docs, Slides, or Sheets URL" }, { status: 400 });
  }

  const { error } = await supabase.from("resources").insert({
    filename: title,
    file_url: url,
    description,
    category: category || "training",
    subcategory,
    uploaded_by: session.user.id,
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Error creating link:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Link added successfully" });
}

