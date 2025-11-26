import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      quantity_requested,
      priority,
      scheduled_pickup,
      pickup_location,
      notes
    } = body;

    if (!quantity_requested || quantity_requested <= 0) {
      return NextResponse.json({ ok: false, error: "Valid quantity is required" }, { status: 400 });
    }

    const { data: request, error } = await supabase
      .from("kit_requests")
      .insert({
        kit_id: params.id,
        requested_by: session.user.id,
        quantity_requested,
        priority: priority || "medium",
        scheduled_pickup: scheduled_pickup ? new Date(scheduled_pickup).toISOString() : null,
        pickup_location,
        notes
      })
      .select(`
        *,
        activity_kits (
          name,
          location
        )
      `)
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    // Create an action item for the request
    await supabase.from("action_items").insert({
      title: `Kit restock request: ${request.activity_kits?.name}`,
      description: `Restock request for ${quantity_requested} units. Priority: ${priority}`,
      type: "supply_request",
      priority: priority === "urgent" ? "high" : priority === "high" ? "medium" : "low",
      assigned_to: [session.user.id], // Assign to request creator initially
      due_date: scheduled_pickup ? new Date(scheduled_pickup).toISOString() : null,
      metadata: {
        kit_request_id: request.id,
        kit_id: params.id,
        quantity_requested
      }
    });

    return NextResponse.json({ ok: true, request });

  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
