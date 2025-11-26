import { NextRequest, NextResponse } from "next/server";
import { getServerComponentClient } from "@/lib/supabase/server";
import { getUserRoleServer } from "@/lib/auth/guards";

export async function GET() {
  try {
    const supabase = getServerComponentClient();

    const { data: leaders, error } = await supabase
      .from("leadership_profiles")
      .select("*")
      .order("order_index", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ leaders: leaders || [] });
  } catch (error) {
    console.error("Error fetching leaders:", error);
    return NextResponse.json(
      { error: "Failed to fetch leadership profiles" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getServerComponentClient();
    const role = await getUserRoleServer(supabase);

    if (role !== "founder") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

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

    // Get the next order index
    const { data: maxOrder } = await supabase
      .from("leadership_profiles")
      .select("order_index")
      .order("order_index", { ascending: false })
      .limit(1);

    const nextOrder = (maxOrder?.[0]?.order_index || 0) + 1;

    const { data: leader, error } = await supabase
      .from("leadership_profiles")
      .insert({
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
        order_index: nextOrder,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ leader });
  } catch (error) {
    console.error("Error creating leader:", error);
    return NextResponse.json(
      { error: "Failed to create leadership profile" },
      { status: 500 }
    );
  }
}
