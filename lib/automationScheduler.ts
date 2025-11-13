import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export type AutomationSettings = {
  daily_refresh_enabled?: boolean;
  weekly_report_enabled?: boolean;
  monthly_report_enabled?: boolean;
  times?: { morning?: string; evening?: string; monthly?: string };
};

export async function readAutomationSettings(): Promise<AutomationSettings> {
  const supabase = createRouteHandlerClient({ cookies });
  const { data } = await supabase
    .from("settings")
    .select("key,value")
    .in("key", ["automation_times", "automation_flags"]);
  const obj: any = {};
  for (const r of data ?? []) {
    obj[r.key] = r.value;
  }
  return {
    daily_refresh_enabled: obj.automation_flags?.daily_refresh_enabled ?? true,
    weekly_report_enabled: obj.automation_flags?.weekly_report_enabled ?? true,
    monthly_report_enabled: obj.automation_flags?.monthly_report_enabled ?? true,
    times: obj.automation_times ?? { morning: "03:30", evening: "20:00", monthly: "08:00" }
  };
}


