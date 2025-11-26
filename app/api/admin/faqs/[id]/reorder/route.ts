import { NextRequest, NextResponse } from "next/server";
import { getServerComponentClient } from "@/lib/supabase/server";
import { getUserRoleServer } from "@/lib/auth/guards";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getServerComponentClient();
    const role = await getUserRoleServer(supabase);

    if (role !== "founder") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { direction } = body; // 'up' or 'down'

    // Get current FAQ
    const { data: currentFaq, error: fetchError } = await supabase
      .from("faq_items")
      .select("id, order_index, category")
      .eq("id", id)
      .single();

    if (fetchError || !currentFaq) throw fetchError;

    // Find the adjacent FAQ in the same category
    const adjacentOrder = direction === 'up'
      ? currentFaq.order_index - 1
      : currentFaq.order_index + 1;

    const { data: adjacentFaq, error: adjacentError } = await supabase
      .from("faq_items")
      .select("id, order_index")
      .eq("category", currentFaq.category)
      .eq("order_index", adjacentOrder)
      .single();

    if (adjacentError || !adjacentFaq) {
      // No adjacent item to swap with
      return NextResponse.json({ success: true });
    }

    // Swap the order indices
    const { error: updateError1 } = await supabase
      .from("faq_items")
      .update({ order_index: adjacentFaq.order_index })
      .eq("id", currentFaq.id);

    const { error: updateError2 } = await supabase
      .from("faq_items")
      .update({ order_index: currentFaq.order_index })
      .eq("id", adjacentFaq.id);

    if (updateError1 || updateError2) throw updateError1 || updateError2;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering FAQ:", error);
    return NextResponse.json(
      { error: "Failed to reorder FAQ" },
      { status: 500 }
    );
  }
}
