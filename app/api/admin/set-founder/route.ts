import { NextResponse } from "next/server";
import { getServerComponentClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const supabase = getServerComponentClient();
    
    // Check if the requesting user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find user by email
    const { data: users, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email);

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ 
        error: "User not found. They need to sign in at least once first." 
      }, { status: 404 });
    }

    // Update user role to founder
    const { error: updateError } = await supabase
      .from("users")
      .update({ role: "founder" })
      .eq("email", email);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully set ${email} as founder`,
      userId: users[0].id
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

