import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { getUserRoleServer } from "@/lib/auth/guards";
import { sendEmail } from "@/lib/email";

function selectAudienceQuery(audience: string) {
  switch (audience) {
    case "volunteers":
      return { column: "role", value: "volunteer" };
    case "teachers":
      return { column: "role", value: "teacher" };
    case "interns":
      return { column: "role", value: "intern" };
    case "partners":
      return { column: "role", value: "partner" };
    case "founders":
      return { column: "role", value: "founder" };
    default:
      return null;
  }
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const role = await getUserRoleServer(supabase as any);
  if (role !== "founder") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const { campaignId } = body ?? {};
  if (!campaignId) return NextResponse.json({ error: "Missing campaignId" }, { status: 400 });

  const { data: campaign, error } = await supabase.from("marketing_campaigns").select("*").eq("id", campaignId).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  if (campaign.status === "sent") {
    return NextResponse.json({ error: "Campaign already sent" }, { status: 400 });
  }

  const audienceFilter = selectAudienceQuery(campaign.audience);
  let usersQuery = supabase.from("users").select("email, name, role").not("email", "is", null);
  if (audienceFilter) {
    usersQuery = usersQuery.eq(audienceFilter.column, audienceFilter.value);
  }
  const { data: recipients, error: recipientsError } = await usersQuery;
  if (recipientsError) return NextResponse.json({ error: recipientsError.message }, { status: 500 });

  const deliveries: Array<{ email: string; status: string; detail?: string }> = [];
  if (recipients) {
    for (const user of recipients) {
      if (!user?.email) continue;
      const subject = campaign.subject;
      const personalizedBody = `Hi ${user.name ?? "there"},\n\n${campaign.body}`;
      try {
        const result = await sendEmail({ to: user.email, subject, text: personalizedBody });
        deliveries.push({ email: user.email, status: result?.skipped ? "skipped" : "sent" });
        await supabase.from("marketing_logs").insert({
          campaign_id: campaignId,
          recipient: user.email,
          status: result?.skipped ? "skipped" : "sent",
          detail: result?.skipped ? "SMTP not configured" : null
        });
      } catch (err: any) {
        deliveries.push({ email: user.email, status: "failed", detail: err?.message });
        await supabase.from("marketing_logs").insert({
          campaign_id: campaignId,
          recipient: user.email,
          status: "failed",
          detail: err?.message ?? "Unknown error"
        });
      }
    }
  }

  await supabase
    .from("marketing_campaigns")
    .update({ status: "sent", sent_at: new Date().toISOString() })
    .eq("id", campaignId);

  return NextResponse.json({ ok: true, deliveries });
}
