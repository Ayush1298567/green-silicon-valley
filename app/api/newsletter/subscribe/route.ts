import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { trackUserActivity } from "@/lib/auth/routing";

// Public newsletter signup endpoint
export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const body = await req.json().catch(() => ({}));
  const { email, name, tags } = body;
  const userAgent = req.headers.get("user-agent") || "";
  const referrer = req.headers.get("referer") || "";

  if (!email) {
    return NextResponse.json({ ok: false, error: "Email required" }, { status: 400 });
  }

  // Check if already exists
  const { data: existing } = await supabase
    .from("newsletter_subscribers")
    .select("id, status")
    .eq("email", email)
    .single();

  if (existing) {
    if (existing.status === "unsubscribed") {
      // Resubscribe
      await supabase
        .from("newsletter_subscribers")
        .update({
          status: "active",
          subscribed_at: new Date().toISOString(),
          unsubscribed_at: null
        })
        .eq("id", existing.id);
      
      // Track resubscription activity
      await trackUserActivity(supabase, {
        email: email,
        activity_type: "form_submit",
        activity_source: "newsletter",
        user_category: "newsletter",
        user_agent: userAgent,
        referrer: referrer,
        metadata: { action: "resubscribed" },
      });

      return NextResponse.json({ ok: true, message: "Successfully resubscribed" });
    }
    return NextResponse.json({ ok: true, message: "Already subscribed" });
  }

  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .insert({
      email,
      name: name || null,
      tags: tags || [],
      source: "website",
      status: "active"
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  // Track newsletter signup activity
  await trackUserActivity(supabase, {
    email: email,
    activity_type: "form_submit",
    activity_source: "newsletter",
    user_category: "newsletter",
    user_agent: userAgent,
    referrer: referrer,
    metadata: { subscriber_id: data.id },
  });

  return NextResponse.json({ ok: true, message: "Successfully subscribed", subscriber: data });
}

