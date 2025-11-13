"use client";
import { Briefcase, Plus } from "lucide-react";
import { type InternProjectRow } from "@/types/db";

interface InternProjectsListProps {
  projects: InternProjectRow[];
}

export default function InternProjectsList({ projects }: InternProjectsListProps) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-gsv-green" />
          <h3 className="font-semibold text-lg">My Projects</h3>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded" title="Add project">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {projects.length === 0 ? (
          <p className="text-sm text-gsv-gray text-center py-4">No projects created yet</p>
        ) : (
          projects.slice(0, 5).map((project) => (
            <div key={project.id} className="p-3 border rounded-lg hover:bg-gray-50 transition">
              <div className="font-medium text-sm text-gsv-charcoal mb-1">{project.title}</div>
              <div className="flex items-center justify-between text-xs">
                <span className={`px-2 py-0.5 rounded-full ${
                  project.status === "completed" ? "bg-green-100 text-green-800" :
                  project.status === "in_progress" ? "bg-blue-100 text-blue-800" :
                  "bg-gray-100 text-gray-800"
                }`}>
                  {project.status}
                </span>
                {project.due_date && (
                  <span className="text-gsv-gray">
                    Due {new Date(project.due_date).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

