import { NextResponse } from "next/server";

export async function GET() {
  const url = `${process.env.OLLAMA_URL || "http://localhost:11434"}/api/tags`;
  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error(String(r.status));
    const data = await r.json();
    const models = (data?.models ?? []).map((m: any) => m.name).filter(Boolean);
    return NextResponse.json({ ok: true, models });
  } catch {
    // Fallback
    return NextResponse.json({
      ok: true,
      models: ["llama3", "mistral", "phi3", "tinyllama"]
    });
  }
}


