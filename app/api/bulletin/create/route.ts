import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is founder or intern
  const { data: userRoleData } = await supabase
    .from("users")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (userRoleData?.role !== "founder" && userRoleData?.role !== "intern") {
    return NextResponse.json({ error: "Forbidden: Only founders and interns can create bulletin posts" }, { status: 403 });
  }

  const { title, content, category, pinned, allow_comments, expires_at } = await req.json();

  if (!title || !content) {
    return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
  }

  const { error } = await supabase.from("bulletin_posts").insert({
    title,
    content,
    category,
    author_id: session.user.id,
    pinned: pinned || false,
    allow_comments: allow_comments !== false,
    expires_at: expires_at || null,
    published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Error creating bulletin post:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Bulletin post created successfully" });
}

