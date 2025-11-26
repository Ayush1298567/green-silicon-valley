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

    // Get permissions for this user
    const permissions = await actionItemsPermissions.getUserPermissions(
      user.id,
      user.role
    );

    return NextResponse.json({
      permissions,
      success: true
    });

  } catch (error) {
    console.error("Error fetching permissions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
