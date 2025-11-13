import { NextResponse } from "next/server";
import { runOperationsOnce } from "@/lib/operations";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { getUserRoleServer } from "@/lib/auth/guards";

export async function GET(req: Request) {
  // Allow founders to run manually from UI; cron jobs can call without session if you allow
  const supabase = createRouteHandlerClient({ cookies });
  const role = await getUserRoleServer(supabase as any);
  if (role !== "founder") {
    // For cron without session, you might secure via secret token query param
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    if (!token || token !== process.env.CRON_SECRET) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }
  }
  await runOperationsOnce();
  return NextResponse.json({ ok: true });
}


