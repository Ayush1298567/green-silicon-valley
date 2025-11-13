import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { getUserRoleServer } from "@/lib/auth/guards";

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const role = await getUserRoleServer(supabase as any);
  
  if (role !== "founder" && role !== "intern") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  // Get overall stats
  const [
    { count: totalSubscribers },
    { count: activeSubscribers },
    { count: unsubscribedCount },
    { data: campaigns },
    { data: recentTracking }
  ] = await Promise.all([
    supabase.from("newsletter_subscribers").select("*", { count: "exact", head: true }),
    supabase.from("newsletter_subscribers").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("newsletter_subscribers").select("*", { count: "exact", head: true }).eq("status", "unsubscribed"),
    supabase.from("newsletter_campaigns").select("*").eq("status", "sent").order("sent_at", { ascending: false }).limit(10),
    supabase.from("email_tracking").select("*").order("created_at", { ascending: false }).limit(1000)
  ]);

  // Calculate metrics
  const totalSent = campaigns?.reduce((sum, c) => sum + (c.sent_count || 0), 0) || 0;
  const totalOpened = campaigns?.reduce((sum, c) => sum + (c.opened_count || 0), 0) || 0;
  const totalClicked = campaigns?.reduce((sum, c) => sum + (c.clicked_count || 0), 0) || 0;
  const totalBounced = campaigns?.reduce((sum, c) => sum + (c.bounced_count || 0), 0) || 0;

  const avgOpenRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
  const avgClickRate = totalSent > 0 ? (totalClicked / totalSent) * 100 : 0;
  const bounceRate = totalSent > 0 ? (totalBounced / totalSent) * 100 : 0;

  // Campaign performance
  const campaignPerformance = campaigns?.map((c: any) => ({
    id: c.id,
    name: c.name,
    sent: c.sent_count || 0,
    opened: c.opened_count || 0,
    clicked: c.clicked_count || 0,
    openRate: c.sent_count > 0 ? ((c.opened_count || 0) / c.sent_count) * 100 : 0,
    clickRate: c.sent_count > 0 ? ((c.clicked_count || 0) / c.sent_count) * 100 : 0,
    sentAt: c.sent_at
  })) || [];

  return NextResponse.json({
    ok: true,
    analytics: {
      totalSubscribers: totalSubscribers || 0,
      activeSubscribers: activeSubscribers || 0,
      unsubscribedCount: unsubscribedCount || 0,
      totalSent,
      totalOpened,
      totalClicked,
      totalBounced,
      avgOpenRate: Math.round(avgOpenRate * 100) / 100,
      avgClickRate: Math.round(avgClickRate * 100) / 100,
      bounceRate: Math.round(bounceRate * 100) / 100,
      campaignPerformance
    }
  });
}

