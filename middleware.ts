import { NextResponse, type NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { trackUserActivity } from "@/lib/auth/routing";

const PROTECTED_PREFIXES = ["/dashboard", "/settings", "/admin"];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const {
    data: { session }
  } = await supabase.auth.getSession();

  const isProtected = PROTECTED_PREFIXES.some((p) =>
    req.nextUrl.pathname.startsWith(p)
  );
  if (isProtected && !session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectedFrom", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  
  // Ensure users row exists for authenticated sessions (default role teacher)
  if (session) {
    try {
      const { data } = await supabase.from("users").select("id, user_category").eq("id", session.user.id).limit(1);
      if (!data || data.length === 0) {
        await supabase.from("users").insert({
          id: session.user.id,
          name: session.user.user_metadata?.full_name ?? session.user.email,
          email: session.user.email,
          role: "teacher",
          user_category: "guest",
          status: "active",
        });
      }

      // Track page views for dashboard/admin pages (lightweight tracking)
      if (isProtected && data && data.length > 0) {
        const userCategory = data[0].user_category || null;
        // Don't await - fire and forget to avoid blocking
        trackUserActivity(supabase, {
          user_id: session.user.id,
          email: session.user.email || "",
          activity_type: "page_view",
          activity_source: "navigation",
          user_category: userCategory,
          ip_address: req.headers.get("x-forwarded-for") || undefined,
          user_agent: req.headers.get("user-agent") || undefined,
          referrer: req.headers.get("referer") || undefined,
          metadata: { path: req.nextUrl.pathname },
        }).catch(() => {}); // Silently fail if tracking fails
      }
    } catch {}
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"]
};


