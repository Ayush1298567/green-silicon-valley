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
    const categoryId = searchParams.get('category_id');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const availableOnly = searchParams.get('available_only') === 'true';

    let query = supabase
      .from("equipment_items")
      .select(`
        *,
        equipment_categories(name, maintenance_required)
      `)
      .order("created_at", { ascending: false });

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    if (status) {
      query = query.eq('condition_status', status);
    }

    if (availableOnly) {
      query = query.eq('is_available', true);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,serial_number.ilike.%${search}%`);
    }

    const { data: equipment, error } = await query.limit(100);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: equipment
    });

  } catch (error: any) {
    console.error("Error fetching equipment:", error);
    return NextResponse.json({
      error: "Failed to fetch equipment",
      details: error.message
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const {
      category_id,
      name,
      description,
      serial_number,
      purchase_date,
      purchase_price,
      location,
      notes
    } = body;

    if (!category_id || !name) {
      return NextResponse.json({
        error: "Category ID and name are required"
      }, { status: 400 });
    }

    const equipmentData: any = {
      category_id,
      name,
      description,
      serial_number,
      purchase_date,
      location,
      notes
    };

    if (purchase_price) {
      equipmentData.purchase_price = parseFloat(purchase_price);
      equipmentData.current_value = parseFloat(purchase_price); // Initial value = purchase price
    }

    const { data: equipment, error } = await supabase
      .from("equipment_items")
      .insert(equipmentData)
      .select(`
        *,
        equipment_categories(name, maintenance_required)
      `)
      .single();

    if (error) throw error;

    // Log the addition
    await supabase.from("system_logs").insert({
      actor_id: session.user.id,
      action_type: "equipment_added",
      resource_type: "equipment",
      resource_id: equipment.id,
      details: {
        name: equipment.name,
        category_id: equipment.category_id,
        purchase_price: equipment.purchase_price
      },
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    });

    return NextResponse.json({
      success: true,
      data: equipment,
      message: "Equipment added successfully"
    });

  } catch (error: any) {
    console.error("Error adding equipment:", error);
    return NextResponse.json({
      error: "Failed to add equipment",
      details: error.message
    }, { status: 500 });
  }
}
