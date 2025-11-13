"use client";
import { useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export function useRealtimeMessages(opts: {
  channelId?: string;
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
}) {
  useEffect(() => {
    const supabase = createClientComponentClient();
    const channel = supabase
      .channel(`messages-${opts.channelId ?? "dm"}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          ...(opts.channelId ? { filter: `channel_id=eq.${opts.channelId}` } : {})
        },
        (payload) => {
          if (payload.eventType === "INSERT") opts.onInsert?.(payload.new);
          else if (payload.eventType === "UPDATE") opts.onUpdate?.(payload.new);
          else if (payload.eventType === "DELETE") opts.onDelete?.(payload.old);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.channelId]);
}


