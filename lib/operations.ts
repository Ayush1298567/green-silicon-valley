import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { computeAnalytics, writeAnalyticsCache } from "@/lib/analytics";

export async function runNightlyAnalytics() {
  const supabase = createRouteHandlerClient({ cookies });
  const metrics = await computeAnalytics();
  await writeAnalyticsCache(metrics);
  await supabase.from("system_logs").insert({
    event_type: "analytics_nightly_refresh",
    description: JSON.stringify({ at: new Date().toISOString() })
  });
}

export async function checkChapterReviewsAndReminders() {
  const supabase = createRouteHandlerClient({ cookies });
  const today = new Date();
  const { data: chapters } = await supabase
    .from("chapters")
    .select("id, name, leader, next_review_date, status");
  for (const c of chapters ?? []) {
    const due = c.next_review_date ? new Date(c.next_review_date as any) : null;
    if (due && today > due) {
      await supabase
        .from("chapters")
        .update({ status: "review_due" })
        .eq("id", c.id);
      await supabase.from("system_logs").insert({
        event_type: "chapter_review_due",
        description: JSON.stringify({ chapter: c.name, leader: c.leader })
      });
      // Optional: email leader if SMTP configured
      if (process.env.SMTP_URL) {
        // Implement email integration here (omitted for brevity)
      }
    }
  }
}

export async function runOperationsOnce() {
  await runNightlyAnalytics();
  await checkChapterReviewsAndReminders();
  // Additional tasks: inactive chapters, reminders, etc.
}


