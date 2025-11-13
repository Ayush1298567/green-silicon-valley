import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { getUserRoleServer } from "@/lib/auth/guards";

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const role = await getUserRoleServer(supabase as any);
  
  if (role !== "founder" && role !== "intern") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  try {
    const { format, startDate, endDate } = await req.json();

    // Fetch analytics data
    const [presentationsRes, volunteerHoursRes, volunteersRes, schoolsRes] = await Promise.all([
      supabase
        .from("presentations")
        .select("id, status, scheduled_date, student_count, school_id, topic")
        .gte("scheduled_date", startDate || "2020-01-01")
        .lte("scheduled_date", endDate || new Date().toISOString())
        .order("scheduled_date", { ascending: true }),
      supabase
        .from("volunteer_hours")
        .select("id, volunteer_id, hours_logged, status, date, created_at")
        .gte("date", startDate || "2020-01-01")
        .lte("date", endDate || new Date().toISOString()),
      supabase.from("volunteers").select("id, team_name, status, hours_total"),
      supabase.from("schools").select("id, name, city")
    ]);

    const presentations = presentationsRes.data ?? [];
    const volunteerHours = volunteerHoursRes.data ?? [];
    const volunteers = volunteersRes.data ?? [];
    const schools = schoolsRes.data ?? [];

    // Prepare data based on format
    let exportData: string;
    let contentType: string;
    let filename: string;

    if (format === "csv") {
      // CSV export
      const csvRows: string[] = [];
      
      // Presentations CSV
      csvRows.push("Type,ID,Date,Status,Students,School,Topic");
      presentations.forEach((p: any) => {
        const school = schools.find((s: any) => s.id === p.school_id);
        csvRows.push(
          `Presentation,${p.id},"${p.scheduled_date || ""}","${p.status || ""}",${p.student_count || 0},"${school?.name || "Unknown"}","${p.topic || ""}"`
        );
      });

      // Hours CSV
      csvRows.push("\nType,ID,Date,Hours,Status,Volunteer ID");
      volunteerHours.forEach((h: any) => {
        csvRows.push(
          `Hours,${h.id},"${h.date || h.created_at || ""}",${h.hours_logged || 0},"${h.status || ""}",${h.volunteer_id || ""}`
        );
      });

      exportData = csvRows.join("\n");
      contentType = "text/csv";
      filename = `analytics-export-${new Date().toISOString().split("T")[0]}.csv`;
    } else if (format === "json") {
      // JSON export
      exportData = JSON.stringify(
        {
          exportDate: new Date().toISOString(),
          dateRange: { start: startDate, end: endDate },
          presentations,
          volunteerHours,
          volunteers,
          schools,
          summary: {
            totalPresentations: presentations.length,
            totalHours: volunteerHours.reduce((sum: number, h: any) => sum + (h.hours_logged || 0), 0),
            totalVolunteers: volunteers.length,
            totalSchools: schools.length
          }
        },
        null,
        2
      );
      contentType = "application/json";
      filename = `analytics-export-${new Date().toISOString().split("T")[0]}.json`;
    } else {
      // PDF export (simplified - would need pdfkit or similar)
      return NextResponse.json({ ok: false, error: "PDF export not yet implemented" }, { status: 501 });
    }

    return new NextResponse(exportData, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`
      }
    });
  } catch (error: any) {
    console.error("Export error:", error);
    return NextResponse.json({ ok: false, error: error.message || "Export failed" }, { status: 500 });
  }
}

