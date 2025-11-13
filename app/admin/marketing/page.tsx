import { getServerComponentClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getDashboardPathForRole, type UserRole } from "@/lib/auth/roles";
import MarketingAutomationsPanel from "@/components/marketing/MarketingAutomationsPanel";

export const dynamic = "force-dynamic";

export default async function MarketingPage() {
  const supabase = getServerComponentClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: roleRow } = await supabase.from("users").select("role").eq("id", session.user.id).single();
  const role = (roleRow?.role as UserRole) ?? "volunteer";
  if (role !== "founder") redirect(getDashboardPathForRole(role));

  const { data: campaigns } = await supabase
    .from("marketing_campaigns")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  const { data: logs } = await supabase
    .from("marketing_logs")
    .select("campaign_id, status, detail, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="container py-10">
      <MarketingAutomationsPanel initialCampaigns={campaigns ?? []} initialLogs={logs ?? []} />
    </div>
  );
}
