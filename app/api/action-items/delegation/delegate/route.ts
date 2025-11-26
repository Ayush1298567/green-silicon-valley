import { NextResponse } from "next/server";
import { getServerComponentClient } from "@/lib/supabase/server";
import { getUserFromRequest } from "@/lib/auth/getUserFromRequest";
import { actionItemsPermissions } from "@/lib/permissions/actionItemsPermissions";

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { itemId, userId } = body;

    if (!itemId || !userId) {
      return NextResponse.json({ error: "Item ID and User ID are required" }, { status: 400 });
    }

    // Delegate the item
    const success = await actionItemsPermissions.delegateItem(
      itemId,
      user.id,
      user.role,
      userId
    );

    if (!success) {
      return NextResponse.json({ error: "Failed to delegate item" }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      message: "Item delegated successfully"
    });

  } catch (error) {
    console.error("Error delegating item:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
