import { NextRequest, NextResponse } from "next/server";
import { getServerComponentClient } from "@/lib/supabase/server";
import { getUserRoleServer } from "@/lib/auth/guards";

export async function GET() {
  try {
    const supabase = getServerComponentClient();

    const { data: faqs, error } = await supabase
      .from("faq_items")
      .select("*")
      .order("order_index", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ faqs: faqs || [] });
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return NextResponse.json(
      { error: "Failed to fetch FAQs" },
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
    const { question, answer, category, isPublished } = body;

    // Get the next order index for this category
    const { data: maxOrder } = await supabase
      .from("faq_items")
      .select("order_index")
      .eq("category", category)
      .order("order_index", { ascending: false })
      .limit(1);

    const nextOrder = (maxOrder?.[0]?.order_index || 0) + 1;

    const { data: faq, error } = await supabase
      .from("faq_items")
      .insert({
        question,
        answer,
        category,
        is_published: isPublished,
        order_index: nextOrder,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ faq });
  } catch (error) {
    console.error("Error creating FAQ:", error);
    return NextResponse.json(
      { error: "Failed to create FAQ" },
      { status: 500 }
    );
  }
}
