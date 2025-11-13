"use client";
import { useCallback, useMemo, useRef, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import MessageList from "./MessageList";
import MessageComposer from "./MessageComposer";
import { useRealtimeMessages } from "@/lib/useRealtimeMessages";
import { useToast } from "@/components/Toast";

export interface ChannelMessage {
  id: string;
  content: string;
  created_at: string;
  edited_at?: string | null;
  attachments?: any[] | null;
  sender_id: string | null;
  sender_name?: string | null;
}

interface ChannelThreadProps {
  channelId: string;
  initialMessages: ChannelMessage[];
  senderDirectory: Array<[string, string | null]>;
}

export default function ChannelThread({ channelId, initialMessages, senderDirectory }: ChannelThreadProps) {
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
      const senderName = data?.name ?? "Member";
      senderCacheRef.current.set(msg.sender_id, senderName);
      return { ...msg, sender_name: senderName };
    },
    [supabase]
  );

  useRealtimeMessages({
    channelId,
    onInsert: async (payload) => {
      const enriched = await enrichMessage(payload as ChannelMessage);
      setMessages((prev) => {
        if (prev.some((m) => m.id === enriched.id)) return prev;
        return [...prev, enriched].sort((a, b) => a.created_at.localeCompare(b.created_at));
      });
    },
    onUpdate: async (payload) => {
      const enriched = await enrichMessage(payload as ChannelMessage);
      setMessages((prev) => prev.map((m) => (m.id === enriched.id ? enriched : m)));
    },
    onDelete: (payload) => {
      setMessages((prev) => prev.filter((m) => m.id !== (payload as ChannelMessage).id));
    }
  });

  const handleSend = useCallback(
    async (text: string) => {
      try {
        setSending(true);
        const res = await fetch("/api/messaging/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: text, channelId })
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
    [channelId, showToast]
  );

  return (
    <div className="mt-6 space-y-4">
      <div className="rounded-2xl border border-gsv-slate-200 bg-white/70 backdrop-blur-sm p-4 shadow-inner-soft">
        {messages.length > 0 ? (
          <MessageList messages={messages} />
        ) : (
          <div className="py-16 text-center text-gsv-gray">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-sm font-medium">No messages yet. Start the conversation!</p>
          </div>
        )}
      </div>
      <div className="rounded-2xl border border-gsv-slate-200 bg-white/80 backdrop-blur-sm p-4 shadow-soft">
        <MessageComposer onSend={handleSend} sending={sending} />
      </div>
    </div>
  );
}
