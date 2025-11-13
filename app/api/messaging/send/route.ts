import { NextResponse } from "next/server";
import { sendMessage } from "@/lib/messaging";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { content, channelId, recipientId, replyToId } = body;
  const res = await sendMessage({ content, channelId, recipientId, replyToId });
  if ((res as any).error) return NextResponse.json(res, { status: 400 });
  return NextResponse.json({ ok: true });
}


