import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    // Get presentation topics and their counts
    // This is a simplified version - in a real implementation,
    // you'd have a topics field in presentations table
    const topics = [
      { topic: "Computer Science", count: 245, percentage: 32, color: "bg-blue-500", icon: "Cpu" },
      { topic: "Environmental Science", count: 189, percentage: 25, color: "bg-green-500", icon: "Globe" },
      { topic: "Engineering", count: 134, percentage: 18, color: "bg-orange-500", icon: "Wrench" },
      { topic: "Mathematics", count: 98, percentage: 13, color: "bg-purple-500", icon: "BookOpen" },
      { topic: "Physics", count: 67, percentage: 9, color: "bg-red-500", icon: "Zap" },
      { topic: "Chemistry", count: 32, percentage: 4, color: "bg-yellow-500", icon: "TestTube" }
    ];

    return NextResponse.json({ ok: true, topics });

  } catch (error: any) {
    console.error("Error fetching topics data:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
