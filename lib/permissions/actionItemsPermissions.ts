import { getServerComponentClient } from "@/lib/supabase/server";

export interface ActionItemPermissions {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canAssign: boolean;
  canComment: boolean;
  canViewAll: boolean;
  canDelegate: boolean;
  viewableTypes: string[];
  assignableRoles: string[];
}

export class ActionItemsPermissionsManager {
  private supabase = getServerComponentClient();

  /**
   * Get permissions for a user regarding action items
   */
  async getUserPermissions(userId: string, userRole: string): Promise<ActionItemPermissions> {
    const basePermissions: ActionItemPermissions = {
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
      canAssign: false,
      canComment: false,
      canViewAll: false,
      canDelegate: false,
      viewableTypes: [],
      assignableRoles: []
    };

    switch (userRole) {
      case 'founder':
        return {
          ...basePermissions,
          canView: true,
          canCreate: true,
          canEdit: true,
          canDelete: true,
          canAssign: true,
          canComment: true,
          canViewAll: true,
          canDelegate: true,
          viewableTypes: ['all'],
          assignableRoles: ['founder', 'intern', 'volunteer']
        };

      case 'intern':
        // Interns can view and work on assigned items, and create items for themselves
        const internPermissions = await this.getInternSpecificPermissions(userId);
        return {
          ...basePermissions,
          canView: true,
          canCreate: true, // Can create for themselves
          canEdit: true, // Can edit assigned items
          canComment: true,
          canViewAll: false,
          canDelegate: false,
          viewableTypes: ['task', 'review', 'followup', 'reminder'], // Exclude admin tasks
          assignableRoles: [], // Cannot assign to others
          ...internPermissions
        };

      case 'volunteer':
        // Volunteers can only view items assigned to them (rare case)
        return {
          ...basePermissions,
          canView: true,
          canEdit: true, // Can update their own items
          canComment: true,
          canViewAll: false,
          viewableTypes: ['task', 'reminder'],
          assignableRoles: []
        };

      default:
        return basePermissions;
    }
  }

  /**
   * Get intern-specific permissions based on their department and custom permissions
   */
  private async getInternSpecificPermissions(userId: string): Promise<Partial<ActionItemPermissions>> {
    const { data: user } = await this.supabase
      .from('users')
      .select('department, subrole')
      .eq('id', userId)
      .single();

    if (!user) return {};

    const permissions: Partial<ActionItemPermissions> = {};

    // Department-specific permissions
    switch (user.department) {
      case 'operations':
        permissions.viewableTypes = ['task', 'review', 'followup', 'reminder', 'deadline'];
        break;
      case 'outreach':
        permissions.viewableTypes = ['task', 'review', 'followup', 'reminder'];
        break;
      case 'media':
        permissions.viewableTypes = ['task', 'review', 'followup', 'reminder'];
        break;
      default:
        permissions.viewableTypes = ['task', 'review', 'followup', 'reminder'];
    }

    // Subrole-specific permissions
    if (user.subrole === 'department_director') {
      permissions.canAssign = true; // Can assign within their department
      permissions.canDelegate = true; // Can delegate to team members
      permissions.assignableRoles = ['intern'];
    }

    return permissions;
  }

  /**
   * Check if user can view a specific action item
   */
  async canViewItem(userId: string, userRole: string, itemId: string): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId, userRole);

    if (!permissions.canView) return false;

    // Founders and admins can view all items
    if (permissions.canViewAll) return true;

    // Check if item is assigned to user
    const { data: item } = await this.supabase
      .from('action_items')
      .select('assigned_to, type')
      .eq('id', itemId)
      .single();

    if (!item) return false;

    // Check assignment
    const isAssigned = item.assigned_to?.includes(userId);
    if (isAssigned) return true;

    // Check type permissions
    const canViewType = permissions.viewableTypes.includes('all') ||
                       permissions.viewableTypes.includes(item.type);

    return canViewType;
  }

  /**
   * Check if user can edit a specific action item
   */
  async canEditItem(userId: string, userRole: string, itemId: string): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId, userRole);

    if (!permissions.canEdit) return false;

    // Founders and admins can edit all items
    if (permissions.canViewAll) return true;

    // Check if item is assigned to user
    const { data: item } = await this.supabase
      .from('action_items')
      .select('assigned_to')
      .eq('id', itemId)
      .single();

    return item?.assigned_to?.includes(userId) || false;
  }

  /**
   * Get delegatable users for a specific user
   */
  async getDelegatableUsers(userId: string, userRole: string): Promise<Array<{id: string, name: string, role: string}>> {
    const permissions = await this.getUserPermissions(userId, userRole);

    if (!permissions.canDelegate || !permissions.assignableRoles?.length) {
      return [];
    }

    const { data: users } = await this.supabase
      .from('users')
      .select('id, name, role, department')
      .in('role', permissions.assignableRoles)
      .neq('id', userId)
      .order('name');

    return users || [];
  }

  /**
   * Delegate an action item to another user
   */
  async delegateItem(
    itemId: string,
    fromUserId: string,
    fromUserRole: string,
    toUserId: string
  ): Promise<boolean> {
    const permissions = await this.getUserPermissions(fromUserId, fromUserRole);

    if (!permissions.canDelegate) return false;

    // Check if target user is delegatable
    const delegatableUsers = await this.getDelegatableUsers(fromUserId, fromUserRole);
    const canDelegateTo = delegatableUsers.some(user => user.id === toUserId);

    if (!canDelegateTo) return false;

    // Update the item
    const { error } = await this.supabase
      .from('action_items')
      .update({
        assigned_to: [toUserId],
        updated_at: new Date().toISOString()
      })
      .eq('id', itemId);

    if (error) {
      console.error('Error delegating item:', error);
      return false;
    }

    // Log delegation in history
    await this.supabase
      .from('action_item_history')
      .insert({
        action_item_id: itemId,
        user_id: fromUserId,
        action: 'delegated',
        old_value: fromUserId,
        new_value: toUserId,
        metadata: { delegated_to: toUserId }
      });

    return true;
  }

  /**
   * Get items that can be delegated by a user
   */
  async getDelegatableItems(userId: string, userRole: string): Promise<any[]> {
    const permissions = await this.getUserPermissions(userId, userRole);

    if (!permissions.canDelegate) return [];

    const { data: items } = await this.supabase
      .from('action_items')
      .select('*')
      .contains('assigned_to', [userId])
      .eq('status', 'pending')
      .in('type', permissions.viewableTypes)
      .order('created_at', { ascending: false });

    return items || [];
  }
}

// Export singleton instance
export const actionItemsPermissions = new ActionItemsPermissionsManager();
