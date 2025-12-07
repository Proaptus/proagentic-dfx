/**
 * Validation Utilities
 * Shared validation logic for engineering inputs
 */

import type { ValidationRule } from '@proagentic/types';

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
}

/**
 * Validate a value against a validation rule
 */
export function validateField(
  value: unknown,
  rule: ValidationRule,
  fieldName: string
): ValidationError | null {
  switch (rule.type) {
    case 'range': {
      const params = rule.params as { min?: number; max?: number };
      const numValue = Number(value);
      if (isNaN(numValue)) {
        return {
          field: fieldName,
          message: rule.message || `${fieldName} must be a number`,
          code: 'INVALID_TYPE',
        };
      }
      if (params.min !== undefined && numValue < params.min) {
        return {
          field: fieldName,
          message: rule.message || `${fieldName} must be at least ${params.min}`,
          code: 'RANGE_MIN',
        };
      }
      if (params.max !== undefined && numValue > params.max) {
        return {
          field: fieldName,
          message: rule.message || `${fieldName} must be at most ${params.max}`,
          code: 'RANGE_MAX',
        };
      }
      break;
    }
    case 'regex': {
      const pattern = rule.params as string;
      const strValue = String(value);
      if (!new RegExp(pattern).test(strValue)) {
        return {
          field: fieldName,
          message: rule.message || `${fieldName} has invalid format`,
          code: 'INVALID_FORMAT',
        };
      }
      break;
    }
    case 'custom':
      // Custom validation would be handled by caller
      break;
  }
  return null;
}

/**
 * Validate multiple fields against their rules
 */
export function validateFields(
  values: Record<string, unknown>,
  rules: Record<string, ValidationRule>
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  for (const [fieldName, rule] of Object.entries(rules)) {
    const value = values[fieldName];
    const error = validateField(value, rule, fieldName);
    if (error) {
      errors.push(error);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Engineering-specific validators
 */
export const engineeringValidators = {
  pressure: (value: number, unit: 'bar' | 'MPa' = 'bar'): ValidationError | null => {
    if (value <= 0) {
      return { field: 'pressure', message: 'Pressure must be positive', code: 'INVALID_VALUE' };
    }
    const maxPressure = unit === 'bar' ? 1000 : 100; // 1000 bar or 100 MPa
    if (value > maxPressure) {
      return { field: 'pressure', message: `Pressure exceeds ${maxPressure} ${unit}`, code: 'RANGE_MAX' };
    }
    return null;
  },

  temperature: (value: number, unit: 'C' | 'K' = 'C'): ValidationError | null => {
    const minTemp = unit === 'C' ? -273.15 : 0;
    if (value < minTemp) {
      return { field: 'temperature', message: 'Temperature below absolute zero', code: 'RANGE_MIN' };
    }
    return null;
  },

  dimension: (value: number, fieldName: string): ValidationError | null => {
    if (value <= 0) {
      return { field: fieldName, message: `${fieldName} must be positive`, code: 'INVALID_VALUE' };
    }
    return null;
  },

  ratio: (value: number, fieldName: string, min: number = 0, max: number = 1): ValidationError | null => {
    if (value < min || value > max) {
      return { field: fieldName, message: `${fieldName} must be between ${min} and ${max}`, code: 'RANGE' };
    }
    return null;
  },
};
