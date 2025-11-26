import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { permissionEvaluator } from './permissionEvaluator';

// Types for permission middleware
export type PermissionRequirement = {
  permission: string;
  resourceId?: string;
  resourceType?: string;
  requireAll?: boolean; // If multiple permissions, require all (default) or any
};

export type RouteHandler = (req: NextRequest, context?: any) => Promise<NextResponse> | NextResponse;

// Permission middleware wrapper
export function withPermissions(
  handler: RouteHandler,
  requirements: PermissionRequirement | PermissionRequirement[]
): RouteHandler {
  return async (req: NextRequest, context?: any) => {
    try {
      const supabase = createRouteHandlerClient({ cookies });

      // Get authenticated user
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session?.user?.id) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      const userId = session.user.id;
      const requirementsArray = Array.isArray(requirements) ? requirements : [requirements];

      // Check permissions
      const permissionChecks = await Promise.all(
        requirementsArray.map(async (req) => {
          const hasPermission = await permissionEvaluator.hasPermission(
            userId,
            req.permission,
            req.resourceId,
            req.resourceType
          );
          return { requirement: req, hasPermission };
        })
      );

      // Check if user meets requirements
      const hasRequiredPermissions = requirementsArray[0]?.requireAll !== false
        ? permissionChecks.every(check => check.hasPermission) // Require ALL
        : permissionChecks.some(check => check.hasPermission); // Require ANY

      if (!hasRequiredPermissions) {
        // Log the failed permission check for debugging
        const failedChecks = permissionChecks.filter(check => !check.hasPermission);
        console.warn('Permission denied:', {
          userId,
          failedChecks: failedChecks.map(check => ({
            permission: check.requirement.permission,
            resourceId: check.requirement.resourceId,
            resourceType: check.requirement.resourceType
          }))
        });

        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }

      // Add permission context to request for use in handler
      const enhancedReq = req as NextRequest & {
        user: { id: string };
        permissions: typeof permissionChecks;
      };

      enhancedReq.user = { id: userId };
      enhancedReq.permissions = permissionChecks;

      // Call the original handler
      return handler(enhancedReq, context);

    } catch (error: any) {
      console.error('Permission middleware error:', error);
      return NextResponse.json(
        { error: 'Permission check failed' },
        { status: 500 }
      );
    }
  };
}

// Convenience decorators for common permission patterns
export const requireFounder = (handler: RouteHandler) =>
  withPermissions(handler, { permission: 'admin.access' });

export const requireContentEdit = (handler: RouteHandler) =>
  withPermissions(handler, { permission: 'content.edit' });

export const requireFormEdit = (handler: RouteHandler) =>
  withPermissions(handler, { permission: 'forms.edit' });

export const requireUserManagement = (handler: RouteHandler) =>
  withPermissions(handler, { permission: 'users.edit' });

export const requirePermissionManagement = (handler: RouteHandler) =>
  withPermissions(handler, { permission: 'permissions.edit' });

// Resource-specific permission decorators
export const requireContentEditForResource = (resourceId: string) =>
  (handler: RouteHandler) =>
    withPermissions(handler, {
      permission: 'content.edit',
      resourceId,
      resourceType: 'content_block'
    });

export const requireFormEditForResource = (resourceId: string) =>
  (handler: RouteHandler) =>
    withPermissions(handler, {
      permission: 'forms.edit',
      resourceId,
      resourceType: 'form'
    });

// Multiple permission requirements
export const requireAnyPermission = (permissions: PermissionRequirement[]) =>
  (handler: RouteHandler) =>
    withPermissions(handler, permissions.map(p => ({ ...p, requireAll: false })));

export const requireAllPermissions = (permissions: PermissionRequirement[]) =>
  (handler: RouteHandler) =>
    withPermissions(handler, permissions.map(p => ({ ...p, requireAll: true })));

// Helper functions for use within route handlers
export async function checkUserPermission(
  userId: string,
  permission: string,
  resourceId?: string,
  resourceType?: string
): Promise<boolean> {
  return permissionEvaluator.hasPermission(userId, permission, resourceId, resourceType);
}

export async function requirePermission(
  userId: string,
  permission: string,
  resourceId?: string,
  resourceType?: string
): Promise<void> {
  const hasPermission = await permissionEvaluator.hasPermission(
    userId,
    permission,
    resourceId,
    resourceType
  );

  if (!hasPermission) {
    throw new PermissionError(
      `Insufficient permissions: ${permission}`,
      permission,
      resourceId,
      resourceType
    );
  }
}

// Custom error class for permission errors
export class PermissionError extends Error {
  constructor(
    message: string,
    public permission: string,
    public resourceId?: string,
    public resourceType?: string
  ) {
    super(message);
    this.name = 'PermissionError';
  }
}

// Helper to get current user from request context
export async function getCurrentUser() {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user?.id) {
    throw new Error('No authenticated user');
  }

  return session.user;
}

// Helper to get user role
export async function getCurrentUserRole() {
  const user = await getCurrentUser();
  const supabase = createRouteHandlerClient({ cookies });

  const { data: userData } = await supabase
    .from('users')
    .select('role, subrole')
    .eq('id', user.id)
    .single();

  return userData;
}

// Middleware for dynamic resource permissions (extracts resource ID from URL)
export function withResourcePermission(
  permission: string,
  resourceType: string,
  resourceIdParam: string = 'id'
) {
  return (handler: RouteHandler) => {
    return async (req: NextRequest, context?: any) => {
      const params = context?.params as Record<string, string> | undefined;
      const resourceId = params?.[resourceIdParam];

      if (!resourceId) {
        return NextResponse.json(
          { error: 'Resource ID required' },
          { status: 400 }
        );
      }

      return withPermissions(handler, {
        permission,
        resourceId,
        resourceType
      })(req, context);
    };
  };
}

// Pre-configured resource permission middleware
export const requireContentBlockEdit = (resourceIdParam: string = 'id') =>
  withResourcePermission('content.edit', 'content_block', resourceIdParam);

export const requireFormEdit = (resourceIdParam: string = 'id') =>
  withResourcePermission('forms.edit', 'form', resourceIdParam);

export const requireBlogEdit = (resourceIdParam: string = 'id') =>
  withResourcePermission('blog.edit', 'blog_post', resourceIdParam);

// Context-aware permission injection
export async function injectPermissions(req: NextRequest): Promise<NextRequest & { permissions: any }> {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user?.id) {
    throw new Error('Authentication required');
  }

  const userPermissions = await permissionEvaluator.getUserPermissions(session.user.id);

  return Object.assign(req, {
    permissions: userPermissions
  });
}

// Permission-aware data filtering
export async function filterDataByPermissions<T extends Record<string, any>>(
  userId: string,
  data: T[],
  options: {
    resourceType: string;
    permission: string;
    resourceIdField?: string;
  }
): Promise<T[]> {
  const { resourceType, permission, resourceIdField = 'id' } = options;

  const filteredData = await Promise.all(
    data.map(async (item) => {
      const canAccess = await permissionEvaluator.hasPermission(
        userId,
        permission,
        item[resourceIdField],
        resourceType
      );
      return canAccess ? item : null;
    })
  );

  return filteredData.filter((item): item is T => item !== null);
}
