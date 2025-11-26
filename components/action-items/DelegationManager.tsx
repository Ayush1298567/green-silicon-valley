"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, ArrowRight, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface DelegatableUser {
  id: string;
  name: string;
  role: string;
  department?: string;
}

interface DelegatableItem {
  id: string;
  title: string;
  type: string;
  priority: string;
  status: string;
  assigned_to: string[];
}

interface DelegationManagerProps {
  onDelegationComplete?: () => void;
}

export default function DelegationManager({ onDelegationComplete }: DelegationManagerProps) {
  const [delegatableUsers, setDelegatableUsers] = useState<DelegatableUser[]>([]);
  const [delegatableItems, setDelegatableItems] = useState<DelegatableItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [isDelegating, setIsDelegating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadDelegationData();
    }
  }, [isOpen]);

  const loadDelegationData = async () => {
    try {
      // Load delegatable users
      const usersResponse = await fetch('/api/action-items/delegation/users');
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setDelegatableUsers(usersData.users || []);
      }

      // Load delegatable items
      const itemsResponse = await fetch('/api/action-items/delegation/items');
      if (itemsResponse.ok) {
        const itemsData = await itemsResponse.json();
        setDelegatableItems(itemsData.items || []);
      }
    } catch (error) {
      console.error("Error loading delegation data:", error);
      toast.error("Failed to load delegation data");
    }
  };

  const handleDelegation = async () => {
    if (!selectedItem || !selectedUser) {
      toast.error("Please select both an item and a user");
      return;
    }

    setIsDelegating(true);
    try {
      const response = await fetch('/api/action-items/delegation/delegate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: selectedItem,
          userId: selectedUser
        })
      });

      if (response.ok) {
        toast.success("Task delegated successfully");
        setSelectedItem("");
        setSelectedUser("");
        setIsOpen(false);
        onDelegationComplete?.();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delegate task");
      }
    } catch (error) {
      console.error("Error delegating task:", error);
      toast.error("Failed to delegate task");
    } finally {
      setIsDelegating(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          Delegate Tasks
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Task Delegation Manager
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Available Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {delegatableItems.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No tasks available for delegation
                  </p>
                ) : (
                  delegatableItems.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedItem === item.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedItem(item.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getPriorityColor(item.priority)}>
                              {item.priority}
                            </Badge>
                            <Badge variant="outline">
                              {item.type}
                            </Badge>
                          </div>
                        </div>
                        {selectedItem === item.id && (
                          <CheckCircle className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Available Users */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {delegatableUsers.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No team members available for delegation
                  </p>
                ) : (
                  delegatableUsers.map((user) => (
                    <div
                      key={user.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedUser === user.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedUser(user.id)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src="" />
                          <AvatarFallback>
                            {user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{user.name}</h4>
                          <p className="text-xs text-gray-600">
                            {user.role}
                            {user.department && ` • ${user.department}`}
                          </p>
                        </div>
                        {selectedUser === user.id && (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Delegation Action */}
        {(selectedItem && selectedUser) && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm font-medium">Delegate Task</p>
                  <p className="text-xs text-gray-600">
                    {delegatableItems.find(i => i.id === selectedItem)?.title}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">To</p>
                  <p className="text-xs text-gray-600">
                    {delegatableUsers.find(u => u.id === selectedUser)?.name}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleDelegation}
                disabled={isDelegating}
                className="flex items-center gap-2"
              >
                {isDelegating ? "Delegating..." : "Delegate Task"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
