"use client";

import { useState } from "react";
import { Download, Loader2, Check } from "lucide-react";

interface ExportButtonProps {
  onExport: (format: "csv" | "json" | "pdf") => Promise<void>;
  disabled?: boolean;
}

export default function ExportButton({ onExport, disabled = false }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const formats = [
    { label: "Export as CSV", value: "csv", icon: "📊" },
    { label: "Export as JSON", value: "json", icon: "📄" },
    { label: "Export as PDF", value: "pdf", icon: "📑" }
  ];

  const handleExport = async (format: "csv" | "json" | "pdf") => {
    setExporting(format);
    setSuccess(false);
    setIsOpen(false);

    try {
      await onExport(format);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please try again.");
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || exporting !== null}
        className="flex items-center gap-2 px-4 py-2 bg-gsv-green text-white rounded-lg hover:bg-gsv-greenDark transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gsv-green focus:ring-offset-2"
        aria-label="Export analytics data"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        {exporting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            <span className="text-sm font-medium">Exporting...</span>
          </>
        ) : success ? (
          <>
            <Check className="w-4 h-4" aria-hidden="true" />
            <span className="text-sm font-medium">Exported!</span>
          </>
        ) : (
          <>
            <Download className="w-4 h-4" aria-hidden="true" />
            <span className="text-sm font-medium">Export</span>
          </>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div
            className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[180px]"
            role="menu"
            aria-label="Export options"
          >
            {formats.map((format) => (
              <button
                key={format.value}
                onClick={() => handleExport(format.value as "csv" | "json" | "pdf")}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg focus:outline-none focus:bg-gray-50 flex items-center gap-2 text-gsv-charcoal"
                role="menuitem"
                disabled={exporting !== null}
              >
                <span aria-hidden="true">{format.icon}</span>
                {format.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

