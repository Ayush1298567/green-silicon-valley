import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface PermissionCheck {
  userId: string;
  permissionKey: string;
  resourceId?: string;
  resourceType?: string;
}

interface UserPermissions {
  role: string;
  subrole?: string;
  customPermissions: Array<{
    permissionType: string;
    resourceId: string | null;
    permissions: Record<string, boolean>;
    expiresAt?: string;
    permissionKey?: string; // For mapping to standard permission keys
  }>;
}

export class PermissionEvaluator {
  private supabase = createClientComponentClient();

  /**
   * Check if a user has a specific permission
   */
  async hasPermission(
    userId: string,
    permissionKey: string,
    resourceId?: string,
    resourceType?: string
  ): Promise<boolean> {
    try {
      const userPermissions = await this.getUserPermissions(userId);

      // Check custom permissions first (higher priority)
      const customPermission = this.checkCustomPermissions(
        userPermissions.customPermissions,
        permissionKey,
        resourceId,
        resourceType
      );

      if (customPermission !== null) {
        return customPermission;
      }

      // Fall back to role-based permissions
      return await this.checkRolePermissions(
        userPermissions.role,
        permissionKey,
        resourceId
      );

    } catch (error) {
      console.error('Error checking permissions:', error);
      return false;
    }
  }

  /**
   * Check if user can edit a specific resource
   */
  async canEdit(userId: string, resourceType: string, resourceId: string): Promise<boolean> {
    return this.hasPermission(userId, `${resourceType}.edit`, resourceId, resourceType);
  }

  /**
   * Check if user can view a specific resource
   */
  async canView(userId: string, resourceType: string, resourceId: string): Promise<boolean> {
    return this.hasPermission(userId, `${resourceType}.view`, resourceId, resourceType);
  }

  /**
   * Check if user can delete a specific resource
   */
  async canDelete(userId: string, resourceType: string, resourceId: string): Promise<boolean> {
    return this.hasPermission(userId, `${resourceType}.delete`, resourceId, resourceType);
  }

  /**
   * Check if user can publish/create resources of a type
   */
  async canPublish(userId: string, resourceType: string): Promise<boolean> {
    return this.hasPermission(userId, `${resourceType}.publish`);
  }

  /**
   * Get all permissions for a user
   */
  async getUserPermissions(userId: string): Promise<UserPermissions> {
    // Get user basic info
    const { data: user, error: userError } = await this.supabase
      .from('users')
      .select('role, subrole')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      throw new Error('User not found');
    }

    // Get custom permissions
    const { data: customPermissions, error: customError } = await this.supabase
      .from('user_custom_permissions')
      .select('*')
      .eq('user_id', userId)
      .gt('expires_at', new Date().toISOString())
      .or('expires_at.is.null');

    if (customError) {
      console.error('Error fetching custom permissions:', customError);
    }

