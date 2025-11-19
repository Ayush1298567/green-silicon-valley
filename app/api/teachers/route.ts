import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { getUserRoleServer } from "@/lib/auth/guards";

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = await getUserRoleServer(supabase);
    if (!['founder', 'intern'].includes(role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const search = searchParams.get('search');

    let query = supabase
      .from("schools")
      .select(`
        *,
        presentations(count)
      `)
      .order("created_at", { ascending: false });

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('application_status', status);
    }

    if (priority && priority !== 'all') {
      query = query.eq('priority', priority);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,city.ilike.%${search}%`);
    }

    const { data: teachers, error } = await query.limit(100);

    if (error) throw error;

    // Process the data to include presentation counts
    const processedTeachers = teachers?.map(teacher => ({
      ...teacher,
      total_presentations_hosted: Array.isArray(teacher.presentations)
        ? teacher.presentations.length
        : 0
    })) || [];

    return NextResponse.json({
      success: true,
      data: processedTeachers
    });

  } catch (error: any) {
    console.error("Error fetching teachers:", error);
    return NextResponse.json({
      error: "Failed to fetch teacher applications",
      details: error.message
    }, { status: 500 });
  }
}
