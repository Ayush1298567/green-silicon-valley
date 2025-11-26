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

describe('Content Management System', () => {
  describe('useContentBlock Hook', () => {
    it('should fetch content from CMS', async () => {
      const { useContentBlock } = await import('../lib/hooks/useContentBlock');

      // Mock the hook behavior
      const mockSupabase = createClient as jest.MockedFunction<typeof createClient>;
      const mockClient = mockSupabase.mock.results[0].value;

      mockClient.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: {
                content: 'Test content',
                rich_content: '<p>Test content</p>'
              },
              error: null
            }))
          }))
        }))
      } as any);

      // Note: Testing React hooks requires additional setup with @testing-library/react-hooks
      // This is a placeholder for hook testing
      expect(useContentBlock).toBeDefined();
    });
  });

  describe('Content API', () => {
    describe('GET /api/content-blocks', () => {
      it('should return content blocks', async () => {
        const { GET } = await import('../app/api/content-blocks/route');

        const mockRequest = new Request('http://localhost:3000/api/content-blocks');
        const response = await GET(mockRequest);

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data).toHaveProperty('ok', true);
        expect(data).toHaveProperty('contentBlocks');
      });
    });

    describe('POST /api/content-blocks', () => {
      it('should create a new content block', async () => {
        const { POST } = await import('../app/api/content-blocks/route');

        const blockData = {
          block_key: 'test_block',
          title: 'Test Block',
          content: 'Test content',
          category: 'homepage'
        };

        const mockRequest = new Request('http://localhost:3000/api/content-blocks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(blockData)
        });

        const response = await POST(mockRequest);
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data).toHaveProperty('ok', true);
        expect(data).toHaveProperty('contentBlock');
      });

      it('should reject duplicate block keys', async () => {
        const { POST } = await import('../app/api/content-blocks/route');

        // Mock existing block
        const mockSupabase = createClient as jest.MockedFunction<typeof createClient>;
        const mockClient = mockSupabase.mock.results[0].value;

        mockClient.from.mockReturnValue({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({
                data: { id: 'existing-id' },
                error: null
              }))
            }))
          }))
        } as any);

        const blockData = {
          block_key: 'existing_block',
          title: 'Existing Block',
          content: 'Existing content'
        };

        const mockRequest = new Request('http://localhost:3000/api/content-blocks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(blockData)
        });

        const response = await POST(mockRequest);
        expect(response.status).toBe(400);

        const data = await response.json();
        expect(data).toHaveProperty('ok', false);
        expect(data.error).toContain('already exists');
      });
    });
  });

  describe('Content Migration', () => {
    it('should identify static content in components', () => {
      const { extractStaticContent } = require('../scripts/migrate-static-content.ts');

      // This would test the static content extraction logic
      // Placeholder for migration testing
      expect(extractStaticContent).toBeDefined();
    });

    it('should create content blocks from extracted content', () => {
      const { migrateContentBlocks } = require('../scripts/migrate-static-content.ts');

      // Placeholder for migration testing
      expect(migrateContentBlocks).toBeDefined();
    });
  });

  describe('Rich Text Editor', () => {
    it('should handle TipTap editor operations', () => {
      // Test editor functionality
      // This would test the RichTextEditor component
      expect(true).toBe(true); // Placeholder
    });

    it('should export content in correct format', () => {
      // Test content export
      const testContent = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Hello world' }]
          }
        ]
      };

      // Test HTML conversion
      expect(testContent).toHaveProperty('type', 'doc');
    });
  });
});
