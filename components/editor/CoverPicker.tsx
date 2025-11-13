"use client";
import { useState } from "react";

type Props = {
  name: string;
  defaultUrl?: string;
};

export default function CoverPicker({ name, defaultUrl }: Props) {
  const [url, setUrl] = useState<string | undefined>(defaultUrl);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", f);
      const res = await fetch("/api/blog/cover/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Upload failed");
      setUrl(data.publicUrl);
    } catch (err: any) {
      setError(err.message ?? "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-3">
        <input type="file" accept="image/*" onChange={onPick} disabled={busy} />
        {busy ? <span className="text-xs text-gsv-gray">Uploading…</span> : null}
      </div>
      {error ? <div className="text-xs text-red-600">{error}</div> : null}
      {url ? (
        <div className="border rounded p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="Cover preview" className="w-full max-h-48 object-cover rounded" />
        </div>
      ) : null}
      <input type="hidden" name={name} value={url ?? ""} />
    </div>
  );
}


