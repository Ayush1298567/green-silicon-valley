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

  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") || "csv";

  const { data: subscribers, error } = await supabase
    .from("newsletter_subscribers")
    .select("*")
    .order("subscribed_at", { ascending: false });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  if (format === "csv") {
    const headers = ["Email", "Name", "Status", "Subscribed At", "Tags", "Total Emails Sent", "Total Opened", "Total Clicked"];
    const rows = (subscribers || []).map((s: any) => [
      s.email,
      s.name || "",
      s.status,
      s.subscribed_at || "",
      (s.tags || []).join(";"),
      s.total_emails_sent || 0,
      s.total_emails_opened || 0,
      s.total_emails_clicked || 0
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row: any[]) => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="subscribers-${new Date().toISOString().split("T")[0]}.csv"`
      }
    });
  }

  return NextResponse.json({ ok: true, subscribers });
}

