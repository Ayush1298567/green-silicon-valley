import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

// Public unsubscribe endpoint
export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const body = await req.json().catch(() => ({}));
  const { email, token } = body;

  if (!email && !token) {
    return NextResponse.json({ ok: false, error: "Email or token required" }, { status: 400 });
  }

  let query = supabase.from("newsletter_subscribers");

  if (email) {
    query = query.eq("email", email);
  } else if (token) {
    // In a real implementation, you'd verify the token
    // For now, we'll use email from token (simplified)
    query = query.eq("email", token); // Simplified - should decode token
  }

  const { data, error } = await query
    .update({
      status: "unsubscribed",
      unsubscribed_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, message: "Successfully unsubscribed" });
}

