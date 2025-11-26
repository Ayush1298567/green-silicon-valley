"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Clock,
  AlertTriangle,
  CheckCircle,
  User,
  Calendar,
  Tag,
  MoreVertical,
  ArrowRight
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ActionItem {
  id: string;
  title: string;
  description?: string;
  type: string;
  priority: string;
  status: string;
  assigned_to: string[];
  due_date?: string;
  metadata: Record<string, any>;
  action_required: Record<string, any>;
  tags: string[];
  created_at: string;
  assigned_by_user?: {
    id: string;
    name: string;
    email: string;
  };
}

interface ActionItemCardProps {
  item: ActionItem;
  onClick: () => void;
  onStatusUpdate: (status: string) => void;
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
}

const priorityColors = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800"
};

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-800",
  overdue: "bg-red-100 text-red-800"
};

const typeIcons = {
  task: User,
  review: CheckCircle,
  approval: CheckCircle,
  followup: Clock,
  deadline: AlertTriangle,
  reminder: Bell,
  system_alert: AlertTriangle
};

export default function ActionItemCard({
  item,
  onClick,
  onStatusUpdate,
  isSelected = false,
  onSelect
}: ActionItemCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const isOverdue = item.due_date && new Date(item.due_date) < new Date() && item.status !== 'completed';
  const isUrgent = item.priority === 'urgent' || isOverdue;

  const TypeIcon = typeIcons[item.type as keyof typeof typeIcons] || User;

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      await onStatusUpdate(newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const getActionButton = () => {
    if (item.action_required?.action === 'navigate') {
      return (
        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className="ml-auto"
        >
          {item.action_required.label || 'Take Action'}
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      );
    }

    if (item.status === 'pending') {
      return (
        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleStatusChange('in_progress');
          }}
          disabled={isUpdating}
          className="ml-auto"
        >
          Start Working
        </Button>
      );
    }

    if (item.status === 'in_progress') {
      return (
        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleStatusChange('completed');
          }}
          disabled={isUpdating}
          className="ml-auto bg-green-600 hover:bg-green-700"
        >
          Mark Complete
        </Button>
      );
    }

    return null;
  };

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      } ${isUrgent ? 'border-red-300 bg-red-50' : ''} ${
        item.status === 'completed' ? 'opacity-75' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Selection Checkbox */}
          {onSelect && (
            <Checkbox
              checked={isSelected}
              onCheckedChange={onSelect}
              onClick={(e) => e.stopPropagation()}
              className="mt-1"
            />
          )}

          {/* Type Icon */}
          <div className={`p-2 rounded-lg ${
            item.status === 'completed' ? 'bg-green-100' :
            isUrgent ? 'bg-red-100' : 'bg-gray-100'
          }`}>
            <TypeIcon className={`w-4 h-4 ${
              item.status === 'completed' ? 'text-green-600' :
              isUrgent ? 'text-red-600' : 'text-gray-600'
            }`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className={`font-semibold text-sm ${
                  item.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'
                }`}>
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>

              {/* Action Button */}
              {getActionButton()}
            </div>

            {/* Badges and Metadata */}
            <div className="flex items-center gap-2 mb-3">
              <Badge className={priorityColors[item.priority as keyof typeof priorityColors]}>
                {item.priority}
              </Badge>
              <Badge className={statusColors[item.status as keyof typeof statusColors]}>
                {item.status.replace('_', ' ')}
              </Badge>
              <Badge variant="outline">
                {item.type.replace('_', ' ')}
              </Badge>
            </div>

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div className="flex items-center gap-1 mb-3">
                <Tag className="w-3 h-3 text-gray-400" />
                <div className="flex gap-1">
                  {item.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {item.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{item.tags.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Progress Bar for In Progress Items */}
            {item.status === 'in_progress' && item.metadata?.progress_percentage !== undefined && (
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{item.metadata.progress_percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${item.metadata.progress_percentage}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-3">
                {/* Due Date */}
                {item.due_date && (
                  <div className={`flex items-center gap-1 ${
                    isOverdue ? 'text-red-600' : ''
                  }`}>
                    <Calendar className="w-3 h-3" />
                    <span>
                      {isOverdue ? 'Overdue ' : 'Due '}
                      {formatDistanceToNow(new Date(item.due_date), { addSuffix: true })}
                    </span>
                  </div>
                )}

                {/* Assigned By */}
                {item.assigned_by_user && (
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>by {item.assigned_by_user.name}</span>
                  </div>
                )}
              </div>

              {/* Created Date */}
              <span>
                {format(new Date(item.created_at), 'MMM d')}
              </span>
            </div>
          </div>

          {/* Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => e.stopPropagation()}
                className="h-8 w-8 p-0"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}>
                View Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {item.status !== 'completed' && (
                <>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange('in_progress');
                    }}
                    disabled={isUpdating}
                  >
                    Mark In Progress
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange('completed');
                    }}
                    disabled={isUpdating}
                  >
                    Mark Complete
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange('cancelled');
                }}
                disabled={isUpdating}
                className="text-red-600"
              >
                Cancel Item
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
