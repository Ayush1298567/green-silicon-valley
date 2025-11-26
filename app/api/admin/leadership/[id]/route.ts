import { NextRequest, NextResponse } from "next/server";
import { getServerComponentClient } from "@/lib/supabase/server";
import { getUserRoleServer } from "@/lib/auth/guards";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getServerComponentClient();
    const role = await getUserRoleServer(supabase);

    if (role !== "founder") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      name,
      title,
      department,
      bio,
      photoUrl,
      email,
      linkedinUrl,
      twitterUrl,
      websiteUrl,
      isActive
    } = body;

    const { data: leader, error } = await supabase
      .from("leadership_profiles")
      .update({
        name,
        title,
        department,
        bio,
        photo_url: photoUrl,
        email: email || null,
        linkedin_url: linkedinUrl || null,
        twitter_url: twitterUrl || null,
        website_url: websiteUrl || null,
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ leader });
  } catch (error) {
    console.error("Error updating leader:", error);
    return NextResponse.json(
      { error: "Failed to update leadership profile" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getServerComponentClient();
    const role = await getUserRoleServer(supabase);

    if (role !== "founder") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    const { error } = await supabase
      .from("leadership_profiles")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting leader:", error);
    return NextResponse.json(
      { error: "Failed to delete leadership profile" },
      { status: 500 }
    );
  }
}
