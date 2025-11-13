import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { getUserRoleServer } from "@/lib/auth/guards";

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { searchParams } = new URL(req.url);
  const pageId = searchParams.get("pageId");

  if (!pageId) {
    return NextResponse.json({ ok: false, error: "Page ID required" }, { status: 400 });
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    // Check if page is locked using the database function
    const { data: lockStatus, error } = await supabase
      .rpc('is_page_locked', { page_id_param: pageId, current_user_id: session.user.id });

    if (error) throw error;

    return NextResponse.json({
      ok: true,
      lockStatus: lockStatus,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("Error checking edit lock:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const role = await getUserRoleServer(supabase as any);

  if (role !== "founder" && role !== "intern") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { pageId, action } = body; // action: 'acquire', 'release', 'extend', 'force_release'

    if (!pageId || !action) {
      return NextResponse.json({ ok: false, error: "Page ID and action required" }, { status: 400 });
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    switch (action) {
      case 'acquire':
        return await acquireLock(supabase, pageId, userId);
      case 'release':
        return await releaseLock(supabase, pageId, userId);
      case 'extend':
        return await extendLock(supabase, pageId, userId);
      case 'force_release':
        if (role !== 'founder') {
          return NextResponse.json({ ok: false, error: "Only founders can force release locks" }, { status: 403 });
        }
        return await forceReleaseLock(supabase, pageId, userId);
      default:
        return NextResponse.json({ ok: false, error: "Invalid action" }, { status: 400 });
    }

  } catch (error: any) {
    console.error("Error managing edit lock:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

async function acquireLock(supabase: any, pageId: string, userId: string) {
  // First check if someone else has the lock
  const { data: existingLock } = await supabase
    .rpc('is_page_locked', { page_id_param: pageId, current_user_id: userId });

  if (existingLock?.is_locked && !existingLock?.can_edit) {
    return NextResponse.json({
      ok: false,
      error: "Page is currently locked by another user",
      lockInfo: existingLock.lock_info
    }, { status: 409 });
  }

  // Get user info for the lock
  const { data: userInfo } = await supabase
    .from('users')
    .select('name')
    .eq('id', userId)
    .single();

  // Acquire or update the lock
  const { data, error } = await supabase
    .from('edit_locks')
    .upsert({
      page_id: pageId,
      user_id: userId,
      user_name: userInfo?.name || 'Unknown User',
      locked_at: new Date().toISOString(),
      last_activity: new Date().toISOString(),
      is_active: true,
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
    }, {
      onConflict: 'page_id'
    })
    .select()
    .single();

  if (error) throw error;

  return NextResponse.json({
    ok: true,
    message: "Lock acquired successfully",
    lock: data
  });
}

async function releaseLock(supabase: any, pageId: string, userId: string) {
  const { error } = await supabase
    .from('edit_locks')
    .delete()
    .eq('page_id', pageId)
    .eq('user_id', userId);

  if (error) throw error;

  return NextResponse.json({
    ok: true,
    message: "Lock released successfully"
  });
}

async function extendLock(supabase: any, pageId: string, userId: string) {
  const { data, error } = await supabase
    .from('edit_locks')
    .update({
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      last_activity: new Date().toISOString()
    })
    .eq('page_id', pageId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;

  return NextResponse.json({
    ok: true,
    message: "Lock extended successfully",
    lock: data
  });
}

async function forceReleaseLock(supabase: any, pageId: string, userId: string) {
  // Log the force release action
  await supabase.from('system_logs').insert({
    event_type: 'edit_lock_force_release',
    description: JSON.stringify({
      page_id: pageId,
      released_by: userId,
      timestamp: new Date().toISOString()
    })
  });

  const { error } = await supabase
    .from('edit_locks')
    .delete()
    .eq('page_id', pageId);

  if (error) throw error;

  return NextResponse.json({
    ok: true,
    message: "Lock force released successfully"
  });
}
