import { NextRequest, NextResponse } from "next/server";
import { getServerComponentClient } from "@/lib/supabase/server";
import { getUserRoleServer } from "@/lib/auth/guards";

export async function GET() {
  try {
    const supabase = getServerComponentClient();

    const { data: events, error } = await supabase
      .from("events_deadlines")
      .select("*")
      .order("date", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ events: events || [] });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getServerComponentClient();
    const role = await getUserRoleServer(supabase);

    if (role !== "founder") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { title, type, description, date, endDate, location, isVirtual, capacity } = body;

    // Get the next order index
    const { data: maxOrder } = await supabase
      .from("events_deadlines")
      .select("order_index")
      .order("order_index", { ascending: false })
      .limit(1);

    const nextOrder = (maxOrder?.[0]?.order_index || 0) + 1;

    const { data: event, error } = await supabase
      .from("events_deadlines")
      .insert({
        title,
        type,
        description,
        date,
        end_date: endDate || null,
        location: location || null,
        is_virtual: isVirtual || false,
        capacity: capacity ? parseInt(capacity) : null,
        order_index: nextOrder,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ event });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
