"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function ChannelList() {
  const supabase = createClientComponentClient();
  const [channels, setChannels] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("channels").select("id,name,type,is_pinned").then(({ data }) => {
      setChannels(data ?? []);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pinned = channels.filter((c) => c.is_pinned);
  const others = channels.filter((c) => !c.is_pinned);

  return (
    <div className="space-y-4">
      {pinned.length > 0 && (
        <div>
          <div className="text-xs uppercase text-gsv-gray mb-1">Pinned</div>
          <ul className="space-y-1">
            {pinned.map((c) => (
              <li key={c.id}>
                <Link className="hover:underline" href={`/channels/${c.id}`}>
                  #{c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div>
        <div className="text-xs uppercase text-gsv-gray mb-1">Channels</div>
        <ul className="space-y-1">
          {others.map((c) => (
            <li key={c.id}>
              <Link className="hover:underline" href={`/channels/${c.id}`}>
                #{c.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}


