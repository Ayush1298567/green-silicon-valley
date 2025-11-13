"use client";
import { useEffect, useRef } from "react";

export default function MessageList({ messages }: { messages: any[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: "smooth" });
  }, [messages?.length]);
  return (
    <div ref={ref} className="h-[60vh] overflow-auto space-y-3">
      {messages.map((m) => (
        <div key={m.id} className="flex gap-3">
          <div className="flex-1">
            <div className="text-sm">
              <span className="font-semibold">{m.sender_name ?? "User"}</span>{" "}
              <span className="text-xs text-gsv-gray">{new Date(m.created_at).toLocaleString()}</span>
              {m.edited_at ? <span className="text-xs text-gsv-gray ml-2">(edited)</span> : null}
            </div>
            <div className="text-gsv-charcoal whitespace-pre-wrap">{m.content}</div>
            {Array.isArray(m.attachments) && m.attachments.length > 0 ? (
              <div className="mt-1 flex gap-2 flex-wrap">
                {m.attachments.map((a: any, i: number) => (
                  <a key={i} className="text-sm underline text-gsv-green" href={a.url} target="_blank" rel="noreferrer">
                    {a.filename ?? "attachment"}
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}


