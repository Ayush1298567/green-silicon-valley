"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  AlertTriangle,
  CheckCircle,
  User,
  Calendar,
  Tag,
  MessageSquare,
  ArrowRight,
  TrendingUp
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

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

interface Comment {
  id: string;
  comment: string;
  is_internal: boolean;
  created_at: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface QuickActionModalProps {
  item: ActionItem;
  onClose: () => void;
  onStatusUpdate: (status: string) => void;
  onRefresh: () => void;
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

export default function QuickActionModal({
  item,
  onClose,
  onStatusUpdate,
  onRefresh
}: QuickActionModalProps) {
  const [comment, setComment] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [progressPercentage, setProgressPercentage] = useState(
    item.metadata?.progress_percentage || 0
  );

  useState(() => {
    loadComments();
  });

  const loadComments = async () => {
    try {
      const response = await fetch(`/api/action-items/${item.id}/comments`);
      const data = await response.json();
      if (data.success) {
        setComments(data.comments);
      }
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const response = await fetch(`/api/action-items/${item.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comment: comment.trim(),
          is_internal: isInternal
        })
      });

      if (response.ok) {
        setComment("");
        setIsInternal(false);
        loadComments();
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await onStatusUpdate(newStatus);
      onRefresh();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const getActionButtons = () => {
    if (item.action_required?.action === 'navigate') {
      return (
        <Button
          onClick={() => {
            window.location.href = item.action_required.url;
          }}
          className="flex items-center gap-2"
        >
          {item.action_required.label || 'Take Action'}
          <ArrowRight className="w-4 h-4" />
        </Button>
      );
    }

    switch (item.status) {
      case 'pending':
        return (
          <div className="flex gap-2">
            <Button
              onClick={() => handleStatusChange('in_progress')}
              className="flex-1"
            >
              Start Working
            </Button>
            <Button
              variant="outline"
              onClick={() => handleStatusChange('cancelled')}
            >
              Cancel
            </Button>
          </div>
        );

      case 'in_progress':
        return (
          <div className="flex gap-2">
            <Button
              onClick={() => handleStatusChange('completed')}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Mark Complete
            </Button>
            <Button
              variant="outline"
              onClick={() => handleStatusChange('pending')}
            >
              Move to Pending
            </Button>
          </div>
        );

      case 'completed':
        return (
          <Button
            variant="outline"
            onClick={() => handleStatusChange('in_progress')}
          >
            Reopen Task
          </Button>
        );

      default:
        return null;
    }
  };

  const isOverdue = item.due_date && new Date(item.due_date) < new Date() && item.status !== 'completed';

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {item.title}
            <Badge className={priorityColors[item.priority as keyof typeof priorityColors]}>
              {item.priority}
            </Badge>
            <Badge className={statusColors[item.status as keyof typeof statusColors]}>
              {item.status.replace('_', ' ')}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Description */}
          {item.description && (
            <div>
              <h4 className="font-semibold text-sm text-gray-900 mb-2">Description</h4>
              <p className="text-gray-700">{item.description}</p>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-900">Type:</span>
              <Badge variant="outline" className="ml-2">
                {item.type.replace('_', ' ')}
              </Badge>
            </div>

            {item.due_date && (
              <div>
                <span className="font-medium text-gray-900">Due:</span>
                <span className={`ml-2 ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
                  {format(new Date(item.due_date), 'PPP')}
                  {isOverdue && <AlertTriangle className="w-4 h-4 inline ml-1" />}
                </span>
              </div>
            )}

            <div>
              <span className="font-medium text-gray-900">Assigned by:</span>
              {item.assigned_by_user ? (
                <div className="flex items-center gap-2 ml-2">
                  <Avatar className="w-5 h-5">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-xs">
                      {item.assigned_by_user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-gray-600">{item.assigned_by_user.name}</span>
                </div>
              ) : (
                <span className="ml-2 text-gray-600">System</span>
              )}
            </div>

            <div>
              <span className="font-medium text-gray-900">Created:</span>
              <span className="ml-2 text-gray-600">
                {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm text-gray-900 mb-2">Tags</h4>
              <div className="flex gap-1">
                {item.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Progress Tracking for In Progress Items */}
          {item.status === 'in_progress' && (
            <div className="mb-6">
              <h4 className="font-semibold text-sm text-gray-900 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Progress Tracking
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium">Progress:</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progressPercentage}
                    onChange={(e) => setProgressPercentage(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-12">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setProgressPercentage(Math.max(0, progressPercentage - 10))}
                  >
                    -10%
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setProgressPercentage(Math.min(100, progressPercentage + 10))}
                  >
                    +10%
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      try {
                        const response = await fetch(`/api/action-items/${item.id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            metadata: {
                              ...item.metadata,
                              progress_percentage: progressPercentage
                            }
                          })
                        });
                        if (response.ok) {
                          onRefresh();
                        }
                      } catch (error) {
                        console.error("Error updating progress:", error);
                      }
                    }}
                  >
                    Save Progress
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end">
            {getActionButtons()}
          </div>

          <Separator />

          {/* Comments Section */}
          <div>
            <h4 className="font-semibold text-sm text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Comments & Notes
            </h4>

            {/* Add Comment */}
            <div className="mb-4">
              <Textarea
                placeholder="Add a comment or note..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="mb-2"
              />
              <div className="flex justify-between items-center">
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                  />
                  Internal note (only visible to admins)
                </label>
                <Button
                  onClick={handleAddComment}
                  disabled={!comment.trim() || isSubmittingComment}
                  size="sm"
                >
                  {isSubmittingComment ? 'Adding...' : 'Add Comment'}
                </Button>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {loadingComments ? (
                <div className="text-center text-gray-500 py-4">Loading comments...</div>
              ) : comments.length === 0 ? (
                <div className="text-center text-gray-500 py-4">No comments yet</div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="border rounded-lg p-3">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src="" />
                        <AvatarFallback>
                          {comment.user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{comment.user.name}</span>
                          {comment.is_internal && (
                            <Badge variant="secondary" className="text-xs">
                              Internal
                            </Badge>
                          )}
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{comment.comment}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
