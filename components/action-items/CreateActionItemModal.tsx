"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";

interface CreateActionItemModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateActionItemModal({ onClose, onSuccess }: CreateActionItemModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "task",
    priority: "medium",
    assigned_to: [] as string[],
    due_date: "",
    tags: [] as string[]
  });
  const [newTag, setNewTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert("Title is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/action-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          assigned_to: formData.assigned_to.length > 0 ? formData.assigned_to : undefined
        })
      });

      if (response.ok) {
        onSuccess();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create action item");
      }
    } catch (error) {
      console.error("Error creating action item:", error);
      alert("Failed to create action item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()]
      });
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const addAssignee = (userId: string) => {
    if (!formData.assigned_to.includes(userId)) {
      setFormData({
        ...formData,
        assigned_to: [...formData.assigned_to, userId]
      });
    }
  };

  const removeAssignee = (userId: string) => {
    setFormData({
      ...formData,
      assigned_to: formData.assigned_to.filter(id => id !== userId)
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Action Item</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter action item title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter description (optional)"
              rows={3}
            />
          </div>

          {/* Type and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="task">Task</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="approval">Approval</SelectItem>
                  <SelectItem value="followup">Follow-up</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                  <SelectItem value="reminder">Reminder</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <Label htmlFor="due_date">Due Date</Label>
            <Input
              id="due_date"
              type="datetime-local"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            />
          </div>

          {/* Tags */}
          <div>
            <Label>Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button type="button" onClick={addTag} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Assigned To */}
          <div>
            <Label>Assign To</Label>
            <p className="text-sm text-gray-600 mb-2">
              Leave empty to assign to yourself, or select users to assign to multiple people.
            </p>
            {/* This would need a user selector component in a real implementation */}
            <div className="text-sm text-gray-500">
              User selection component would go here (integrate with existing user management)
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Action Item"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
