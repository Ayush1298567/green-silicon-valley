import { NextResponse } from "next/server";
import { getServerComponentClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = getServerComponentClient();

    // Get schools with their locations and presentation history
    const { data: schools, error } = await supabase
      .from("schools")
      .select(`
        id,
        name,
        school_district,
        total_students,
        school_locations (
          latitude,
          longitude,
          address,
          city,
          state,
          zip_code
        ),
        presentations (
          id,
          presentation_date,
          status
        )
      `)
      .not('school_locations', 'is', null);

    if (error) throw error;

    // Process the data to calculate presentation counts and format for the frontend
    const formattedSchools = schools?.map(school => {
      const completedPresentations = school.presentations?.filter(p => p.status === 'completed') || [];
      const lastPresentation = completedPresentations.length > 0
        ? completedPresentations.sort((a, b) =>
            new Date(b.presentation_date).getTime() - new Date(a.presentation_date).getTime()
          )[0].presentation_date
        : school.created_at;

      // Determine grade levels based on school type (simplified logic)
      const gradeLevels = [];
      if (school.name.toLowerCase().includes('elementary')) {
        gradeLevels.push('3-5');
      }
      if (school.name.toLowerCase().includes('middle') || school.name.toLowerCase().includes('junior')) {
        gradeLevels.push('6-8');
      }
      if (school.name.toLowerCase().includes('high')) {
        gradeLevels.push('9-12');
      }
      // Default to all levels if not specified
      if (gradeLevels.length === 0) {
        gradeLevels.push('3-5', '6-8', '9-12');
      }

      return {
        id: school.id,
        name: school.name,
        city: school.school_locations?.city || 'Unknown',
        state: school.school_locations?.state || 'CA',
        latitude: school.school_locations?.latitude || 0,
        longitude: school.school_locations?.longitude || 0,
        presentationsCount: completedPresentations.length,
        lastPresentation: lastPresentation,
        gradeLevels,
        totalStudents: school.total_students || 0,
      };
    }) || [];

    return NextResponse.json({ schools: formattedSchools });
  } catch (error) {
    console.error("Error fetching school locations:", error);
    return NextResponse.json(
      { error: "Failed to fetch school locations" },
      { status: 500 }
    );
  }
}
