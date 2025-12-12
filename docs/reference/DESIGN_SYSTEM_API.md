---
doc_type: reference
title: 'H2 Tank Designer - Design System'
version: 1.0.0
date: 2025-12-09
owner: '@h2-tank-team'
status: accepted
last_verified_at: 2025-12-09
code_refs:
  - path: 'proagentic-dfx/src/components/ui/index.ts'
  - path: 'proagentic-dfx/src/components/ui/Button.tsx'
  - path: 'proagentic-dfx/src/components/ui/Card.tsx'
  - path: 'proagentic-dfx/src/components/ui/LoadingState.tsx'
  - path: 'proagentic-dfx/src/components/ui/ErrorState.tsx'
  - path: 'proagentic-dfx/src/components/ui/AccessibleLabel.tsx'
  - path: 'proagentic-dfx/src/app/globals.css'
test_refs:
  - path: 'proagentic-dfx/src/__tests__/components/ui/AccessibleLabel.test.tsx'
  - path: 'proagentic-dfx/src/__tests__/components/ui/Alert.test.tsx'
  - path: 'proagentic-dfx/src/__tests__/components/ui/Badge.test.tsx'
  - path: 'proagentic-dfx/src/__tests__/components/ui/Tooltip.test.tsx'
  - path: 'proagentic-dfx/src/__tests__/components/ui/Tabs.test.tsx'
  - path: 'proagentic-dfx/src/__tests__/components/ui/Progress.test.tsx'
---

# H2 Tank Designer - Design System

This design system provides a comprehensive foundation for building accessible, consistent, and professional UI components.

## Requirements Coverage

- **REQ-271**: Design tokens (spacing, typography, colors)
- **REQ-272**: Component library with consistent styling
- **REQ-273**: WCAG 2.1 AA accessibility compliance
- **REQ-274**: Responsive breakpoints
- **REQ-275**: Loading states and error handling patterns

## Design Tokens

### Colors

#### Primary Brand Colors

- `primary.500` (#0077FF) - Main brand blue
- Full scale: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900

#### Semantic Colors

- **Success**: Green (#059669)
- **Warning**: Amber (#D97706)
- **Error**: Red (#DC2626)

#### Engineering-Specific Colors

- **Stress Visualization**: Green (safe) â†’ Yellow (caution) â†’ Red (critical)
- **Layer Colors**: Helical (Blue), Hoop (Green), Liner (Purple)

### Typography

```typescript
fontFamily: {
  sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  mono: 'JetBrains Mono, Fira Code, Consolas, monospace',
}

fontSize: {
  xs: 0.75rem (12px)
  sm: 0.875rem (14px)
  base: 1rem (16px)
  lg: 1.125rem (18px)
  xl: 1.25rem (20px)
  2xl: 1.5rem (24px)
  3xl: 1.875rem (30px)
  4xl: 2.25rem (36px)
}
```

### Spacing Scale

Based on 4px (0.25rem) increments:

- 1 = 4px
- 2 = 8px
- 3 = 12px
- 4 = 16px
- 6 = 24px
- 8 = 32px
- 12 = 48px
- 16 = 64px

### Responsive Breakpoints

```typescript
sm: 640px   // Mobile landscape
md: 768px   // Tablet
lg: 1024px  // Desktop
xl: 1280px  // Large desktop
2xl: 1536px // Extra large desktop
```

## Component Library

### Button

```tsx
import { Button } from '@/components/ui';

<Button variant="primary" size="md" loading={false}>
  Click me
</Button>;
```

Variants: `primary` | `secondary` | `outline` | `ghost`
Sizes: `sm` | `md` | `lg`

### Card

```tsx
import { Card, CardHeader, CardTitle } from '@/components/ui';

<Card padding="md">
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  Content
</Card>;
```

### LoadingState

```tsx
import { LoadingState } from '@/components/ui';

<LoadingState variant="spinner" size="md" text="Loading..." />
<LoadingState variant="skeleton" className="h-20" />
<LoadingState variant="progress" progress={45} text="Processing" />
```

### ErrorState

```tsx
import { ErrorState } from '@/components/ui';

<ErrorState
  type="error"
  title="Something went wrong"
  message="Please try again later"
  action={{
    label: 'Retry',
    onClick: () => retry(),
  }}
/>;
```

### AccessibleLabel

```tsx
import { AccessibleLabel } from '@/components/ui';

<AccessibleLabel
  htmlFor="email"
  label="Email Address"
  required
  hint="We'll never share your email"
  error={errors.email}
>
  <input id="email" type="email" />
</AccessibleLabel>;
```

## Accessibility (WCAG 2.1 AA)

### Implemented Standards

âœ… **1.3.1 Info and Relationships** - Proper semantic HTML and ARIA labels
âœ… **1.4.3 Contrast (Minimum)** - 4.5:1 text contrast ratio
âœ… **2.1.1 Keyboard** - All functionality available via keyboard
âœ… **2.3.3 Animation from Interactions** - `prefers-reduced-motion` support
âœ… **2.4.7 Focus Visible** - Clear focus indicators
âœ… **3.2.4 Consistent Identification** - Consistent component patterns
âœ… **4.1.2 Name, Role, Value** - Proper ARIA attributes

### Keyboard Navigation

- **Skip Link**: `Tab` on page load jumps to main content
- **Focus Management**: Visible focus rings on all interactive elements
- **ARIA Support**: Proper roles and states on all components

### Screen Reader Support

- Semantic HTML structure
- ARIA labels and descriptions
- Live regions for dynamic content (`aria-live="polite"`)
- Hidden decorative elements (`aria-hidden="true"`)

## Usage Example

```tsx
import { Button, LoadingState, ErrorState } from '@/components/ui';
import { useState } from 'react';

function MyComponent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  return (
    <>
      {loading && <LoadingState variant="spinner" text="Processing..." />}

      {error && (
        <ErrorState
          type="error"
          title="Operation failed"
          message={error.message}
          action={{ label: 'Retry', onClick: handleRetry }}
        />
      )}

      <Button onClick={handleSubmit} loading={loading}>
        Submit
      </Button>
    </>
  );
}
```

## CSS Variables

Custom properties are defined in `globals.css` for consistent theming:

```css
--color-primary-500: 0 119 255;
--color-success: 5 150 105;
--color-warning: 217 119 6;
--color-error: 220 38 38;
--font-sans: 'Inter', ... --font-mono: 'JetBrains Mono', ...;
```

## Best Practices

1. **Always use design tokens** instead of hard-coded values
2. **Import from centralized exports**: `@/components/ui`
3. **Include accessibility attributes**: ARIA labels, roles, keyboard support
4. **Test with keyboard navigation**: Ensure all features work without a mouse
5. **Verify color contrast**: Use tools to ensure WCAG AA compliance
6. **Respect user preferences**: Support reduced motion and high contrast modes
