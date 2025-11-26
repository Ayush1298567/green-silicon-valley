"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Clock, AlertTriangle, CheckCircle, Plus, Filter, Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import ActionItemCard from "@/components/action-items/ActionItemCard";
import QuickActionModal from "@/components/action-items/QuickActionModal";
import BulkActions from "@/components/action-items/BulkActions";
import CreateActionItemModal from "@/components/action-items/CreateActionItemModal";
import DelegationManager from "@/components/action-items/DelegationManager";

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

interface DashboardStats {
  total: number;
  pending: number;
  in_progress: number;
  completed: number;
  overdue: number;
  urgent: number;
}

export default function ActionItemsDashboard() {
  const [items, setItems] = useState<ActionItem[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    pending: 0,
    in_progress: 0,
    completed: 0,
    overdue: 0,
    urgent: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showQuickAction, setShowQuickAction] = useState<ActionItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [userPermissions, setUserPermissions] = useState<any>(null);

  const router = useRouter();

  useEffect(() => {
    loadActionItems();
    loadUserPermissions();
  }, [selectedTab, priorityFilter]);

  const loadUserPermissions = async () => {
    try {
      const response = await fetch('/api/action-items/permissions');
      if (response.ok) {
        const data = await response.json();
        setUserPermissions(data.permissions);
      }
    } catch (error) {
      console.error("Error loading permissions:", error);
    }
  };

  const loadActionItems = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      // Add filters
      if (selectedTab !== "all") {
        params.append("status", selectedTab);
      }
      if (priorityFilter !== "all") {
        params.append("priority", priorityFilter);
      }

      const response = await fetch(`/api/action-items?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setItems(data.items);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error loading action items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (item: ActionItem) => {
    // Handle different action types
    if (item.action_required?.action === 'navigate' && item.action_required?.url) {
      router.push(item.action_required.url);
    } else {
      setShowQuickAction(item);
    }
  };

  const handleStatusUpdate = async (itemId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/action-items/${itemId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        loadActionItems(); // Refresh the list
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleBulkAction = async (action: string, data: any) => {
    if (selectedItems.length === 0) return;

    try {
      const response = await fetch('/api/action-items/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          itemIds: selectedItems,
          data
        })
      });

      if (response.ok) {
        setSelectedItems([]);
        loadActionItems();
      }
    } catch (error) {
      console.error("Error performing bulk action:", error);
    }
  };

  // Filter items based on search
  const filteredItems = items.filter(item => {
    const matchesSearch = searchQuery === "" ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  // Group items by status for display
  const groupedItems = {
    urgent: filteredItems.filter(item =>
      item.priority === 'urgent' || (item.due_date && new Date(item.due_date) < new Date())
    ),
    pending: filteredItems.filter(item => item.status === 'pending'),
    in_progress: filteredItems.filter(item => item.status === 'in_progress'),
    overdue: filteredItems.filter(item =>
      item.status !== 'completed' && item.due_date && new Date(item.due_date) < new Date()
    ),
    completed: filteredItems.filter(item => item.status === 'completed')
  };

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Action Items</h1>
          <p className="mt-1 md:mt-2 text-sm md:text-base text-gray-600">
            Manage all your tasks, reviews, and follow-ups in one place
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          {userPermissions?.canDelegate && (
            <DelegationManager onDelegationComplete={loadActionItems} />
          )}
          {userPermissions?.canCreate && (
            <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 w-full sm:w-auto">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Create Action Item</span>
              <span className="sm:hidden">Create</span>
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 mb-6 md:mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{stats.in_progress}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Urgent</p>
                <p className="text-2xl font-bold text-orange-600">{stats.urgent}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search action items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <BulkActions
          selectedCount={selectedItems.length}
          onAction={handleBulkAction}
          onClear={() => setSelectedItems([])}
        />
      )}

      {/* Tabs and Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Items ({filteredItems.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({groupedItems.pending.length})</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress ({groupedItems.in_progress.length})</TabsTrigger>
          <TabsTrigger value="urgent">Urgent ({groupedItems.urgent.length})</TabsTrigger>
          <TabsTrigger value="overdue">Overdue ({groupedItems.overdue.length})</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredItems.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No action items found</h3>
                <p className="text-gray-600">
                  {searchQuery ? "Try adjusting your search or filters." : "You're all caught up!"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredItems.map((item) => (
                <ActionItemCard
                  key={item.id}
                  item={item}
                  onClick={() => handleItemClick(item)}
                  onStatusUpdate={(status) => handleStatusUpdate(item.id, status)}
                  isSelected={selectedItems.includes(item.id)}
                  onSelect={(selected) => {
                    if (selected) {
                      setSelectedItems([...selectedItems, item.id]);
                    } else {
                      setSelectedItems(selectedItems.filter(id => id !== item.id));
                    }
                  }}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {showQuickAction && (
        <QuickActionModal
          item={showQuickAction}
          onClose={() => setShowQuickAction(null)}
          onStatusUpdate={(status) => {
            handleStatusUpdate(showQuickAction.id, status);
            setShowQuickAction(null);
          }}
          onRefresh={loadActionItems}
        />
      )}

      {showCreateModal && (
        <CreateActionItemModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadActionItems();
          }}
        />
      )}
    </div>
  );
}
