// Jest setup file
import { jest } from '@jest/globals';

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

// Mock console methods to reduce noise during tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  // Suppress console warnings/errors during tests unless they're from our code
  console.error = (...args) => {
    if (args[0] && typeof args[0] === 'string' && args[0].includes('Test')) {
      originalConsoleError(...args);
    }
  };

  console.warn = (...args) => {
    if (args[0] && typeof args[0] === 'string' && args[0].includes('Test')) {
      originalConsoleWarn(...args);
    }
  };
});

afterAll(() => {
  // Restore console methods
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Global test utilities
global.testUser = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'test@example.com',
  name: 'Test User',
  role: 'volunteer'
};

global.testFounder = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  email: 'founder@example.com',
  name: 'Test Founder',
  role: 'founder'
};

global.testPresentation = {
  id: '550e8400-e29b-41d4-a716-446655440002',
  title: 'Test Presentation',
  scheduled_date: '2024-02-01',
  volunteer_team_id: '550e8400-e29b-41d4-a716-446655440000'
};

// Helper to create mock Supabase client
global.createMockSupabase = () => ({
  auth: {
    getSession: jest.fn().mockResolvedValue({
      data: { session: { user: global.testUser } },
      error: null
    }),
    getUser: jest.fn().mockResolvedValue({
      data: { user: global.testUser },
      error: null
    })
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis()
  }))
});
