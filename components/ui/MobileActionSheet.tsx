"use client";

import { useEffect, ReactNode } from "react";
import { X } from "lucide-react";

interface ActionSheetAction {
  label: string;
  onClick: () => void;
  destructive?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
}

interface MobileActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  actions: ActionSheetAction[];
  cancelText?: string;
}

export default function MobileActionSheet({
  isOpen,
  onClose,
  title,
  actions,
  cancelText = "Cancel"
}: MobileActionSheetProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Action Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl transform transition-transform">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Title */}
        {title && (
          <div className="px-6 pb-2 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="max-h-96 overflow-y-auto">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={() => {
                action.onClick();
                onClose();
              }}
              disabled={action.disabled}
              className={`
                w-full px-6 py-4 text-left flex items-center gap-3
                hover:bg-gray-50 active:bg-gray-100 transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed
                ${action.destructive
                  ? "text-red-600 hover:bg-red-50 active:bg-red-100"
                  : "text-gray-900"
                }
                ${index === 0 && !title ? "rounded-t-2xl" : ""}
              `}
              style={{
                // Ensure minimum touch target
                minHeight: "44px"
              }}
            >
              {action.icon && (
                <span className="flex-shrink-0">{action.icon}</span>
              )}
              <span className="font-medium">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Cancel Button */}
        <div className="border-t border-gray-200 mt-2">
          <button
            onClick={onClose}
            className="w-full px-6 py-4 text-left text-gray-500 font-medium hover:bg-gray-50 active:bg-gray-100 transition-colors"
            style={{
              // Ensure minimum touch target
              minHeight: "44px"
            }}
          >
            {cancelText}
          </button>
        </div>

        {/* Safe area for mobile devices */}
        <div className="h-safe-area-inset-bottom bg-white" />
      </div>
    </>
  );
}
