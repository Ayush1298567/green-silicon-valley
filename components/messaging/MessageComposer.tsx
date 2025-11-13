"use client";
import { useState } from "react";

export default function MessageComposer({
  onSend,
  sending = false
}: {
  onSend: (text: string) => Promise<void> | void;
  sending?: boolean;
}) {
  const [text, setText] = useState("");
  const [localLoading, setLocalLoading] = useState(false);

  const isBusy = sending || localLoading;

  async function submit() {
    const t = text.trim();
    if (!t || isBusy) return;
    setLocalLoading(true);
    try {
      await onSend(t);
      setText("");
    } finally {
      setLocalLoading(false);
    }
  }

  return (
    <div className="flex gap-2 items-start">
      <textarea
        className="border rounded-lg px-3 py-2 flex-1 min-h-[60px] focus:border-gsv-green focus:ring-2 focus:ring-gsv-green/40 disabled:bg-gray-100"
        placeholder="Write a message (Ctrl/Cmd+Enter to send)"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
        }}
        disabled={isBusy}
      />
      <button
        className="rounded-lg bg-gsv-green px-4 py-2 text-white font-semibold shadow-sm hover:bg-gsv-greenDark disabled:opacity-60 disabled:cursor-not-allowed transition-all"
        onClick={submit}
        disabled={isBusy}
      >
        {isBusy ? "Sending..." : "Send"}
      </button>
    </div>
  );
}


