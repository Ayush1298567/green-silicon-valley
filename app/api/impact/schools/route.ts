import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    // Get schools with presentation counts and locations
    // This is a simplified version - in a real implementation,
    // you'd join with actual school location data
    const schools = [
      {
        id: "1",
        name: "Lincoln High School",
        latitude: 37.7749,
        longitude: -122.4194,
        country: "USA",
        presentationsCount: 12,
        lastPresentation: "2024-01-15"
      },
      {
        id: "2",
        name: "Toronto District School",
        latitude: 43.6532,
        longitude: -79.3832,
        country: "Canada",
        presentationsCount: 8,
        lastPresentation: "2024-01-20"
      },
      {
        id: "3",
        name: "London Academy",
        latitude: 51.5074,
        longitude: -0.1278,
        country: "UK",
        presentationsCount: 15,
        lastPresentation: "2024-01-10"
      },
      {
        id: "4",
        name: "Berlin Technical School",
        latitude: 52.5200,
        longitude: 13.4050,
        country: "Germany",
        presentationsCount: 6,
        lastPresentation: "2024-01-25"
      },
      {
        id: "5",
        name: "Tokyo International School",
        latitude: 35.6762,
        longitude: 139.6503,
        country: "Japan",
        presentationsCount: 9,
        lastPresentation: "2024-01-18"
      },
      {
        id: "6",
        name: "Sydney Grammar School",
        latitude: -33.8688,
        longitude: 151.2093,
        country: "Australia",
        presentationsCount: 11,
        lastPresentation: "2024-01-22"
      }
    ];

    return NextResponse.json({ ok: true, schools });

  } catch (error: any) {
    console.error("Error fetching school locations:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
