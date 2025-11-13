import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function resolveEmailTemplate(key: string, vars: Record<string, string>, fallback: { subject: string; text: string }) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data } = await supabase.from("email_templates").select("subject,body").eq("key", key).limit(1);
    if (data && data.length > 0) {
      const tpl = data[0];
      const subject = interpolate(tpl.subject, vars);
      const text = interpolate(tpl.body, vars);
      return { subject, text };
    }
  } catch {}
  return fallback;
}

function interpolate(template: string, vars: Record<string, string>) {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => (vars[k] ?? ""));
}


