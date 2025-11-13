import { NextResponse } from "next/server";
import { getBaseUrl } from "@/lib/utils/base-url";

export async function GET() {
  const res = await fetch(`${getBaseUrl()}/api/reports/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "monthly" })
  }).catch(() => null);
  if (!res || !res.ok) {
    return NextResponse.json({ ok: false, error: "Failed to generate" }, { status: 500 });
  }
  const data = await res.json();
  return NextResponse.json(data);
}


