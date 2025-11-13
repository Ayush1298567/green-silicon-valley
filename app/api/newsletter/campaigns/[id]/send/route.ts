import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { getUserRoleServer } from "@/lib/auth/guards";
import { sendEmail } from "@/lib/email";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  const role = await getUserRoleServer(supabase as any);
  
  if (role !== "founder" && role !== "intern") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const { data: campaign, error: campaignError } = await supabase
    .from("newsletter_campaigns")
    .select("*")
    .eq("id", params.id)
    .single();

  if (campaignError || !campaign) {
    return NextResponse.json({ ok: false, error: "Campaign not found" }, { status: 404 });
  }

  // Get recipients based on recipient_selection
  const recipientSelection = campaign.recipient_selection || {};
  let subscribersQuery = supabase
    .from("newsletter_subscribers")
    .select("id, email, name")
    .eq("status", "active");

  // Apply filters
  if (recipientSelection.tags && recipientSelection.tags.length > 0) {
    subscribersQuery = subscribersQuery.overlaps("tags", recipientSelection.tags);
  }

  const { data: subscribers, error: subscribersError } = await subscribersQuery;

  if (subscribersError) {
    return NextResponse.json({ ok: false, error: subscribersError.message }, { status: 500 });
  }

  if (!subscribers || subscribers.length === 0) {
    return NextResponse.json({ ok: false, error: "No recipients found" }, { status: 400 });
  }

  // Update campaign status
  await supabase
    .from("newsletter_campaigns")
    .update({
      status: "sending",
      recipient_count: subscribers.length
    })
    .eq("id", params.id);

  // Send emails (in production, this should be queued)
  let sentCount = 0;
  let errorCount = 0;

  for (const subscriber of subscribers.slice(0, 10)) { // Limit to 10 for now (should use queue)
    try {
      // Personalize content
      let htmlContent = campaign.content_html || "";
      htmlContent = htmlContent.replace(/{name}/g, subscriber.name || subscriber.email);
      htmlContent = htmlContent.replace(/{email}/g, subscriber.email);

      // Send email
      await sendEmail({
        to: subscriber.email,
        subject: campaign.subject,
        text: campaign.content_text || htmlContent.replace(/<[^>]*>/g, "")
      });

      // Track email sent
      await supabase.from("email_tracking").insert({
        campaign_id: campaign.id,
        subscriber_id: subscriber.id,
        email_address: subscriber.email,
        event_type: "sent"
      });

      // Update subscriber stats
      await supabase
        .from("newsletter_subscribers")
        .update({
          last_email_sent_at: new Date().toISOString(),
          total_emails_sent: (subscriber.total_emails_sent || 0) + 1
        })
        .eq("id", subscriber.id);

      sentCount++;
    } catch (error) {
      errorCount++;
      // Track bounce
      await supabase.from("email_tracking").insert({
        campaign_id: campaign.id,
        subscriber_id: subscriber.id,
        email_address: subscriber.email,
        event_type: "bounced",
        event_data: { error: String(error) }
      });
    }
  }

  // Update campaign with results
  await supabase
    .from("newsletter_campaigns")
    .update({
      status: "sent",
      sent_at: new Date().toISOString(),
      sent_count: sentCount,
      bounced_count: errorCount
    })
    .eq("id", params.id);

  return NextResponse.json({
    ok: true,
    sent: sentCount,
    errors: errorCount,
    message: "Campaign sent (limited to 10 emails in demo mode)"
  });
}

