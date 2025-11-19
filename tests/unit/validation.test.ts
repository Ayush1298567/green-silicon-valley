import {
  validateEmail,
  validateUUID,
  validateRequired,
  validateString,
  validateNumber,
  validateEnum,
  validateArray,
  validateMaterialRequest,
  sanitizeString
} from '../../lib/validation';

describe('lib/validation.ts', () => {
  describe('validateEmail', () => {
    it('accepts valid email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true);
      expect(validateEmail('test@subdomain.domain.com')).toBe(true);
    });

    it('rejects invalid email addresses', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('test')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });

    it('rejects null and undefined', () => {
      expect(validateEmail(null as any)).toBe(false);
      expect(validateEmail(undefined as any)).toBe(false);
    });
  });

  describe('validateUUID', () => {
    it('accepts valid UUIDs', () => {
      const validUUID = '550e8400-e29b-41d4-a716-446655440000';
      expect(validateUUID(validUUID, 'testField').isValid).toBe(true);
    });

    it('rejects invalid UUIDs', () => {
      expect(validateUUID('invalid-uuid', 'testField').isValid).toBe(false);
      expect(validateUUID('123', 'testField').isValid).toBe(false);
      expect(validateUUID('', 'testField').isValid).toBe(false);
      expect(validateUUID('550e8400-e29b-41d4-a716', 'testField').isValid).toBe(false); // Too short
    });

    it('rejects null and undefined', () => {
      expect(validateUUID(null as any, 'testField').isValid).toBe(false);
      expect(validateUUID(undefined as any, 'testField').isValid).toBe(false);
    });
  });

  describe('validateRequired', () => {
    it('accepts non-empty values', () => {
      expect(validateRequired('test', 'field')).toEqual({ isValid: true });
      expect(validateRequired(123, 'field')).toEqual({ isValid: true });
      expect(validateRequired(false, 'field')).toEqual({ isValid: true });
    });

    it('rejects empty values', () => {
      expect(validateRequired('', 'field')).toEqual({
        isValid: false,
        error: 'field is required'
      });
      expect(validateRequired(null, 'field')).toEqual({
        isValid: false,
        error: 'field is required'
      });
      expect(validateRequired(undefined, 'field')).toEqual({
        isValid: false,
        error: 'field is required'
      });
    });
  });

  describe('validateString', () => {
    it('accepts valid strings', () => {
      expect(validateString('test', 'field')).toEqual({ isValid: true });
      expect(validateString('a'.repeat(100), 'field', { maxLength: 200 })).toEqual({ isValid: true });
    });

    it('validates minimum length', () => {
      expect(validateString('abc', 'field', { minLength: 5 })).toEqual({
        isValid: false,
        error: 'field must be at least 5 characters long'
      });
      expect(validateString('abcdef', 'field', { minLength: 5 })).toEqual({ isValid: true });
    });

    it('validates maximum length', () => {
      expect(validateString('a'.repeat(101), 'field', { maxLength: 100 })).toEqual({
        isValid: false,
        error: 'field must be no more than 100 characters long'
      });
      expect(validateString('a'.repeat(50), 'field', { maxLength: 100 })).toEqual({ isValid: true });
    });

    it('rejects non-strings', () => {
      expect(validateString(123, 'field')).toEqual({
        isValid: false,
        error: 'field must be a string'
      });
      expect(validateString(null, 'field')).toEqual({
        isValid: false,
        error: 'field must be a string'
      });
    });
  });

  describe('validateNumber', () => {
    it('accepts valid numbers', () => {
      expect(validateNumber(123, 'field')).toEqual({ isValid: true });
      expect(validateNumber(123.45, 'field')).toEqual({ isValid: true });
      expect(validateNumber(0, 'field')).toEqual({ isValid: true });
    });

    it('validates minimum value', () => {
      expect(validateNumber(5, 'field', { min: 10 })).toEqual({
        isValid: false,
        error: 'field must be at least 10'
      });
      expect(validateNumber(15, 'field', { min: 10 })).toEqual({ isValid: true });
    });

    it('validates maximum value', () => {
      expect(validateNumber(15, 'field', { max: 10 })).toEqual({
        isValid: false,
        error: 'field must be no more than 10'
      });
      expect(validateNumber(5, 'field', { max: 10 })).toEqual({ isValid: true });
    });

    it('validates integer requirement', () => {
      expect(validateNumber(123.45, 'field', { integer: true })).toEqual({
        isValid: false,
        error: 'field must be an integer'
      });
      expect(validateNumber(123, 'field', { integer: true })).toEqual({ isValid: true });
    });

    it('rejects non-numbers', () => {
      expect(validateNumber('123', 'field')).toEqual({
        isValid: false,
        error: 'field must be a valid number'
      });
      expect(validateNumber(NaN, 'field')).toEqual({
        isValid: false,
        error: 'field must be a valid number'
      });
    });
  });

  describe('validateEnum', () => {
    const validValues = ['option1', 'option2', 'option3'] as const;

    it('accepts valid enum values', () => {
      expect(validateEnum('option1', validValues, 'field')).toEqual({ isValid: true });
      expect(validateEnum('option2', validValues, 'field')).toEqual({ isValid: true });
    });

    it('rejects invalid enum values', () => {
      expect(validateEnum('invalid', validValues, 'field')).toEqual({
        isValid: false,
        error: 'field must be one of: option1, option2, option3'
      });
    });
  });

  describe('validateArray', () => {
    it('accepts valid arrays', () => {
      expect(validateArray([1, 2, 3], 'field')).toEqual({ isValid: true });
      expect(validateArray([], 'field')).toEqual({ isValid: true });
    });

    it('validates minimum length', () => {
      expect(validateArray([], 'field', { minLength: 1 })).toEqual({
        isValid: false,
        error: 'field must contain at least 1 items'
      });
      expect(validateArray([1], 'field', { minLength: 1 })).toEqual({ isValid: true });
    });

    it('validates maximum length', () => {
      expect(validateArray([1, 2, 3], 'field', { maxLength: 2 })).toEqual({
        isValid: false,
        error: 'field must contain no more than 2 items'
      });
      expect(validateArray([1, 2], 'field', { maxLength: 2 })).toEqual({ isValid: true });
    });

    it('validates item constraints', () => {
      const itemValidator = (item: any) => {
        return typeof item === 'number'
          ? { isValid: true }
          : { isValid: false, error: 'must be number' };
      };

      expect(validateArray([1, 2, 'invalid'], 'field', { itemValidator })).toEqual({
        isValid: false,
        error: 'Item 2 in field: must be number'
      });

      expect(validateArray([1, 2, 3], 'field', { itemValidator })).toEqual({ isValid: true });
    });

    it('rejects non-arrays', () => {
      expect(validateArray('not array', 'field')).toEqual({
        isValid: false,
        error: 'field must be an array'
      });
    });
  });

  describe('validateMaterialRequest', () => {
    const validRequest = {
      presentationId: '550e8400-e29b-41d4-a716-446655440000',
      requestType: 'gsv_provided' as const,
      items: [{
        category: 'science_equipment' as const,
        name: 'pH Strips',
        quantity: 1,
        estimated_cost: 15.00
      }],
      deliveryPreference: 'school_address' as const,
      neededByDate: '2024-02-01'
    };

    it('accepts valid material requests', () => {
      const result = validateMaterialRequest(validRequest);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects requests with invalid presentationId', () => {
      const invalidRequest = { ...validRequest, presentationId: 'invalid-uuid' };
      const result = validateMaterialRequest(invalidRequest);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('presentationId: Invalid UUID format');
    });

    it('rejects requests with invalid requestType', () => {
      const invalidRequest = { ...validRequest, requestType: 'invalid_type' as any };
      const result = validateMaterialRequest(invalidRequest);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('requestType must be one of: gsv_provided, volunteer_funded, kit_recommendation');
    });

    it('rejects requests over budget', () => {
      const overBudgetRequest = {
        ...validRequest,
        items: [{
          category: 'science_equipment' as const,
          name: 'Expensive Item',
          quantity: 1,
          estimated_cost: 30.00 // Over $25 limit
        }]
      };
      const result = validateMaterialRequest(overBudgetRequest);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Total cost $30.00 exceeds budget limit of $25.00');
    });

    it('rejects requests with invalid items', () => {
      const invalidItemsRequest = {
        ...validRequest,
        items: [{
          category: 'invalid_category' as any,
          name: '',
          quantity: 0,
          estimated_cost: -5
        }]
      };
      const result = validateMaterialRequest(invalidItemsRequest);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('rejects requests with missing required fields', () => {
      const incompleteRequest = { requestType: 'gsv_provided' as const };
      const result = validateMaterialRequest(incompleteRequest as any);
      expect(result.isValid).toBe(false);
      // The validation will fail on UUID format before checking required fields
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('sanitizeString', () => {
    it('removes dangerous HTML', () => {
      expect(sanitizeString('<script>alert("xss")</script>Hello')).toBe('Hello');
      expect(sanitizeString('<b>Bold</b> text')).toBe('Bold text');
    });

    it('respects max length', () => {
      const longString = 'a'.repeat(200);
      expect(sanitizeString(longString, { maxLength: 100 })).toHaveLength(100);
    });

    it('handles null and undefined', () => {
      expect(sanitizeString(null as any)).toBe('');
      expect(sanitizeString(undefined as any)).toBe('');
    });

    it('trims whitespace', () => {
      expect(sanitizeString('  hello world  ')).toBe('hello world');
    });
  });
});
