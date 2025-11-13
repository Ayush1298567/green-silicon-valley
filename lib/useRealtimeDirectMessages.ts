"use client";
import { useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface RealtimeDMOptions {
  currentUserId: string;
  peerId: string;
  onInsert?: (message: any) => void;
  onUpdate?: (message: any) => void;
  onDelete?: (message: any) => void;
}

export function useRealtimeDirectMessages({ currentUserId, peerId, onInsert, onUpdate, onDelete }: RealtimeDMOptions) {
  useEffect(() => {
    const supabase = createClientComponentClient();
    const channel = supabase
      .channel(`dm-${currentUserId}-${peerId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages"
        },
        (payload) => {
          const message = (payload.eventType === "DELETE" ? payload.old : payload.new) as any;
          const isParticipant =
            message &&
            ((message.sender_id === currentUserId && message.recipient_id === peerId) ||
              (message.sender_id === peerId && message.recipient_id === currentUserId));
          if (!isParticipant) return;

          if (payload.eventType === "INSERT") onInsert?.(message);
          else if (payload.eventType === "UPDATE") onUpdate?.(message);
          else if (payload.eventType === "DELETE") onDelete?.(message);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, peerId, onDelete, onInsert, onUpdate]);
}
