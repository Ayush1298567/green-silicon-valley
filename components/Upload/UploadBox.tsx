"use client";
import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function UploadBox() {
  const [status, setStatus] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const supabase = createClientComponentClient();

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setStatus("Uploading...");
    try {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      const userId = user?.id ?? "anon";
      const path = `${userId}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("resources")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (uploadError) throw uploadError;
      await supabase.from("resources").insert({
        filename: path,
        file_type: file.type,
        uploader_id: user?.id ?? null
      });
      setStatus("Uploaded!");
    } catch (err: any) {
      setStatus(`Error: ${err?.message ?? "Upload failed"}`);
    } finally {
      setUploading(false);
      e.currentTarget.value = "";
    }
  }

  return (
    <div>
      <input type="file" onChange={onFileChange} disabled={uploading} />
      {status && <p className="text-sm text-gsv-gray mt-2">{status}</p>}
    </div>
  );
}


