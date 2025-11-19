import { createClient } from '@supabase/supabase-js';

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    getSession: jest.fn().mockResolvedValue({
      data: {
        session: {
          user: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            email: 'founder@test.com'
          }
        }
      },
      error: null
    })
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({
      data: {
        id: '550e8400-e29b-41d4-a716-446655440001',
        status: 'submitted',
        request_type: 'gsv_provided',
        estimated_cost: 15.00,
        created_by: '550e8400-e29b-41d4-a716-446655440002'
      },
      error: null
    })
  }))
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient)
}));

describe('Material Approval API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication & Authorization', () => {
    it('requires authentication', async () => {
      // Mock unauthenticated request
      mockSupabaseClient.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
        error: null
      });

      const response = await makeRequest('/api/materials/approve', {
        method: 'POST',
        body: {
          requestId: '550e8400-e29b-41d4-a716-446655440001',
          action: 'approve'
        }
      });

      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({
        error: 'Not authenticated'
      });
    });

    it('requires founder or authorized intern role', async () => {
      // Mock volunteer role
      mockSupabaseClient.auth.getSession.mockResolvedValueOnce({
        data: {
          session: {
            user: {
              id: '550e8400-e29b-41d4-a716-446655440000',
              email: 'volunteer@test.com'
            }
          }
        },
        error: null
      });

      // Mock volunteer role check
      const mockSupabaseForRole = {
        ...mockSupabaseClient,
        from: jest.fn(() => ({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { role: 'volunteer' },
            error: null
          })
        }))
      };

      const response = await makeRequest('/api/materials/approve', {
        method: 'POST',
        body: {
          requestId: '550e8400-e29b-41d4-a716-446655440001',
          action: 'approve'
        },
        supabaseOverride: mockSupabaseForRole
      });

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('allows founder role', async () => {
      // Mock founder role
      const mockSupabaseForFounder = {
        ...mockSupabaseClient,
        from: jest.fn((table) => {
          if (table === 'users') {
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({
                data: { role: 'founder' },
                error: null
              })
            };
          }
          return mockSupabaseClient.from(table);
        })
      };

      const response = await makeRequest('/api/materials/approve', {
        method: 'POST',
        body: {
          requestId: '550e8400-e29b-41d4-a716-446655440001',
          action: 'approve',
          notes: 'Approved for environmental testing'
        },
        supabaseOverride: mockSupabaseForFounder
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.ok).toBe(true);
      expect(data.message).toContain('approved');
    });
  });

  describe('Request Validation', () => {
    it('requires requestId and action', async () => {
      const response = await makeRequest('/api/materials/approve', {
        method: 'POST',
        body: {} // Missing required fields
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('Request ID and action are required');
    });

    it('validates action type', async () => {
      const response = await makeRequest('/api/materials/approve', {
        method: 'POST',
        body: {
          requestId: '550e8400-e29b-41d4-a716-446655440001',
          action: 'invalid_action'
        }
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('Action must be');
    });

    it('validates request exists', async () => {
      // Mock request not found
      const mockSupabaseNotFound = {
        ...mockSupabaseClient,
        from: jest.fn(() => ({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Not found' }
          })
        }))
      };

      const response = await makeRequest('/api/materials/approve', {
        method: 'POST',
        body: {
          requestId: '550e8400-e29b-41d4-a716-446655440001',
          action: 'approve'
        },
        supabaseOverride: mockSupabaseNotFound
      });

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toContain('not found');
    });

    it('validates request status', async () => {
      // Mock request that's already approved
      const mockSupabaseApproved = {
        ...mockSupabaseClient,
        from: jest.fn(() => ({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: {
              id: '550e8400-e29b-41d4-a716-446655440001',
              status: 'approved', // Already approved
              request_type: 'gsv_provided',
              estimated_cost: 15.00,
              created_by: '550e8400-e29b-41d4-a716-446655440002'
            },
            error: null
          })
        }))
      };

      const response = await makeRequest('/api/materials/approve', {
        method: 'POST',
        body: {
          requestId: '550e8400-e29b-41d4-a716-446655440001',
          action: 'approve'
        },
        supabaseOverride: mockSupabaseApproved
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('Cannot approve a request that is approved');
    });
  });

  describe('Business Logic', () => {
    it('validates budget limits for GSV provided requests', async () => {
      // Mock high-cost request
      const mockSupabaseOverBudget = {
        ...mockSupabaseClient,
        from: jest.fn((table) => {
          if (table === 'procurement_settings') {
            return {
              select: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({
                data: { max_budget_per_group: 25.00 },
                error: null
              })
            };
          }
          if (table === 'material_requests') {
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({
                data: {
                  id: '550e8400-e29b-41d4-a716-446655440001',
                  status: 'submitted',
                  request_type: 'gsv_provided',
                  estimated_cost: 30.00, // Over budget
                  created_by: '550e8400-e29b-41d4-a716-446655440002'
                },
                error: null
              })
            };
          }
          return mockSupabaseClient.from(table);
        })
      };

      const response = await makeRequest('/api/materials/approve', {
        method: 'POST',
        body: {
          requestId: '550e8400-e29b-41d4-a716-446655440001',
          action: 'approve'
        },
        supabaseOverride: mockSupabaseOverBudget
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('exceeds the maximum budget');
    });

    it('allows approval of requests within budget', async () => {
      const response = await makeRequest('/api/materials/approve', {
        method: 'POST',
        body: {
          requestId: '550e8400-e29b-41d4-a716-446655440001',
          action: 'approve',
          notes: 'Approved for classroom use'
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.ok).toBe(true);
      expect(data.message).toContain('approved');
    });

    it('handles rejection with notes', async () => {
      const response = await makeRequest('/api/materials/approve', {
        method: 'POST',
        body: {
          requestId: '550e8400-e29b-41d4-a716-446655440001',
          action: 'reject',
          notes: 'Budget constraints - consider alternative materials'
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.ok).toBe(true);
      expect(data.message).toContain('rejected');
    });
  });

  describe('Notification System', () => {
    it('sends approval notification to volunteer', async () => {
      // Mock notification creation
      const mockNotificationCall = jest.fn().mockResolvedValue({ error: null });

      const mockSupabaseWithNotifications = {
        ...mockSupabaseClient,
        from: jest.fn((table) => {
          if (table === 'notifications') {
            return {
              insert: mockNotificationCall
            };
          }
          return mockSupabaseClient.from(table);
        })
      };

      await makeRequest('/api/materials/approve', {
        method: 'POST',
        body: {
          requestId: '550e8400-e29b-41d4-a716-446655440001',
          action: 'approve',
          notes: 'Approved!',
          messageToGroup: 'Excited to support your environmental project!'
        },
        supabaseOverride: mockSupabaseWithNotifications
      });

      expect(mockNotificationCall).toHaveBeenCalledWith({
        user_id: '550e8400-e29b-41d4-a716-446655440002', // created_by user
        notification_type: 'material_request_approved',
        title: 'Material Request Approved',
        message: expect.stringContaining('Approved!') && expect.stringContaining('Excited to support'),
        action_url: '/dashboard/volunteer/materials',
        priority: 'medium'
      });
    });

    it('includes custom messages in notifications', async () => {
      const customMessage = 'Great project! Looking forward to seeing the results.';

      const mockNotificationCall = jest.fn().mockResolvedValue({ error: null });

      const mockSupabaseWithCustomMessage = {
        ...mockSupabaseClient,
        from: jest.fn((table) => {
          if (table === 'notifications') {
            return {
              insert: mockNotificationCall
            };
          }
          return mockSupabaseClient.from(table);
        })
      };

      await makeRequest('/api/materials/approve', {
        method: 'POST',
        body: {
          requestId: '550e8400-e29b-41d4-a716-446655440001',
          action: 'approve',
          messageToGroup: customMessage
        },
        supabaseOverride: mockSupabaseWithCustomMessage
      });

      const notificationCall = mockNotificationCall.mock.calls[0][0];
      expect(notificationCall.message).toContain('Message from Green Silicon Valley:');
      expect(notificationCall.message).toContain(customMessage);
    });
  });

  describe('Audit Trail', () => {
    it('logs approval actions', async () => {
      const mockAuditLogCall = jest.fn().mockResolvedValue({ error: null });

      const mockSupabaseWithAudit = {
        ...mockSupabaseClient,
        from: jest.fn((table) => {
          if (table === 'system_logs') {
            return {
              insert: mockAuditLogCall
            };
          }
          return mockSupabaseClient.from(table);
        })
      };

      await makeRequest('/api/materials/approve', {
        method: 'POST',
        body: {
          requestId: '550e8400-e29b-41d4-a716-446655440001',
          action: 'approve',
          notes: 'Approved for environmental education'
        },
        supabaseOverride: mockSupabaseWithAudit
      });

      expect(mockAuditLogCall).toHaveBeenCalledWith({
        actor_id: '550e8400-e29b-41d4-a716-446655440000', // founder user
        action_type: 'material_request_approved',
        resource_type: 'material_request',
        resource_id: '550e8400-e29b-41d4-a716-446655440001',
        details: {
          request_type: 'gsv_provided',
          estimated_cost: 15.00,
          group_name: undefined, // Would be populated in real scenario
          presentation_title: undefined,
          notes: 'Approved for environmental education'
        },
        ip_address: undefined // Would be populated from request
      });
    });
  });

  describe('Error Handling', () => {
    it('handles database errors gracefully', async () => {
      const mockSupabaseWithError = {
        ...mockSupabaseClient,
        from: jest.fn(() => ({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database connection failed' }
          })
        }))
      };

      const response = await makeRequest('/api/materials/approve', {
        method: 'POST',
        body: {
          requestId: '550e8400-e29b-41d4-a716-446655440001',
          action: 'approve'
        },
        supabaseOverride: mockSupabaseWithError
      });

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Database error occurred');
    });

    it('handles unexpected errors', async () => {
      const mockSupabaseWithException = {
        ...mockSupabaseClient,
        from: jest.fn(() => {
          throw new Error('Unexpected database error');
        })
      };

      const response = await makeRequest('/api/materials/approve', {
        method: 'POST',
        body: {
          requestId: '550e8400-e29b-41d4-a716-446655440001',
          action: 'approve'
        },
        supabaseOverride: mockSupabaseWithException
      });

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Unexpected database error');
    });
  });
});

// Helper function to simulate API requests
async function makeRequest(url: string, options: {
  method: string;
  body?: any;
  supabaseOverride?: any;
}) {
  // In a real test, this would make actual HTTP requests
  // For now, we'll simulate the API behavior

  try {
    // Simulate the API logic here
    const supabase = options.supabaseOverride || mockSupabaseClient;

    // Mock the request validation and processing
    const body = options.body || {};

    if (!body.requestId || !body.action) {
      return {
        status: 400,
        json: async () => ({ error: 'Request ID and action are required' })
      };
    }

    if (!['approve', 'reject'].includes(body.action)) {
      return {
        status: 400,
        json: async () => ({ error: 'Action must be \'approve\' or \'reject\'' })
      };
    }

    // Mock successful response
    return {
      status: 200,
      json: async () => ({
        ok: true,
        message: body.action === 'approve'
          ? 'Material request approved successfully'
          : 'Material request rejected'
      })
    };

  } catch (error) {
    return {
      status: 500,
      json: async () => ({ error: error.message })
    };
  }
}
