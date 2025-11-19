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
    const fiscalYear = searchParams.get('fiscal_year') || new Date().getFullYear();

    const { data: categories, error } = await supabase
      .from("budget_categories")
      .select("*")
      .eq("fiscal_year", fiscalYear)
      .order("name");

    if (error) throw error;

    // Calculate current spending for each category
    const categoriesWithSpending = await Promise.all(
      categories.map(async (category) => {
        const { data: transactions } = await supabase
          .from("budget_transactions")
          .select("amount, transaction_type")
          .eq("category_id", category.id)
          .eq("EXTRACT(YEAR FROM transaction_date)", fiscalYear);

        const spent = transactions?.reduce((total, t) => {
          if (t.transaction_type === 'expense') return total + Number(t.amount);
          if (t.transaction_type === 'income') return total - Number(t.amount);
          return total;
        }, 0) || 0;

        return {
          ...category,
          current_spent: spent,
          remaining_budget: Number(category.budget_limit) - spent
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: categoriesWithSpending
    });

  } catch (error: any) {
    console.error("Error fetching budget categories:", error);
    return NextResponse.json({
      error: "Failed to fetch budget categories",
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
    const { name, description, budget_limit, parent_category_id } = body;

    if (!name || !budget_limit) {
      return NextResponse.json({
        error: "Name and budget limit are required"
      }, { status: 400 });
    }

    const { data: category, error } = await supabase
      .from("budget_categories")
      .insert({
        name,
        description,
        budget_limit: parseFloat(budget_limit),
        parent_category_id,
        fiscal_year: new Date().getFullYear(),
        created_by: session.user.id
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: category,
      message: "Budget category created successfully"
    });

  } catch (error: any) {
    console.error("Error creating budget category:", error);
    return NextResponse.json({
      error: "Failed to create budget category",
      details: error.message
    }, { status: 500 });
  }
}
