/**
 * Form validation utilities
 */

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (US format)
 */
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\d\s\-\(\)]+$/;
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

/**
 * Validate URL format
 */
export function validateURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate Google Slides/Docs URL
 */
export function validateGoogleDocsURL(url: string): boolean {
  if (!url) return false;
  return url.includes("docs.google.com/presentation") ||
         url.includes("docs.google.com/spreadsheets") ||
         url.includes("docs.google.com/document");
}

/**
 * Validate required field
 */
export function validateRequired(value: any, fieldName: string): string | null {
  if (value === null || value === undefined || value === "") {
    return `${fieldName} is required`;
  }
  if (typeof value === "string" && value.trim().length === 0) {
    return `${fieldName} cannot be empty`;
  }
  return null;
}

/**
 * Validate string length
 */
export function validateLength(
  value: string,
  min: number,
  max: number,
  fieldName: string
): string | null {
  if (value.length < min) {
    return `${fieldName} must be at least ${min} characters`;
  }
  if (value.length > max) {
    return `${fieldName} must be no more than ${max} characters`;
  }
  return null;
}

/**
 * Validate number range
 */
export function validateRange(
  value: number,
  min: number,
  max: number,
  fieldName: string
): string | null {
  if (value < min) {
    return `${fieldName} must be at least ${min}`;
  }
  if (value > max) {
    return `${fieldName} must be no more than ${max}`;
  }
  return null;
}

/**
 * Validate volunteer signup form
 */
export function validateVolunteerForm(data: any): ValidationResult {
  const errors: ValidationError[] = [];

  // Email validation
  const emailError = validateRequired(data.email, "Email");
  if (emailError) {
    errors.push({ field: "email", message: emailError });
  } else if (!validateEmail(data.email)) {
    errors.push({ field: "email", message: "Please enter a valid email address" });
  }

  // Group city
  const cityError = validateRequired(data.group_city, "City");
  if (cityError) {
    errors.push({ field: "group_city", message: cityError });
  }

  // Group size
  if (!data.group_size || data.group_size < 3 || data.group_size > 7) {
    errors.push({ field: "group_size", message: "Group size must be between 3 and 7 members" });
  }

  // Group members validation
  if (!data.group_members || !Array.isArray(data.group_members)) {
    errors.push({ field: "group_members", message: "At least 3 group members are required" });
  } else {
    const validMembers = data.group_members.filter(
      (m: any) => m.name && m.email && m.phone && m.highschool
    );
    if (validMembers.length < 3) {
      errors.push({ field: "group_members", message: "Please provide information for at least 3 group members" });
    } else {
      // Validate each member
      data.group_members.slice(0, data.group_size).forEach((member: any, index: number) => {
        if (!member.name || member.name.trim().length === 0) {
          errors.push({ field: `member_${index}_name`, message: `Member ${index + 1} name is required` });
        }
        if (!member.email || !validateEmail(member.email)) {
          errors.push({ field: `member_${index}_email`, message: `Member ${index + 1} email is invalid` });
        }
        if (!member.phone || !validatePhone(member.phone)) {
          errors.push({ field: `member_${index}_phone`, message: `Member ${index + 1} phone is invalid` });
        }
        if (!member.highschool || member.highschool.trim().length === 0) {
          errors.push({ field: `member_${index}_highschool`, message: `Member ${index + 1} high school is required` });
        }
      });
    }
  }

  // Primary contact phone
  if (data.primary_contact_phone && !validatePhone(data.primary_contact_phone)) {
    errors.push({ field: "primary_contact_phone", message: "Please enter a valid phone number" });
  }

  // Why volunteer (optional but validate length if provided)
  if (data.why_volunteer) {
    const whyError = validateLength(data.why_volunteer, 10, 1000, "Why volunteer");
    if (whyError) {
      errors.push({ field: "why_volunteer", message: whyError });
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate teacher request form
 */
export function validateTeacherForm(data: any): ValidationResult {
  const errors: ValidationError[] = [];

  // Full name
  const nameError = validateRequired(data.full_name, "Full name");
  if (nameError) {
    errors.push({ field: "full_name", message: nameError });
  } else {
    const lengthError = validateLength(data.full_name, 2, 100, "Full name");
    if (lengthError) {
      errors.push({ field: "full_name", message: lengthError });
    }
  }

  // School name
  const schoolError = validateRequired(data.school_name, "School name");
  if (schoolError) {
    errors.push({ field: "school_name", message: schoolError });
  }

  // Email
  const emailError = validateRequired(data.email, "Email");
  if (emailError) {
    errors.push({ field: "email", message: emailError });
  } else if (!validateEmail(data.email)) {
    errors.push({ field: "email", message: "Please enter a valid email address" });
  }

  // Grade levels
  if (!data.grade_levels || !Array.isArray(data.grade_levels) || data.grade_levels.length === 0) {
    errors.push({ field: "grade_levels", message: "Please select at least one grade level" });
  }

  // Request type
  if (!data.request_type) {
    errors.push({ field: "request_type", message: "Please select a request type" });
  }

  // Preferred dates (if provided)
  if (data.preferred_dates && data.preferred_dates.length > 0) {
    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    data.preferred_dates.forEach((date: string, index: number) => {
      if (!dateRegex.test(date)) {
        errors.push({ field: `preferred_date_${index}`, message: "Invalid date format" });
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate contact form
 */
export function validateContactForm(data: any): ValidationResult {
  const errors: ValidationError[] = [];

  const nameError = validateRequired(data.name, "Name");
  if (nameError) {
    errors.push({ field: "name", message: nameError });
  }

  const emailError = validateRequired(data.email, "Email");
  if (emailError) {
    errors.push({ field: "email", message: emailError });
  } else if (!validateEmail(data.email)) {
    errors.push({ field: "email", message: "Please enter a valid email address" });
  }

  const messageError = validateRequired(data.message, "Message");
  if (messageError) {
    errors.push({ field: "message", message: messageError });
  } else {
    const lengthError = validateLength(data.message, 10, 2000, "Message");
    if (lengthError) {
      errors.push({ field: "message", message: lengthError });
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get error message for a specific field
 */
export function getFieldError(field: string, errors: ValidationError[]): string | null {
  const error = errors.find(e => e.field === field);
  return error ? error.message : null;
}

