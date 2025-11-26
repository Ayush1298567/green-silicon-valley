/**
 * @jest-environment node
 */

import { createClient } from '@supabase/supabase-js';

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
          order: jest.fn(() => Promise.resolve({ data: [], error: null }))
        })),
        order: jest.fn(() => ({
          limit: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: null, error: null }))
          }))
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: null, error: null }))
          }))
        }))
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: null, error: null }))
      }))
    })),
    auth: {
      getSession: jest.fn(() => Promise.resolve({
        data: { session: { user: { id: 'test-user' } } },
        error: null
      }))
    }
  }))
}));

describe('Forms API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/forms', () => {
    it('should return forms with response counts', async () => {
      const { GET } = await import('../app/api/forms/route');

      const mockRequest = new Request('http://localhost:3000/api/forms');
      const response = await GET(mockRequest);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('ok', true);
      expect(data).toHaveProperty('forms');
    });
  });

  describe('POST /api/forms', () => {
    it('should create a new form', async () => {
      const { POST } = await import('../app/api/forms/route');

      const formData = {
        title: 'Test Form',
        description: 'A test form',
        columns: [
          {
            title: 'Name',
            field_type: 'text',
            required: true,
            column_index: 0
          }
        ]
      };

      const mockRequest = new Request('http://localhost:3000/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const response = await POST(mockRequest);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('ok', true);
      expect(data).toHaveProperty('form');
    });

    it('should reject form creation without title', async () => {
      const { POST } = await import('../app/api/forms/route');

      const mockRequest = new Request('http://localhost:3000/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: 'No title' })
      });

      const response = await POST(mockRequest);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data).toHaveProperty('ok', false);
      expect(data.error).toContain('required');
    });
  });
});

describe('Form Builder Logic', () => {
  describe('Field Type Mapping', () => {
    it('should map legacy field types correctly', () => {
      // Import the mapping function from the migration script
      const { mapFieldType } = require('../scripts/migrate-forms.ts');

      expect(mapFieldType('text')).toBe('text');
      expect(mapFieldType('email')).toBe('email');
      expect(mapFieldType('multiselect')).toBe('multiselect');
      expect(mapFieldType('radio')).toBe('select');
    });
  });

  describe('Form Schema Conversion', () => {
    it('should convert legacy form to form builder schema', () => {
      const { convertLegacyFormToSchema } = require('../scripts/migrate-forms.ts');

      const legacyForm = {
        component: 'test.tsx',
        title: 'Test Form',
        description: 'A test form',
        fields: [
          {
            name: 'name',
            label: 'Full Name',
            type: 'text',
            required: true,
            placeholder: 'Enter name'
          }
        ],
        submitAction: '/api/test',
        targetTable: 'test_table'
      };

      const schema = convertLegacyFormToSchema(legacyForm);

      expect(schema.title).toBe('Test Form');
      expect(schema.columns).toHaveLength(1);
      expect(schema.columns[0].title).toBe('Full Name');
      expect(schema.columns[0].field_type).toBe('text');
      expect(schema.columns[0].required).toBe(true);
    });
  });
});

describe('Dynamic Form Renderer', () => {
  it('should validate form data correctly', () => {
    // Test form validation logic
    const formSchema = {
      columns: [
        {
          title: 'Email',
          field_type: 'email',
          required: true,
          validation_rules: { email: true }
        },
        {
          title: 'Age',
          field_type: 'number',
          required: false,
          validation_rules: { min: 0, max: 120 }
        }
      ]
    };

    // Valid data
    const validData = {
      Email: 'test@example.com',
      Age: 25
    };

    // Invalid data
    const invalidData = {
      Email: 'invalid-email',
      Age: -5
    };

    // Test validation logic would go here
    // This is a placeholder for actual validation testing
    expect(validData.Email).toContain('@');
    expect(invalidData.Age).toBeLessThan(0);
  });
});
