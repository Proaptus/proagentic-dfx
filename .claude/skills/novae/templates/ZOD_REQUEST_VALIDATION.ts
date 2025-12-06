import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';
import { ErrorFactories } from './EXPRESS_ERROR_MIDDLEWARE';

/**
 * NOVAE Zod Request Validation Template
 *
 * Type-safe request validation using Zod schemas.
 * Provides runtime validation + TypeScript types.
 *
 * Context7 Reference: Zod + Express best practices
 */

// Example schemas for common use cases

// Health check endpoint (no body expected)
export const HealthCheckSchema = z.object({});

// User creation
export const CreateUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  role: z.enum(['admin', 'user', 'guest']).optional().default('user')
});

// Project creation (ProAgentic-specific)
export const CreateProjectSchema = z.object({
  name: z.string().min(1, 'Project name required').max(200),
  description: z.string().optional(),
  charter: z.object({
    objectives: z.array(z.string()).min(1, 'At least one objective required'),
    scope: z.string().min(1, 'Scope required'),
    assumptions: z.array(z.string()).optional(),
    constraints: z.array(z.string()).optional()
  }).optional()
});

// Query parameters validation
export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional().default('asc')
});

/**
 * Validation middleware factory
 * Validates request body, query, or params against a Zod schema
 */
export function validate<T extends z.ZodTypeAny>(
  schema: T,
  source: 'body' | 'query' | 'params' = 'body'
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Parse and validate
      const result = schema.safeParse(req[source]);

      if (!result.success) {
        // Format Zod errors for API response
        const errors = result.error.flatten();
        throw ErrorFactories.validationError({
          fieldErrors: errors.fieldErrors,
          formErrors: errors.formErrors
        });
      }

      // Attach validated data to request for type safety
      req[source] = result.data;

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Type-safe request handler with validated body
 * Provides full TypeScript inference for validated data
 */
export interface ValidatedRequest<
  TBody = unknown,
  TQuery = unknown,
  TParams = unknown
> extends Request {
  body: TBody;
  query: TQuery;
  params: TParams;
}

/**
 * Usage Examples:
 *
 * 1. Body validation:
 * app.post('/api/users',
 *   validate(CreateUserSchema),
 *   async (req: ValidatedRequest<z.infer<typeof CreateUserSchema>>, res) => {
 *     const { email, password, name } = req.body; // Fully typed!
 *     // Create user...
 *     res.json({ success: true });
 *   }
 * );
 *
 * 2. Query validation:
 * app.get('/api/users',
 *   validate(PaginationSchema, 'query'),
 *   async (req: ValidatedRequest<unknown, z.infer<typeof PaginationSchema>>, res) => {
 *     const { page, limit } = req.query; // Fully typed!
 *     // Fetch users...
 *     res.json({ users: [], page, limit });
 *   }
 * );
 *
 * 3. Params validation:
 * const IdParamSchema = z.object({ id: z.string().uuid() });
 * app.get('/api/users/:id',
 *   validate(IdParamSchema, 'params'),
 *   async (req: ValidatedRequest<unknown, unknown, z.infer<typeof IdParamSchema>>, res) => {
 *     const { id } = req.params; // Fully typed UUID!
 *     // Fetch user...
 *     res.json({ user: {} });
 *   }
 * );
 *
 * 4. Multiple validations:
 * app.get('/api/projects/:id',
 *   validate(IdParamSchema, 'params'),
 *   validate(PaginationSchema, 'query'),
 *   async (req, res) => {
 *     // Both params and query are validated
 *     res.json({ project: {}, ...req.query });
 *   }
 * );
 */

/**
 * Advanced: Custom validators and refinements
 */
export const AdvancedSchemas = {
  // Email with domain whitelist
  WhitelistedEmailSchema: z.string().email().refine(
    (email) => {
      const allowedDomains = ['company.com', 'partner.com'];
      const domain = email.split('@')[1];
      return allowedDomains.includes(domain);
    },
    { message: 'Email domain not allowed' }
  ),

  // Date range validation
  DateRangeSchema: z.object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date()
  }).refine(
    (data) => data.endDate > data.startDate,
    { message: 'End date must be after start date' }
  ),

  // Conditional fields
  ProjectWithBudgetSchema: z.object({
    name: z.string(),
    hasBudget: z.boolean(),
    budget: z.number().positive().optional()
  }).refine(
    (data) => !data.hasBudget || (data.hasBudget && data.budget),
    { message: 'Budget required when hasBudget is true', path: ['budget'] }
  ),

  // File upload validation
  FileUploadSchema: z.object({
    filename: z.string(),
    mimetype: z.enum(['image/png', 'image/jpeg', 'application/pdf']),
    size: z.number().max(5 * 1024 * 1024, 'File too large (max 5MB)')
  })
};

/**
 * Best Practices (Context7):
 *
 * 1. Define schemas at the module level for reusability
 * 2. Use .safeParse() instead of .parse() to handle errors gracefully
 * 3. Provide user-friendly error messages in schema definitions
 * 4. Use z.infer<typeof Schema> for TypeScript type inference
 * 5. Validate early in the middleware chain
 * 6. Use .coerce for query parameters (always strings)
 * 7. Set sensible defaults with .default()
 * 8. Use .refine() for complex validation logic
 * 9. Keep schemas close to route definitions
 * 10. Export schemas for frontend/backend sharing
 */

/**
 * Testing schemas:
 */
export function testSchema<T extends z.ZodTypeAny>(
  schema: T,
  validData: unknown,
  invalidData: unknown
) {
  console.log('Testing schema validation...');

  const validResult = schema.safeParse(validData);
  console.log('Valid data:', validResult.success ? 'PASS' : 'FAIL');

  const invalidResult = schema.safeParse(invalidData);
  console.log('Invalid data:', !invalidResult.success ? 'PASS' : 'FAIL');

  return validResult.success && !invalidResult.success;
}
