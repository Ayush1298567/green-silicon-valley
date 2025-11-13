"use client";

import { useEffect, useState } from "react";
import TaskSidePanel from "./tasks/TaskSidePanel";

export default function TaskSidePanelWrapper() {
  const [user, setUser] = useState<{ id: string; role: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch current user session
    fetch("/api/auth/session")
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser({ id: data.user.id, role: data.user.role });
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  // Only show task panel for authenticated volunteers, interns, and founders
  if (isLoading || !user || user.role === "teacher") {
    return null;
  }

  return <TaskSidePanel userId={user.id} userRole={user.role} />;
}

