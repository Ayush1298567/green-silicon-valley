"use client";

import { useState, useEffect, useRef } from "react";
import { Edit, Save, X, Eye, EyeOff } from "lucide-react";

interface InlineEditorProps {
  contentKey: string;
  initialValue: string;
  type?: "text" | "textarea" | "rich";
  placeholder?: string;
  className?: string;
  onSave?: (newValue: string) => Promise<void>;
  editable?: boolean;
}

export default function InlineEditor({
  contentKey,
  initialValue,
  type = "text",
  placeholder = "Click to edit...",
  className = "",
  onSave,
  editable = true
}: InlineEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (isEditing) {
      if (type === "textarea" && textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.select();
      } else if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }
  }, [isEditing, type]);

  const handleSave = async () => {
    if (!onSave || value === initialValue) {
      setIsEditing(false);
      return;
    }

    setLoading(true);
    try {
      await onSave(value);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving content:", error);
      // Revert on error
      setValue(initialValue);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setValue(initialValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && type !== "textarea") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (!editable) {
    return (
      <span className={className}>
        {initialValue || placeholder}
      </span>
    );
  }

  if (isEditing) {
    return (
      <div className="relative inline-block w-full">
        {type === "textarea" ? (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`w-full px-3 py-2 border-2 border-blue-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${className}`}
            rows={4}
            disabled={loading}
          />
        ) : (
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`w-full px-3 py-2 border-2 border-blue-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
            disabled={loading}
          />
        )}

        <div className="absolute -top-10 right-0 flex gap-1 bg-white border border-gray-200 rounded-lg shadow-lg p-1">
          <button
            onClick={handleSave}
            disabled={loading}
            className="p-1 text-green-600 hover:text-green-800 disabled:opacity-50"
            title="Save (Enter)"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
            ) : (
              <Save size={16} />
            )}
          </button>
          <button
            onClick={handleCancel}
            disabled={loading}
            className="p-1 text-gray-600 hover:text-gray-800"
            title="Cancel (Esc)"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <span
      className={`cursor-pointer group relative ${className}`}
      onClick={() => setIsEditing(true)}
      title="Click to edit"
    >
      <span className="group-hover:bg-yellow-100 group-hover:px-1 group-hover:py-0.5 group-hover:rounded transition-colors">
        {value || placeholder}
      </span>
      <Edit className="absolute -top-6 right-0 w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </span>
  );
}
