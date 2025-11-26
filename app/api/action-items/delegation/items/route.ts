import { NextResponse } from "next/server";
import { getServerComponentClient } from "@/lib/supabase/server";
import { getUserFromRequest } from "@/lib/auth/getUserFromRequest";
import { actionItemsPermissions } from "@/lib/permissions/actionItemsPermissions";

export async function GET() {
  try {
    const user = await getUserFromRequest();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get delegatable items for this user
    const delegatableItems = await actionItemsPermissions.getDelegatableItems(
      user.id,
      user.role
    );

    return NextResponse.json({
      items: delegatableItems,
      success: true
    });

  } catch (error) {
    console.error("Error fetching delegatable items:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
