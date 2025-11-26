/**
 * @jest-environment node
 */

import { PermissionEvaluator } from '../lib/permissions/permissionEvaluator';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: null, error: null }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      }))
    })),
    auth: {
      getUser: jest.fn(() => Promise.resolve({ data: { user: { id: 'test-user' } } }))
    }
  }))
}));

describe('PermissionEvaluator', () => {
  let evaluator: PermissionEvaluator;

  beforeEach(() => {
    evaluator = new PermissionEvaluator();
  });

  describe('hasPermission', () => {
    it('should return true for founder role with any permission', async () => {
      // Mock user with founder role
      const mockSupabase = createClient as jest.MockedFunction<typeof createClient>;
      const mockClient = mockSupabase.mock.results[0].value;

      mockClient.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: { role: 'founder', subrole: null },
              error: null
            }))
          }))
        }))
      } as any);

      const result = await evaluator.hasPermission('test-user', 'content.edit');
      expect(result).toBe(true);
    });

    it('should check custom permissions before role permissions', async () => {
      // Mock user with custom permissions
      const mockSupabase = createClient as jest.MockedFunction<typeof createClient>;
      const mockClient = mockSupabase.mock.results[0].value;

      mockClient.from
        .mockReturnValueOnce({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({
                data: { role: 'intern', subrole: null },
                error: null
              }))
            }))
          }))
        } as any)
        .mockReturnValueOnce({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              gt: jest.fn(() => ({
                or: jest.fn(() => Promise.resolve({
                  data: [{
                    permissionType: 'content_block',
                    resourceId: 'test-resource',
                    permissions: { can_edit: true }
                  }],
                  error: null
                }))
              }))
            }))
          }))
        } as any);

      const result = await evaluator.hasPermission('test-user', 'content.edit', 'test-resource');
      expect(result).toBe(true);
    });

    it('should fall back to role permissions when no custom permissions exist', async () => {
      // Mock user with intern role and no custom permissions
      const mockSupabase = createClient as jest.MockedFunction<typeof createClient>;
      const mockClient = mockSupabase.mock.results[0].value;

      mockClient.from
        .mockReturnValueOnce({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({
                data: { role: 'intern', subrole: null },
                error: null
              }))
            }))
          }))
        } as any)
        .mockReturnValueOnce({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              gt: jest.fn(() => ({
                or: jest.fn(() => Promise.resolve({
                  data: [],
                  error: null
                }))
              }))
            }))
          }))
        } as any)
        .mockReturnValueOnce({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({
                data: { granted: true },
                error: null
              }))
            }))
          }))
        } as any);

      const result = await evaluator.hasPermission('test-user', 'content.edit');
      expect(result).toBe(true);
    });
  });

  describe('checkCustomPermissions', () => {
    it('should return custom permission when found', () => {
      const customPermissions = [
        {
          permissionType: 'content_block',
          resourceId: 'test-resource',
          permissions: { can_edit: true, can_view: false },
          expiresAt: null
        }
      ];

      const result = (evaluator as any).checkCustomPermissions(
        customPermissions,
        'content.edit',
        'test-resource'
      );

      expect(result).toBe(true);
    });

    it('should return null when no custom permission found', () => {
      const customPermissions: any[] = [];

      const result = (evaluator as any).checkCustomPermissions(
        customPermissions,
        'content.edit',
        'test-resource'
      );

      expect(result).toBe(null);
    });
  });

  describe('mapPermissionKeyToCustom', () => {
    it('should correctly map permission keys', () => {
      expect((evaluator as any).mapPermissionKeyToCustom('content.view')).toBe('can_view');
      expect((evaluator as any).mapPermissionKeyToCustom('content.edit')).toBe('can_edit');
      expect((evaluator as any).mapPermissionKeyToCustom('forms.view')).toBe('can_view');
      expect((evaluator as any).mapPermissionKeyToCustom('volunteers.approve')).toBe('can_approve');
      expect((evaluator as any).mapPermissionKeyToCustom('unknown.permission')).toBe(null);
    });
  });
});
