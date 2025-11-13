import { NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { getServerComponentClient } from "@/lib/supabase/server";

async function getRole(userId: string | null) {
  if (!userId) return "public";
  const supa = getServerComponentClient();
  const { data } = await supa.from("users").select("role").eq("id", userId).single();
  return data?.role ?? "public";
}

export async function POST(req: Request) {
  // AuthN
  const supa = getServerComponentClient();
  const { data: { session } } = await supa.auth.getSession();
  const role = await getRole(session?.user?.id ?? null);
  if (!["founder","intern"].includes(role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const form = await req.formData();
  const folder = String(form.get("folder") ?? "covers").replace(/[^a-z0-9/_-]/gi, "") || "covers";
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "missing file" }, { status: 400 });

  const admin = getAdminSupabase();
  // Ensure bucket exists (public)
  try {
    await admin.storage.createBucket("blog_covers", { public: true });
  } catch {}

  const ext = (file.type && file.type.includes("png")) ? "png"
    : (file.type && file.type.includes("jpeg")) ? "jpg"
    : "bin";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const { error: upErr } = await admin.storage.from("blog_covers").upload(path, new Uint8Array(arrayBuffer), {
    contentType: file.type || "application/octet-stream",
    upsert: false
  });
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  const { data: pub } = admin.storage.from("blog_covers").getPublicUrl(path);
  return NextResponse.json({ path, publicUrl: pub.publicUrl });
}


