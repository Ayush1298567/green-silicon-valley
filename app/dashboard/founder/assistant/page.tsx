"use client";
import { useState } from "react";

export default function KnowledgeAssistantPage() {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send() {
    const text = input.trim();
    if (!text) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setLoading(true);
    try {
      const res = await fetch("/api/assistant/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: data.reply ?? "No reply." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-14">
      <h1 className="text-3xl font-bold">Knowledge Assistant</h1>
      <p className="mt-3 text-gsv-gray">
        Ask operational questions or update rules. Example: &quot;Add new chapter eligibility
        rule requiring quarterly reports&quot;.
      </p>
      <div className="card p-6 mt-6 max-w-3xl">
        <div className="space-y-4 max-h-[50vh] overflow-auto">
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "text-gsv-charcoal" : "text-gsv-gray"}>
              <span className="font-semibold">{m.role === "user" ? "You" : "Assistant"}:</span>{" "}
              <span>{m.content}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <input
            className="border rounded-lg px-3 py-2 flex-1"
            placeholder="Type your question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
          <button
            className="rounded-lg bg-gsv-green px-4 py-2 text-white"
            onClick={send}
            disabled={loading}
          >
            {loading ? "Thinking..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}


