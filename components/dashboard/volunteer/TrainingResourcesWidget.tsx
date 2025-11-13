"use client";
import { BookOpen, ExternalLink } from "lucide-react";
import { type ResourceRow } from "@/types/db";

interface TrainingResourcesWidgetProps {
  resources: ResourceRow[];
}

export default function TrainingResourcesWidget({ resources }: TrainingResourcesWidgetProps) {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-gsv-green" />
        <h3 className="font-semibold text-lg">Training & Resources</h3>
      </div>

      <div className="space-y-2">
        {resources.length === 0 ? (
          <>
            <ResourceItem title="Volunteer Handbook" description="Complete guide to volunteering with GSV" />
            <ResourceItem title="Presentation Tips" description="Best practices for engaging students" />
            <ResourceItem title="Safety Guidelines" description="Important safety protocols" />
            <ResourceItem title="Activity Library" description="Collection of hands-on activities" />
          </>
        ) : (
          resources.map((resource) => (
            <a
              key={resource.id}
              href={resource.file_url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 border rounded-lg hover:border-gsv-green hover:bg-green-50 transition"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-medium text-sm">{resource.filename}</div>
                  {resource.description && (
                    <div className="text-xs text-gsv-gray mt-1">{resource.description}</div>
                  )}
                </div>
                <ExternalLink className="w-4 h-4 text-gsv-gray flex-shrink-0" />
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  );
}

const ResourceItem = ({ title, description }: { title: string; description: string }) => (
  <div className="p-3 border rounded-lg hover:border-gsv-green hover:bg-green-50 transition cursor-pointer">
    <div className="font-medium text-sm">{title}</div>
    <div className="text-xs text-gsv-gray mt-1">{description}</div>
  </div>
);

