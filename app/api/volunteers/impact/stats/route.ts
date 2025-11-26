import { NextResponse } from "next/server";
import { getServerComponentClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = getServerComponentClient();

    // Get total volunteers (users with role 'volunteer')
    const { count: totalVolunteers } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", "volunteer");

    // Get total presentations from presentations table
    const { count: totalPresentations } = await supabase
      .from("presentations")
      .select("*", { count: "exact", head: true });

    // Calculate total students reached (assuming average of 25 students per presentation)
    // In a real implementation, this would be tracked per presentation
    const totalStudentsReached = (totalPresentations || 0) * 25;

    // Get total volunteer hours from volunteer_impact table
    const { data: impactData } = await supabase
      .from("volunteer_impact")
      .select("value")
      .eq("metric_type", "hours_logged");

    const totalHours = impactData?.reduce((sum, record) => sum + (record.value || 0), 0) || 0;

    const stats = {
      totalVolunteers: totalVolunteers || 0,
      totalPresentations: totalPresentations || 0,
      totalStudentsReached,
      totalHours: Math.round(totalHours),
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Error fetching volunteer stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch volunteer statistics" },
      { status: 500 }
    );
  }
}
