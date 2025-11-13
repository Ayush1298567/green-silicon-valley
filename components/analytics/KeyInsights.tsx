"use client";
import { useEffect, useState } from "react";

export default function KeyInsights() {
  const [text, setText] = useState<string>("Loading insights…");
  useEffect(() => {
    async function run() {
      const r = await fetch("/api/analytics/insights", { cache: "no-store" });
      if (!r.ok) return setText("Insights unavailable.");
      const d = await r.json();
      setText(d?.insights ?? "No insights yet.");
    }
    run();
  }, []);
  return (
    <div className="card p-6">
      <div className="font-semibold mb-2">Key Insights</div>
      <div className="text-sm whitespace-pre-wrap text-gsv-charcoal">{text}</div>
    </div>
  );
}


