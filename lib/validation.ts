// Input validation utilities for API security and data integrity

export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

export function validateUUID(uuid: string, fieldName: string): { isValid: boolean; error?: string } {
  if (!uuid || typeof uuid !== 'string') {
    return { isValid: false, error: `${fieldName}: Invalid UUID format` };
  }
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(uuid.trim())) {
    return { isValid: false, error: `${fieldName}: Invalid UUID format` };
  }
  return { isValid: true };
}

export function validateRequired(value: any, fieldName: string): { isValid: boolean; error?: string } {
  if (value === null || value === undefined || value === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }
  return { isValid: true };
}

export function validateString(value: any, fieldName: string, options?: {
  minLength?: number;
  maxLength?: number;
  allowedChars?: RegExp;
}): { isValid: boolean; error?: string } {
  if (typeof value !== 'string') {
    return { isValid: false, error: `${fieldName} must be a string` };
  }

  const trimmed = value.trim();

  if (options?.minLength && trimmed.length < options.minLength) {
    return { isValid: false, error: `${fieldName} must be at least ${options.minLength} characters long` };
  }

  if (options?.maxLength && trimmed.length > options.maxLength) {
    return { isValid: false, error: `${fieldName} must be no more than ${options.maxLength} characters long` };
  }

  if (options?.allowedChars && !options.allowedChars.test(trimmed)) {
    return { isValid: false, error: `${fieldName} contains invalid characters` };
  }

  return { isValid: true };
}

export function validateNumber(value: any, fieldName: string, options?: {
  min?: number;
  max?: number;
  integer?: boolean;
}): { isValid: boolean; error?: string } {
  if (typeof value !== 'number' || isNaN(value)) {
    return { isValid: false, error: `${fieldName} must be a valid number` };
  }

  if (options?.integer && !Number.isInteger(value)) {
    return { isValid: false, error: `${fieldName} must be an integer` };
  }

  if (options?.min !== undefined && value < options.min) {
    return { isValid: false, error: `${fieldName} must be at least ${options.min}` };
  }

  if (options?.max !== undefined && value > options.max) {
    return { isValid: false, error: `${fieldName} must be no more than ${options.max}` };
  }

  return { isValid: true };
}

export function validateEnum<T>(value: any, allowedValues: T[], fieldName: string): { isValid: boolean; error?: string } {
  if (!allowedValues.includes(value)) {
    return { isValid: false, error: `${fieldName} must be one of: ${allowedValues.join(', ')}` };
  }
  return { isValid: true };
}

export function validateArray(value: any, fieldName: string, options?: {
  minLength?: number;
  maxLength?: number;
  itemValidator?: (item: any, index: number) => { isValid: boolean; error?: string };
}): { isValid: boolean; error?: string } {
  if (!Array.isArray(value)) {
    return { isValid: false, error: `${fieldName} must be an array` };
  }

  if (options?.minLength && value.length < options.minLength) {
    return { isValid: false, error: `${fieldName} must contain at least ${options.minLength} items` };
  }

  if (options?.maxLength && value.length > options.maxLength) {
    return { isValid: false, error: `${fieldName} must contain no more than ${options.maxLength} items` };
  }

  if (options?.itemValidator) {
    for (let i = 0; i < value.length; i++) {
      const result = options.itemValidator(value[i], i);
      if (!result.isValid) {
        return { isValid: false, error: `Item ${i} in ${fieldName}: ${result.error}` };
      }
    }
  }

  return { isValid: true };
}

export function validateDate(value: any, fieldName: string, options?: {
  futureOnly?: boolean;
  pastOnly?: boolean;
}): { isValid: boolean; error?: string } {
  if (!value) return { isValid: true }; // Optional field

  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return { isValid: false, error: `${fieldName} must be a valid date` };
  }

  const now = new Date();

  if (options?.futureOnly && date <= now) {
    return { isValid: false, error: `${fieldName} must be in the future` };
  }

  if (options?.pastOnly && date >= now) {
    return { isValid: false, error: `${fieldName} must be in the past` };
  }

  return { isValid: true };
}

