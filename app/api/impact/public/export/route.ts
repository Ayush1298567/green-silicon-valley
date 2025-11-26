import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    // Gather comprehensive impact data for export
    const exportData = {
      generatedAt: new Date().toISOString(),
      period: "All Time",
      summary: {
        totalVolunteers: 0,
        totalPresentations: 0,
        totalSchools: 0,
        totalHours: 0,
        totalCountries: 0,
        activeChapters: 0
      },
      chapters: [],
      presentations: [],
      volunteers: [],
      schools: []
    };

    // Get summary statistics
    const { count: volunteerCount } = await supabase
      .from("volunteers")
      .select("*", { count: "exact", head: true });

    const { count: presentationCount } = await supabase
      .from("presentations")
      .select("*", { count: "exact", head: true });

    const { data: schoolsData } = await supabase
      .from("presentations")
      .select("schools(id, name, district)")
      .not("schools", "is", null);

    const uniqueSchools = new Set();
    schoolsData?.forEach(p => {
      if (p.schools?.id) uniqueSchools.add(p.schools.id);
    });

    const { data: hoursData } = await supabase
      .from("volunteer_hours")
      .select("hours_logged")
      .eq("status", "verified");

    const { data: chapters } = await supabase
      .from("chapters")
      .select("country")
      .eq("status", "active");

    const uniqueCountries = new Set(chapters?.map(c => c.country));

    exportData.summary = {
      totalVolunteers: volunteerCount || 0,
      totalPresentations: presentationCount || 0,
      totalSchools: uniqueSchools.size,
      totalHours: hoursData?.reduce((sum, h) => sum + (h.hours_logged || 0), 0) || 0,
      totalCountries: uniqueCountries.size,
      activeChapters: chapters?.length || 0
    };

    // Generate simple text report (in a real implementation, this would generate a PDF)
    const reportContent = `
GREEN SILICON VALLEY - IMPACT REPORT
Generated: ${new Date().toLocaleDateString()}

EXECUTIVE SUMMARY
=================
Total Volunteers: ${exportData.summary.totalVolunteers.toLocaleString()}
Total Presentations: ${exportData.summary.totalPresentations.toLocaleString()}
Schools Reached: ${exportData.summary.totalSchools.toLocaleString()}
Volunteer Hours: ${exportData.summary.totalHours.toLocaleString()}
Countries Active: ${exportData.summary.totalCountries}
Active Chapters: ${exportData.summary.activeChapters}

IMPACT METRICS
==============
- STEM Education Reach: ${exportData.summary.totalSchools} schools impacted
- Volunteer Engagement: ${exportData.summary.totalVolunteers} active educators
- Content Delivery: ${exportData.summary.totalPresentations} interactive sessions
- Time Investment: ${exportData.summary.totalHours} hours of educational impact
- Global Presence: Active in ${exportData.summary.totalCountries} countries

PROGRAM HIGHLIGHTS
==================
- Interactive STEM presentations covering computer science, engineering, and environmental science
- Hands-on activities and demonstrations for K-12 students
- Volunteer training and professional development opportunities
- International chapter network for global STEM education expansion
- Partnerships with schools and educational institutions worldwide

FUNDING & GRANTS OPPORTUNITIES
==============================
This impact report demonstrates measurable educational outcomes and community engagement.
Green Silicon Valley is well-positioned for grant applications and philanthropic partnerships.

For more detailed analytics and custom reports, please contact our impact team.
    `;

    // Return as downloadable text file (in production, this would be a PDF)
    return new NextResponse(reportContent, {
      headers: {
        "Content-Type": "text/plain",
        "Content-Disposition": `attachment; filename="gsv-impact-report-${new Date().toISOString().split('T')[0]}.txt"`
      }
    });

  } catch (error: any) {
    console.error("Error generating impact report:", error);
    return NextResponse.json({ ok: false, error: "Failed to generate report" }, { status: 500 });
  }
}
