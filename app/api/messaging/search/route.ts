import { NextResponse } from "next/server";
import { searchMessages } from "@/lib/messaging";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { isChannelMember } from "@/lib/messaging";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? undefined;
  const channelId = url.searchParams.get("channelId") ?? undefined;
  const senderId = url.searchParams.get("senderId") ?? undefined;
  const after = url.searchParams.get("after") ?? undefined;
  const before = url.searchParams.get("before") ?? undefined;

  // Authorization: if channelId provided ensure membership
  if (channelId) {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    const ok = await isChannelMember(supabase as any, channelId, session.user.id);
    if (!ok) return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const res = await searchMessages({ q, channelId, senderId, after, before });
  if ((res as any).error) return NextResponse.json(res, { status: 400 });
  return NextResponse.json({ ok: true, ...res });
}


