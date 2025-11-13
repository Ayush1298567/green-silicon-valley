"use client";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Lock, Unlock, User, AlertTriangle, Clock, X } from "lucide-react";

interface LockInfo {
  is_locked: boolean;
  can_edit: boolean;
  lock_info?: {
    user_name: string;
    user_id: string;
    locked_at: string;
    is_current_user: boolean;
  };
}

interface WebsiteBuilderLockManagerProps {
  pageId: string; // e.g., 'homepage', 'about-page', 'contact-page'
  onLockStatusChange?: (canEdit: boolean, lockInfo?: LockInfo['lock_info']) => void;
}

export default function WebsiteBuilderLockManager({
  pageId,
  onLockStatusChange
}: WebsiteBuilderLockManagerProps) {
  const supabase = createClientComponentClient();
  const [lockStatus, setLockStatus] = useState<LockInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showForceUnlock, setShowForceUnlock] = useState(false);

  useEffect(() => {
    checkLockStatus();
    getCurrentUser();

    // Set up real-time subscription for lock changes
    const channel = supabase
      .channel(`edit_locks_${pageId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'edit_locks',
        filter: `page_id=eq.${pageId}`
      }, () => {
        checkLockStatus();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pageId]);

  const getCurrentUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setCurrentUserId(session?.user?.id || null);
  };

  const checkLockStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;

      const response = await fetch(`/api/edit-locks?pageId=${encodeURIComponent(pageId)}`);
      const data = await response.json();

      if (data.ok) {
        setLockStatus(data.lockStatus);
        onLockStatusChange?.(data.lockStatus.can_edit, data.lockStatus.lock_info);
      }
    } catch (error) {
      console.error('Error checking lock status:', error);
    } finally {
      setLoading(false);
    }
  };

  const acquireLock = async () => {
    try {
      const response = await fetch('/api/edit-locks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId, action: 'acquire' })
      });

      const data = await response.json();
      if (data.ok) {
        await checkLockStatus(); // Refresh status
      } else {
        alert(`Failed to acquire lock: ${data.error}`);
      }
    } catch (error) {
      console.error('Error acquiring lock:', error);
      alert('Failed to acquire editing lock');
    }
  };

  const releaseLock = async () => {
    try {
      const response = await fetch('/api/edit-locks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId, action: 'release' })
      });

      const data = await response.json();
      if (data.ok) {
        await checkLockStatus(); // Refresh status
      }
    } catch (error) {
      console.error('Error releasing lock:', error);
    }
  };

  const forceUnlock = async () => {
    if (!confirm('Are you sure you want to force unlock this page? This will remove the current editor\'s lock.')) {
      return;
    }

    try {
      const response = await fetch('/api/edit-locks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId, action: 'force_release' })
      });

      const data = await response.json();
      if (data.ok) {
        setShowForceUnlock(false);
        await checkLockStatus(); // Refresh status
      } else {
        alert(`Failed to force unlock: ${data.error}`);
      }
    } catch (error) {
      console.error('Error force unlocking:', error);
      alert('Failed to force unlock');
    }
  };

  const extendLock = async () => {
    try {
      const response = await fetch('/api/edit-locks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId, action: 'extend' })
      });

      const data = await response.json();
      if (!data.ok) {
        alert(`Failed to extend lock: ${data.error}`);
      }
      // Refresh status regardless
      await checkLockStatus();
    } catch (error) {
      console.error('Error extending lock:', error);
    }
  };

  // Auto-extend lock every 10 minutes if user has it
  useEffect(() => {
    if (lockStatus?.can_edit && lockStatus?.lock_info?.is_current_user) {
      const interval = setInterval(extendLock, 10 * 60 * 1000); // 10 minutes
      return () => clearInterval(interval);
    }
  }, [lockStatus]);

  // Release lock when component unmounts or page changes
  useEffect(() => {
    return () => {
      if (lockStatus?.can_edit && lockStatus?.lock_info?.is_current_user) {
        releaseLock();
      }
    };
  }, [pageId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
        <span className="text-sm text-gray-600">Checking edit status...</span>
      </div>
    );
  }

  if (!lockStatus) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-red-100 rounded-lg">
        <AlertTriangle className="w-4 h-4 text-red-600" />
        <span className="text-sm text-red-800">Unable to check edit status</span>
      </div>
    );
  }

  const isLocked = lockStatus.is_locked;
  const canEdit = lockStatus.can_edit;
  const lockInfo = lockStatus.lock_info;

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isLocked ? (
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-orange-500" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    {canEdit ? 'You are editing' : `Locked by ${lockInfo?.user_name || 'another user'}`}
                  </span>
                  {lockInfo && (
                    <span className="text-xs text-gray-500">
                      since {new Date(lockInfo.locked_at).toLocaleTimeString()}
                    </span>
                  )}
                </div>
                {!canEdit && (
                  <p className="text-xs text-gray-600 mt-1">
                    Wait for them to finish or request access
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Unlock className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-900">Available for editing</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {canEdit && lockInfo?.is_current_user && (
            <>
              <button
                onClick={extendLock}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                Extend Lock
              </button>
              <button
                onClick={releaseLock}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                Release
              </button>
            </>
          )}

          {!canEdit && isLocked && (
            <button
              onClick={acquireLock}
              className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
            >
              Request Access
            </button>
          )}

          {!isLocked && (
            <button
              onClick={acquireLock}
              className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
            >
              Start Editing
            </button>
          )}

          {/* Force unlock for founders */}
          {isLocked && !canEdit && (
            <button
              onClick={() => setShowForceUnlock(true)}
              className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
              title="Force unlock (Founder only)"
            >
              ⚡ Force Unlock
            </button>
          )}
        </div>
      </div>

      {/* Force Unlock Confirmation */}
      {showForceUnlock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900">Force Unlock Page</h3>
            </div>

            <p className="text-gray-600 mb-6">
              This will remove the current editor's lock on "{pageId}". The current editor may lose unsaved changes. Only use this if necessary.
            </p>

            <div className="flex gap-3">
              <button
                onClick={forceUnlock}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Force Unlock
              </button>
              <button
                onClick={() => setShowForceUnlock(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