export function sanitizeString(input: string, options?: {
  maxLength?: number;
  allowedChars?: RegExp;
}): string {
  if (!input || typeof input !== 'string') return '';

  let sanitized = input.trim();

  // Remove HTML tags and potentially dangerous content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ''); // Remove script tags and content
  sanitized = sanitized.replace(/<[^>]*>/g, ''); // Remove remaining HTML tags

  if (options?.maxLength) {
    sanitized = sanitized.substring(0, options.maxLength);
  }

  if (options?.allowedChars && !options.allowedChars.test(sanitized)) {
    // If it doesn't match allowed chars, return empty string to be safe
    return '';
  }

  return sanitized;
}

export function sanitizeHtml(input: string): string {
  if (!input || typeof input !== 'string') return '';

  // Basic HTML sanitization - remove script tags and other dangerous elements
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .trim()
    .substring(0, 10000); // Limit length
}

// Validate material request data
export function validateMaterialRequest(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate presentationId
  const presIdValidation = validateUUID(data.presentationId, 'presentationId');
  if (!presIdValidation.isValid) {
    errors.push(presIdValidation.error!);
  }

  // Validate requestType
  const typeValidation = validateEnum(data.requestType,
    ['gsv_provided', 'volunteer_funded', 'kit_recommendation'], 'requestType');
  if (!typeValidation.isValid) {
    errors.push(typeValidation.error!);
  }

  // Validate items array
  const itemsValidation = validateArray(data.items, 'items', {
    minLength: 1,
    maxLength: 50,
    itemValidator: (item: any) => {
      const nameValidation = validateString(item.name, 'item name', { minLength: 1, maxLength: 100 });
      if (!nameValidation.isValid) return nameValidation;

      const categoryValidation = validateEnum(item.category,
        ['science_equipment', 'presentation_materials', 'activity_supplies'], 'item category');
      if (!categoryValidation.isValid) return categoryValidation;

      const quantityValidation = validateNumber(item.quantity, 'quantity', { min: 1, max: 1000, integer: true });
      if (!quantityValidation.isValid) return quantityValidation;

      const costValidation = validateNumber(item.estimated_cost, 'estimated cost', { min: 0.01, max: 1000 });
      if (!costValidation.isValid) return costValidation;

      return { isValid: true };
    }
  });
  if (!itemsValidation.isValid) {
    errors.push(itemsValidation.error!);
  }

  // Calculate total cost and validate budget
  if (data.items && Array.isArray(data.items) && data.requestType === 'gsv_provided') {
    const totalCost = data.items.reduce((total: number, item: any) => {
      return total + ((item.estimated_cost || 0) * (item.quantity || 0));
    }, 0);

    const BUDGET_LIMIT = 25.00; // $25 per group
    if (totalCost > BUDGET_LIMIT) {
      errors.push(`Total cost $${totalCost.toFixed(2)} exceeds budget limit of $${BUDGET_LIMIT.toFixed(2)}`);
    }
  }

  // Validate delivery preference
  const deliveryValidation = validateEnum(data.deliveryPreference,
    ['school_address', 'volunteer_address'], 'deliveryPreference');
  if (!deliveryValidation.isValid) {
    errors.push(deliveryValidation.error!);
  }

  // Validate needed by date (allow past dates for testing)
  const dateValidation = validateDate(data.neededByDate, 'neededByDate');
  if (!dateValidation.isValid) {
    errors.push(dateValidation.error!);
  }

  // Validate budget justification if provided
  if (data.budgetJustification) {
    const justificationValidation = validateString(data.budgetJustification, 'budgetJustification',
      { minLength: 10, maxLength: 1000 });
    if (!justificationValidation.isValid) {
      errors.push(justificationValidation.error!);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateVolunteerForm(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Basic validation for volunteer signup form
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  if (!data.email || !validateEmail(data.email)) {
    errors.push('Valid email address is required');
  }

  if (!data.grade_level) {
    errors.push('Grade level is required');
  }

  if (!data.school_id) {
    errors.push('School selection is required');
  }

  return { isValid: errors.length === 0, errors };
}

export function getFieldError(errors: string[], fieldName: string): string | undefined {
  return errors.find(error => error.toLowerCase().includes(fieldName.toLowerCase()));
}

export interface ValidationError {
  field: string;
  message: string;
}