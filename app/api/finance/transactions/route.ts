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
    const limit = parseInt(searchParams.get('limit') || '50');
    const categoryId = searchParams.get('category_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    let query = supabase
      .from("budget_transactions")
      .select(`
        *,
        budget_categories(name),
        created_by_user:users!budget_transactions_created_by_fkey(id, name, email)
      `)
      .order("transaction_date", { ascending: false })
      .limit(limit);

    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }

    if (startDate) {
      query = query.gte("transaction_date", startDate);
    }

    if (endDate) {
      query = query.lte("transaction_date", endDate);
    }

    const { data: transactions, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: transactions
    });

  } catch (error: any) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json({
      error: "Failed to fetch transactions",
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
      amount,
      description,
      transaction_type,
      transaction_date,
      reference_type,
      reference_id,
      receipt_url
    } = body;

    if (!category_id || !amount || !description || !transaction_type) {
      return NextResponse.json({
        error: "Category ID, amount, description, and transaction type are required"
      }, { status: 400 });
    }

    // Validate transaction type
    if (!['expense', 'income', 'transfer'].includes(transaction_type)) {
      return NextResponse.json({
        error: "Invalid transaction type"
      }, { status: 400 });
    }

    // Check if user has approval permissions for expenses over certain amount
    const numAmount = parseFloat(amount);
    const requiresApproval = transaction_type === 'expense' && numAmount > 500;

    const transactionData: any = {
      category_id,
      amount: numAmount,
      description,
      transaction_type,
      transaction_date: transaction_date || new Date().toISOString().split('T')[0],
      reference_type,
      reference_id,
      receipt_url,
      created_by: session.user.id
    };

    if (requiresApproval) {
      transactionData.approved_by = session.user.id;
      transactionData.approved_at = new Date().toISOString();
    }

    const { data: transaction, error } = await supabase
      .from("budget_transactions")
      .insert(transactionData)
      .select(`
        *,
        budget_categories(name)
      `)
      .single();

    if (error) throw error;

    // Log the transaction
    await supabase.from("system_logs").insert({
      actor_id: session.user.id,
      action_type: "budget_transaction_created",
      resource_type: "budget_transaction",
      resource_id: transaction.id,
      details: {
        amount: numAmount,
        type: transaction_type,
        category_id,
        description
      },
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    });

    return NextResponse.json({
      success: true,
      data: transaction,
      message: "Transaction recorded successfully"
    });

  } catch (error: any) {
    console.error("Error creating transaction:", error);
    return NextResponse.json({
      error: "Failed to create transaction",
      details: error.message
    }, { status: 500 });
  }
}
