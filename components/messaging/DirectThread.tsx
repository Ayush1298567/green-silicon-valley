"use client";
import { useCallback, useMemo, useRef, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import MessageList from "./MessageList";
import MessageComposer from "./MessageComposer";
import { useRealtimeDirectMessages } from "@/lib/useRealtimeDirectMessages";
import { useToast } from "@/components/Toast";
import type { ChannelMessage } from "./ChannelThread";

interface DirectThreadProps {
  currentUserId: string;
  peerId: string;
  initialMessages: ChannelMessage[];
  senderDirectory: Array<[string, string | null]>;
}

export default function DirectThread({ currentUserId, peerId, initialMessages, senderDirectory }: DirectThreadProps) {
  const supabase = useMemo(() => createClientComponentClient(), []);
  const { showToast } = useToast();
  const [messages, setMessages] = useState<ChannelMessage[]>(() => initialMessages);
  const [sending, setSending] = useState(false);
  const senderCacheRef = useRef(new Map<string, string | null>(senderDirectory));

  const enrichMessage = useCallback(
    async (msg: ChannelMessage): Promise<ChannelMessage> => {
      if (!msg.sender_id) return { ...msg, sender_name: msg.sender_name ?? "System" };
      const cached = senderCacheRef.current.get(msg.sender_id);
      if (typeof cached === "string") {
        return { ...msg, sender_name: cached };
      }
      const { data } = await supabase.from("users").select("name").eq("id", msg.sender_id).maybeSingle();
      const senderName = data?.name ?? (msg.sender_id === currentUserId ? "You" : "Member");
      senderCacheRef.current.set(msg.sender_id, senderName);
      return { ...msg, sender_name: senderName };
    },
    [currentUserId, supabase]
  );

  useRealtimeDirectMessages({
    currentUserId,
    peerId,
    onInsert: async (message) => {
      const enriched = await enrichMessage(message as ChannelMessage);
      setMessages((prev) => {
        if (prev.some((m) => m.id === enriched.id)) return prev;
        return [...prev, enriched].sort((a, b) => a.created_at.localeCompare(b.created_at));
      });
    },
    onUpdate: async (message) => {
      const enriched = await enrichMessage(message as ChannelMessage);
      setMessages((prev) => prev.map((m) => (m.id === enriched.id ? enriched : m)));
    },
    onDelete: (message) => {
      setMessages((prev) => prev.filter((m) => m.id !== (message as ChannelMessage).id));
    }
  });

  const handleSend = useCallback(
    async (text: string) => {
      try {
        setSending(true);
        const res = await fetch("/api/messaging/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: text, recipientId: peerId })
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error ?? "Failed to send message");
        }
      } catch (error: any) {
        showToast(error.message ?? "Unable to send message", "error");
      } finally {
        setSending(false);
      }
    },
    [peerId, showToast]
  );

  return (
    <div className="mt-6 space-y-4">
      <div className="rounded-2xl border border-gsv-slate-200 bg-white/70 backdrop-blur-sm p-4 shadow-inner-soft">
        {messages.length > 0 ? (
          <MessageList messages={messages} />
        ) : (
          <div className="py-16 text-center text-gsv-gray">
            <div className="text-4xl mb-3">✉️</div>
            <p className="text-sm font-medium">Start a private conversation.</p>
          </div>
        )}
      </div>
      <div className="rounded-2xl border border-gsv-slate-200 bg-white/80 backdrop-blur-sm p-4 shadow-soft">
        <MessageComposer onSend={handleSend} sending={sending} />
      </div>
    </div>
  );
}
