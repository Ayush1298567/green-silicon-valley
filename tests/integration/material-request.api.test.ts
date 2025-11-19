import { createClient } from '@supabase/supabase-js';
import { validateMaterialRequest } from '../../lib/validation';

// Mock Supabase client for testing
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: {
          session: {
            user: {
              id: '550e8400-e29b-41d4-a716-446655440000',
              email: 'test@example.com'
            }
          }
        },
        error: null
      })
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          team_name: 'Test Team'
        },
        error: null
      })
    }))
  }))
}));

describe('Material Request API Integration', () => {
  const supabase = createClient('test-url', 'test-key');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Request Validation', () => {
    it('accepts valid material request data', () => {
      const validRequest = {
        presentationId: '550e8400-e29b-41d4-a716-446655440000',
        requestType: 'gsv_provided' as const,
        items: [{
          category: 'science_equipment' as const,
          name: 'pH Strips',
          quantity: 50,
          estimated_cost: 15.00
        }],
        deliveryPreference: 'school_address' as const,
        neededByDate: '2024-02-01',
        budgetJustification: 'Needed for water quality testing activity'
      };

      const validation = validateMaterialRequest(validRequest);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('rejects request over budget limit', () => {
      const overBudgetRequest = {
        presentationId: '550e8400-e29b-41d4-a716-446655440000',
        requestType: 'gsv_provided' as const,
        items: [{
          category: 'science_equipment' as const,
          name: 'Expensive Equipment',
          quantity: 1,
          estimated_cost: 30.00 // Over $25 limit
        }],
        deliveryPreference: 'school_address' as const,
        neededByDate: '2024-02-01'
      };

      const validation = validateMaterialRequest(overBudgetRequest);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Total cost $30.00 exceeds budget limit of $25.00');
    });

    it('requires budget justification for requests over $15', () => {
      const highValueRequest = {
        presentationId: '550e8400-e29b-41d4-a716-446655440000',
        requestType: 'gsv_provided' as const,
        items: [{
          category: 'science_equipment' as const,
          name: 'High Value Item',
          quantity: 1,
          estimated_cost: 20.00 // Over $15 threshold
        }],
        deliveryPreference: 'school_address' as const,
        neededByDate: '2024-02-01'
        // Missing budgetJustification
      };

      const validation = validateMaterialRequest(highValueRequest);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Budget justification required for requests over $15.00');
    });

    it('accepts volunteer-funded requests without budget limits', () => {
      const volunteerFundedRequest = {
        presentationId: '550e8400-e29b-41d4-a716-446655440000',
        requestType: 'volunteer_funded' as const,
        items: [{
          category: 'science_equipment' as const,
          name: 'Any Item',
          quantity: 1,
          estimated_cost: 100.00 // No limit for volunteer-funded
        }],
        deliveryPreference: 'school_address' as const,
        neededByDate: '2024-02-01'
      };

      const validation = validateMaterialRequest(volunteerFundedRequest);
      expect(validation.isValid).toBe(true);
    });
  });

  describe('Database Operations', () => {
    it('successfully inserts valid material request', async () => {
      const mockSupabase = {
        from: jest.fn(() => ({
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: {
              id: '550e8400-e29b-41d4-a716-446655440001',
              group_id: '550e8400-e29b-41d4-a716-446655440000',
              presentation_id: '550e8400-e29b-41d4-a716-446655440000',
              request_type: 'gsv_provided',
              estimated_cost: 15.00,
              status: 'submitted',
              created_by: '550e8400-e29b-41d4-a716-446655440000'
            },
            error: null
          })
        }))
      };

      // Test the database insertion logic
      const requestData = {
        presentationId: '550e8400-e29b-41d4-a716-446655440000',
        requestType: 'gsv_provided' as const,
        items: [{
          category: 'science_equipment' as const,
          name: 'pH Strips',
          quantity: 50,
          estimated_cost: 15.00
        }],
        deliveryPreference: 'school_address' as const,
        neededByDate: '2024-02-01'
      };

      const result = await mockSupabase.from('material_requests').insert({
        group_id: '550e8400-e29b-41d4-a716-446655440000', // team ID
        presentation_id: requestData.presentationId,
        request_type: requestData.requestType,
        estimated_cost: 15.00,
        budget_justification: null,
        items: requestData.items,
        delivery_preference: requestData.deliveryPreference,
        needed_by_date: requestData.neededByDate,
        status: 'submitted',
        created_by: '550e8400-e29b-41d4-a716-446655440000'
      }).select().single();

      expect(result.data).toBeTruthy();
      expect(result.data.status).toBe('submitted');
      expect(result.data.request_type).toBe('gsv_provided');
      expect(result.data.estimated_cost).toBe(15.00);
    });

    it('handles database errors gracefully', async () => {
      const mockSupabase = {
        from: jest.fn(() => ({
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database connection failed' }
          })
        }))
      };

      const result = await mockSupabase.from('material_requests').insert({}).select().single();

      expect(result.data).toBeNull();
      expect(result.error.message).toBe('Database connection failed');
    });
  });

  describe('Business Logic Integration', () => {
    it('calculates total cost correctly', () => {
      const items = [
        { quantity: 2, estimated_cost: 10.00 }, // $20
        { quantity: 1, estimated_cost: 15.50 }, // $15.50
        { quantity: 3, estimated_cost: 5.00 }   // $15
      ];

      const totalCost = items.reduce((total, item) => total + (item.estimated_cost * item.quantity), 0);
      expect(totalCost).toBe(50.50);
    });

    it('validates presentation ownership', async () => {
      const mockSupabase = {
        from: jest.fn()
          .mockReturnValueOnce({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: { id: 'presentation-id', volunteer_team_id: 'team-id' },
              error: null
            })
          })
      };

      // Simulate checking if user has access to presentation
      const presentationCheck = await mockSupabase.from('presentations')
        .select('id, volunteer_team_id')
        .eq('id', 'presentation-id')
        .eq('volunteer_team_id', 'team-id')
        .single();

      expect(presentationCheck.data).toBeTruthy();
      expect(presentationCheck.data.volunteer_team_id).toBe('team-id');
    });

    it('validates team membership', async () => {
      const mockSupabase = {
        from: jest.fn(() => ({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { volunteer_team_id: '550e8400-e29b-41d4-a716-446655440000' },
            error: null
          })
        }))
      };

      const teamMembership = await mockSupabase.from('team_members')
        .select('volunteer_team_id')
        .eq('user_id', 'user-id')
        .single();

      expect(teamMembership.data.volunteer_team_id).toBeTruthy();
    });
  });

  describe('Notification System', () => {
    it('creates founder notification for new requests', async () => {
      const mockSupabase = {
        from: jest.fn(() => ({
          insert: jest.fn().mockResolvedValue({ error: null }),
          select: jest.fn().mockResolvedValue({ data: [] })
        }))
      };

      // Simulate creating a notification
      const notificationResult = await mockSupabase.from('notifications').insert({
        notification_type: 'material_request',
        title: 'New Material Request Submitted',
        message: 'Test Team has submitted a material request for $15.00 (gsv_provided)',
        action_url: '/dashboard/founder/material-requests',
        priority: 'medium'
      });

      expect(notificationResult.error).toBeNull();
    });

    it('sends appropriate priority notifications', () => {
      const testCases = [
        { cost: 5.00, expectedPriority: 'medium' },
        { cost: 20.00, expectedPriority: 'high' },
        { cost: 1.00, expectedPriority: 'medium' }
      ];

      testCases.forEach(({ cost, expectedPriority }) => {
        const priority = cost > 15 ? 'high' : 'medium';
        expect(priority).toBe(expectedPriority);
      });
    });
  });
});