    return {
      role: user.role,
      subrole: user.subrole,
      customPermissions: customPermissions || []
    };
  }

  /**
   * Check custom user permissions
   */
  private checkCustomPermissions(
    customPermissions: UserPermissions['customPermissions'],
    permissionKey: string,
    resourceId?: string,
    resourceType?: string
  ): boolean | null {
    for (const customPerm of customPermissions) {
      // Map permission types to permission keys
      const permissionMappings: Record<string, string[]> = {
        'content_block': ['content.view', 'content.edit', 'content.delete', 'content.publish'],
        'form': ['forms.view', 'forms.edit', 'forms.delete', 'forms.publish'],
        'blog_post': ['blog.view', 'blog.edit', 'blog.delete', 'blog.publish'],
        'volunteer': ['volunteers.view', 'volunteers.edit', 'volunteers.approve', 'volunteers.assign']
      };

      const mappedPermissions = permissionMappings[customPerm.permissionType] || [];

      // Check if the requested permission key matches this custom permission type
      if (mappedPermissions.some(mappedPerm => mappedPerm === permissionKey)) {
        // Check resource scope
        if (customPerm.resourceId === null || customPerm.resourceId === resourceId) {
          // Map permission key to custom permission key
          const customKey = this.mapPermissionKeyToCustom(permissionKey);
          if (customKey && customPerm.permissions[customKey] !== undefined) {
            // Check if permission hasn't expired
            if (customPerm.expiresAt && new Date(customPerm.expiresAt) < new Date()) {
              return false; // Permission expired
            }
            return customPerm.permissions[customKey];
          }
        }
      }
    }

    return null; // No custom permission found, fall back to role permissions
  }

  /**
   * Map standard permission keys to custom permission keys
   */
  private mapPermissionKeyToCustom(permissionKey: string): string | null {
    const mappings: Record<string, string> = {
      'content.view': 'can_view',
      'content.edit': 'can_edit',
      'content.delete': 'can_delete',
      'content.publish': 'can_publish',
      'forms.view': 'can_view',
      'forms.edit': 'can_edit',
      'forms.delete': 'can_delete',
      'forms.publish': 'can_publish',
      'blog.view': 'can_view',
      'blog.edit': 'can_edit',
      'blog.delete': 'can_delete',
      'blog.publish': 'can_publish',
      'volunteers.view': 'can_view',
      'volunteers.edit': 'can_edit',
      'volunteers.approve': 'can_approve',
      'volunteers.assign': 'can_assign'
    };

    return mappings[permissionKey] || null;
  }

  /**
   * Check role-based permissions
   */
  private async checkRolePermissions(
    userRole: string,
    permissionKey: string,
    resourceId?: string
  ): Promise<boolean> {
    const { data: permissions, error } = await this.supabase
      .from('role_permissions')
      .select('granted, resource_scope')
      .eq('role', userRole)
      .eq('permission_key', permissionKey);

    if (error) {
      console.error('Error checking role permissions:', error);
      return false;
    }

    if (!permissions || permissions.length === 0) {
      return false;
    }

    // Check each matching permission
    for (const perm of permissions) {
      if (!perm.granted) {
        continue;
      }

      // If no resource scope specified, permission applies globally
      if (!perm.resource_scope && !resourceId) {
        return true;
      }

      // Check resource-specific scope
      if (perm.resource_scope && resourceId) {
        // For now, support simple resource ID matching
        // Could be extended to support more complex scope matching
        if (perm.resource_scope.includes(resourceId)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Grant custom permission to user
   */
  async grantCustomPermission(
    granterUserId: string,
    targetUserId: string,
    permission: {
      permissionType: string;
      resourceId?: string;
      permissions: Record<string, boolean>;
      expiresAt?: Date;
      notes?: string;
    }
  ): Promise<void> {
    // Check if granter has permission to grant permissions
    const canGrant = await this.hasPermission(granterUserId, 'permissions.edit');
    if (!canGrant) {
      throw new Error('Insufficient permissions to grant custom permissions');
    }

    const { error } = await this.supabase
      .from('user_custom_permissions')
      .insert({
        user_id: targetUserId,
        permission_type: permission.permissionType,
        resource_id: permission.resourceId || null,
        permissions: permission.permissions,
        granted_by: granterUserId,
        expires_at: permission.expiresAt?.toISOString(),
        notes: permission.notes
      });

    if (error) {
      throw new Error(`Failed to grant permission: ${error.message}`);
    }
  }

  /**
   * Revoke custom permission
   */
  async revokeCustomPermission(
    revokerUserId: string,
    permissionId: string
  ): Promise<void> {
    // Check if revoker has permission to revoke permissions
    const canRevoke = await this.hasPermission(revokerUserId, 'permissions.edit');
    if (!canRevoke) {
      throw new Error('Insufficient permissions to revoke custom permissions');
    }

    const { error } = await this.supabase
      .from('user_custom_permissions')
      .delete()
      .eq('id', permissionId);

    if (error) {
      throw new Error(`Failed to revoke permission: ${error.message}`);
    }
  }

  /**
   * Update role permissions (admin only)
   */
  async updateRolePermissions(
    updaterUserId: string,
    role: string,
    permissions: Array<{
      permissionKey: string;
      granted: boolean;
      resourceScope?: Record<string, any>;
    }>
  ): Promise<void> {
    // Check if updater has permission to manage permissions
    const canUpdate = await this.hasPermission(updaterUserId, 'permissions.edit');
    if (!canUpdate) {
      throw new Error('Insufficient permissions to update role permissions');
    }

    // Delete existing permissions for this role
    await this.supabase
      .from('role_permissions')
      .delete()
      .eq('role', role);

    // Insert new permissions
    const permissionInserts = permissions.map(perm => ({
      role,
      permission_key: perm.permissionKey,
      granted: perm.granted,
      resource_scope: perm.resourceScope
    }));

    const { error } = await this.supabase
      .from('role_permissions')
      .insert(permissionInserts);

    if (error) {
      throw new Error(`Failed to update role permissions: ${error.message}`);
    }
  }

  /**
   * Get all roles and their permissions
   */
  async getAllRolePermissions(): Promise<Record<string, Array<{
    permissionKey: string;
    granted: boolean;
    resourceScope?: Record<string, any>;
  }>>> {
    const { data, error } = await this.supabase
      .from('role_permissions')
      .select('*')
      .order('role, permission_key');

    if (error) {
      throw new Error(`Failed to fetch role permissions: ${error.message}`);
    }

    const roles: Record<string, any[]> = {};
    for (const perm of data || []) {
      if (!roles[perm.role]) {
        roles[perm.role] = [];
      }
      roles[perm.role].push({
        permissionKey: perm.permission_key,
        granted: perm.granted,
        resourceScope: perm.resource_scope
      });
    }

    return roles;
  }

  /**
   * Get audit trail of permission changes
   */
  async getPermissionAuditLog(
    userId?: string,
    limit = 100
  ): Promise<Array<{
    id: string;
    userId: string;
    permissionType: string;
    action: 'granted' | 'revoked' | 'expired';
    timestamp: string;
    granterUserId?: string;
    notes?: string;
  }>> {
    let query = this.supabase
      .from('user_custom_permissions')
      .select(`
        id,
        user_id,
        permission_type,
        granted_by,
        granted_at,
        expires_at,
        notes
      `)
      .order('granted_at', { ascending: false })
      .limit(limit);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch audit log: ${error.message}`);
    }

    return (data || []).map(item => ({
      id: item.id,
      userId: item.user_id,
      permissionType: item.permission_type,
      action: 'granted' as const,
      timestamp: item.granted_at,
      granterUserId: item.granted_by,
      notes: item.notes
    }));
  }
}

// Export singleton instance
export const permissionEvaluator = new PermissionEvaluator();
