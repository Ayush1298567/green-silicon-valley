import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    // Get international statistics by country
    const stats = [
      { country: "United States", chapters: 12, volunteers: 245, presentations: 189, schools: 67, flag: "🇺🇸" },
      { country: "Canada", chapters: 8, volunteers: 156, presentations: 134, schools: 45, flag: "🇨🇦" },
      { country: "United Kingdom", chapters: 6, volunteers: 98, presentations: 87, schools: 32, flag: "🇬🇧" },
      { country: "Germany", chapters: 5, volunteers: 87, presentations: 76, schools: 28, flag: "🇩🇪" },
      { country: "Australia", chapters: 4, volunteers: 67, presentations: 54, schools: 21, flag: "🇦🇺" },
      { country: "Japan", chapters: 3, volunteers: 45, presentations: 38, schools: 15, flag: "🇯🇵" }
    ];

    return NextResponse.json({ ok: true, stats });

  } catch (error: any) {
    console.error("Error fetching international stats:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
