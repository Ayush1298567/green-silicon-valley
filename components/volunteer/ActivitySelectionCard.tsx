"use client";

import { useState } from "react";
import { CheckCircle2, Circle, Download, FileText, Presentation } from "lucide-react";

interface Topic {
  id: number;
  name: string;
  description: string;
  category: string;
  color: string;
}

interface ActivitySelectionCardProps {
  topic: Topic;
  isSelected: boolean;
  onSelect: (topicId: number) => void;
  resourceCount?: number;
}

export default function ActivitySelectionCard({
  topic,
  isSelected,
  onSelect,
  resourceCount = 0,
}: ActivitySelectionCardProps) {
  return (
    <div
      onClick={() => onSelect(topic.id)}
      className={`card p-6 cursor-pointer transition-all hover:shadow-lg border-2 ${
        isSelected
          ? "border-gsv-green bg-gsv-green/5"
          : "border-gray-200 hover:border-gsv-green/50"
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${topic.color}20` }}
          >
            <Presentation className="w-6 h-6" style={{ color: topic.color }} />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gsv-charcoal">{topic.name}</h3>
            <p className="text-sm text-gsv-gray mt-1">{topic.description}</p>
          </div>
        </div>
        <div className="flex-shrink-0">
          {isSelected ? (
            <CheckCircle2 className="w-6 h-6 text-gsv-green" />
          ) : (
            <Circle className="w-6 h-6 text-gray-300" />
          )}
        </div>
      </div>

      {resourceCount > 0 && (
        <div className="flex items-center gap-2 text-sm text-gsv-gray mt-4 pt-4 border-t border-gray-200">
          <FileText className="w-4 h-4" />
          <span>{resourceCount} resource{resourceCount !== 1 ? "s" : ""} available</span>
        </div>
      )}
    </div>
  );
}

