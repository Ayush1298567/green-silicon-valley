"use client";

import { useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DateRangeFilterProps {
  onRangeChange: (start: Date, end: Date) => void;
  defaultRange?: "7d" | "30d" | "90d" | "1y" | "all";
}

export default function DateRangeFilter({ onRangeChange, defaultRange = "30d" }: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<string>(defaultRange);

  const ranges = [
    { label: "Last 7 days", value: "7d" },
    { label: "Last 30 days", value: "30d" },
    { label: "Last 90 days", value: "90d" },
    { label: "Last year", value: "1y" },
    { label: "All time", value: "all" },
    { label: "Custom range", value: "custom" }
  ];

  const handleRangeSelect = (value: string) => {
    if (value === "custom") {
      // Custom date picker would go here
      return;
    }

    setSelectedRange(value);
    setIsOpen(false);

    const end = new Date();
    const start = new Date();

    switch (value) {
      case "7d":
        start.setDate(start.getDate() - 7);
        break;
      case "30d":
        start.setDate(start.getDate() - 30);
        break;
      case "90d":
        start.setDate(start.getDate() - 90);
        break;
      case "1y":
        start.setFullYear(start.getFullYear() - 1);
        break;
      case "all":
        start.setFullYear(2020); // Start from beginning
        break;
    }

    onRangeChange(start, end);
  };

  const selectedLabel = ranges.find(r => r.value === selectedRange)?.label || "Select range";

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-gsv-green transition-colors focus:outline-none focus:ring-2 focus:ring-gsv-green focus:ring-offset-2"
        aria-label="Select date range"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Calendar className="w-4 h-4 text-gsv-gray" aria-hidden="true" />
        <span className="text-sm font-medium text-gsv-charcoal">{selectedLabel}</span>
        <ChevronDown className={`w-4 h-4 text-gsv-gray transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[200px]"
              role="listbox"
            >
              {ranges.map((range) => (
                <button
                  key={range.value}
                  onClick={() => handleRangeSelect(range.value)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg focus:outline-none focus:bg-gray-50 ${
                    selectedRange === range.value ? "bg-gsv-green/10 text-gsv-green font-semibold" : "text-gsv-charcoal"
                  }`}
                  role="option"
                  aria-selected={selectedRange === range.value}
                >
                  {range.label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

