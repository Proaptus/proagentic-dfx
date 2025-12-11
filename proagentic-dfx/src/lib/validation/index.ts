import { z } from 'zod';

// Export all schemas
export * from './schemas';

/**
 * Generic validation result type
 */
export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: Array<{ path: string; message: string }> };

/**
 * Validates data against a Zod schema and returns a structured result
 * 
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns ValidationResult with either validated data or errors
 */
export function validate<T>(
  schema: z.ZodType<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors = result.error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));

  return { success: false, errors };
}

/**
 * Validates data and throws an error if validation fails
 * 
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validated data
 * @throws Error with validation messages if validation fails
 */
export function validateOrThrow<T>(
  schema: z.ZodType<T>,
  data: unknown
): T {
  const result = schema.safeParse(data);

  if (result.success) {
    return result.data;
  }

  const errorMessages = result.error.issues
    .map((issue) => {
      const pathStr = issue.path.join('.');
      return pathStr + ': ' + issue.message;
    })
    .join('\n');
  throw new Error('Validation failed:\n' + errorMessages);
}

/**
 * Creates a type-safe validator function for a specific schema
 * 
 * @param schema - Zod schema to create validator for
 * @returns Validation function
 */
export function createValidator<T>(schema: z.ZodType<T>) {
  return (data: unknown): ValidationResult<T> => validate(schema, data);
}

/**
 * Checks if data is valid according to schema (boolean return)
 * 
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns true if valid, false otherwise
 */
export function isValid<T>(
  schema: z.ZodType<T>,
  data: unknown
): data is T {
  return schema.safeParse(data).success;
}

/**
 * Partially validates an object (useful for form validation)
 * Allows partial data and only validates provided fields
 * 
 * @param schema - Zod schema to validate against
 * @param data - Partial data to validate
 * @returns ValidationResult with partial data or errors
 */
export function validatePartial<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  data: unknown
): ValidationResult<z.infer<z.ZodObject<{ [K in keyof T]: z.ZodOptional<T[K]> }>>> {
  const partialSchema = schema.partial();
  return validate(partialSchema, data) as ValidationResult<z.infer<typeof partialSchema>>;
}

/**
 * Validates an array of items against a schema
 * 
 * @param schema - Zod schema for individual items
 * @param data - Array to validate
 * @returns ValidationResult with validated array or errors
 */
export function validateArray<T>(
  schema: z.ZodType<T>,
  data: unknown[]
): ValidationResult<T[]> {
  const arraySchema = z.array(schema);
  return validate(arraySchema, data);
}
