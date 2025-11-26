"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  X,
  User,
  AlertTriangle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BulkActionsProps {
  selectedCount: number;
  onAction: (action: string, data?: any) => void;
  onClear: () => void;
}

export default function BulkActions({ selectedCount, onAction, onClear }: BulkActionsProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (action: string, data?: any) => {
    setIsLoading(true);
    try {
      await onAction(action, data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {selectedCount} selected
          </Badge>
          <span className="text-sm text-blue-700">
            Select actions to perform on selected items
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Updates */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={isLoading}>
                <CheckCircle className="w-4 h-4 mr-1" />
                Update Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() => handleAction('status_update', { status: 'pending' })}
                disabled={isLoading}
              >
                Mark as Pending
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleAction('status_update', { status: 'in_progress' })}
                disabled={isLoading}
              >
                Mark In Progress
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleAction('status_update', { status: 'completed' })}
                disabled={isLoading}
              >
                Mark Complete
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleAction('status_update', { status: 'cancelled' })}
                disabled={isLoading}
                className="text-red-600"
              >
                Cancel Items
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Priority Updates */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={isLoading}>
                <AlertTriangle className="w-4 h-4 mr-1" />
                Update Priority
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() => handleAction('priority_update', { priority: 'low' })}
                disabled={isLoading}
              >
                Set to Low
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleAction('priority_update', { priority: 'medium' })}
                disabled={isLoading}
              >
                Set to Medium
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleAction('priority_update', { priority: 'high' })}
                disabled={isLoading}
              >
                Set to High
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleAction('priority_update', { priority: 'urgent' })}
                disabled={isLoading}
              >
                Set to Urgent
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Assignment (Admin only) */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction('assign', {
              assigned_to: [] // Would need user selection modal
            })}
            disabled={isLoading}
          >
            <User className="w-4 h-4 mr-1" />
            Reassign
          </Button>

          {/* Delete (Admin only) */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction('delete')}
            disabled={isLoading}
            className="text-red-600 hover:text-red-700"
          >
            Delete Selected
          </Button>

          {/* Clear Selection */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            disabled={isLoading}
          >
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
}
