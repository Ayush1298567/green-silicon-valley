import { NextRequest, NextResponse } from 'next/server';
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { itemId } = params;

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { completed } = body;

    if (typeof completed !== 'boolean') {
      return NextResponse.json(
        { error: 'completed must be a boolean' },
        { status: 400 }
      );
    }

    // Update the specific checklist item
    const { data: updatedItem, error } = await supabase
      .from('intern_onboarding_checklist')
      .update({
        completed,
        updated_at: new Date().toISOString()
      })
      .eq('intern_id', user.id)
      .eq('item_id', itemId)
      .select()
      .single();

    if (error) {
      console.error('Error updating checklist item:', error);
      return NextResponse.json(
        { error: 'Failed to update checklist item' },
        { status: 500 }
      );
    }

    if (!updatedItem) {
      return NextResponse.json(
        { error: 'Checklist item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ item: updatedItem });

  } catch (error) {
    console.error('Error in interns/onboarding/checklist/[itemId] PATCH:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
