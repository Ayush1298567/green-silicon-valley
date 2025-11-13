"use client";
import { useState } from "react";

export default function ReportGenerator() {
  const [status, setStatus] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);

  async function generate(type: "weekly" | "monthly") {
    setStatus(`Generating ${type} report...`);
    setUrl(null);
    const resp = await fetch("/api/reports/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type })
    });
    const data = await resp.json();
    if (data?.ok) {
      setUrl(data.url ?? null);
      setStatus("Done.");
    } else {
      setStatus(`Error: ${data?.error ?? "Unknown error"}`);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button className="rounded-lg bg-gsv-green px-4 py-2 text-white" onClick={() => generate("monthly")}>
          Download Monthly Report (PDF)
        </button>
        <button className="rounded-lg border px-4 py-2" onClick={() => generate("weekly")}>
          Generate Weekly (PDF)
        </button>
      </div>
      {status && <p className="text-sm text-gsv-gray">{status}</p>}
      {url && (
        <a className="text-gsv-green underline text-sm" href={url} target="_blank" rel="noreferrer">
          Open latest report
        </a>
      )}
    </div>
  );
}

