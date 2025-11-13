import { NextResponse } from "next/server";
import { getServerComponentClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getServerComponentClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return NextResponse.json({ user: null });
  }

  const { data: user } = await supabase
    .from("users")
    .select("id, name, email, role")
    .eq("id", session.user.id)
    .single();

  return NextResponse.json({ 
    user: user || null
  });
}

