# Notification System

A comprehensive notification/toast system built on [Sonner](https://sonner.emilkowal.ski/) for the ProAgentic DFX application.

## Installation

```bash
npm install sonner
```

## Features

- **Type-safe API**: Fully typed notification methods with TypeScript
- **Multiple notification types**: Success, error, warning, info, and loading states
- **Promise tracking**: Automatic notification updates based on promise lifecycle
- **Rich styling**: Color-coded notifications with descriptions
- **Customizable**: Position, duration, and styling options
- **Accessible**: Built with accessibility in mind

## Basic Usage

Import the `notify` utility anywhere in your application:

```typescript
import { notify } from '@/lib/notifications';

// Success notification
notify.success('Design saved', 'Your changes have been saved successfully');

// Error notification
notify.error('Save failed', 'Unable to save design. Please try again.');

// Warning notification
notify.warning('Design contains warnings', 'Some parameters are outside recommended ranges');

// Info notification
notify.info('Optimization started', 'This may take several minutes to complete');
```

## Advanced Usage

### Loading States with Manual Control

```typescript
const loadingId = notify.loading('Saving design...');

try {
  await saveDesign();
  notify.dismiss(loadingId);
  notify.success('Design saved successfully');
} catch (error) {
  notify.dismiss(loadingId);
  notify.error('Failed to save design');
}
```

### Promise-Based Notifications (Recommended)

The promise method automatically handles loading, success, and error states:

```typescript
import { notify } from '@/lib/notifications';

const saveDesign = async () => {
  const response = await fetch('/api/designs', {
    method: 'POST',
    body: JSON.stringify(designData),
  });

  if (!response.ok) throw new Error('Save failed');
  return response.json();
};

notify.promise(saveDesign(), {
  loading: 'Saving design...',
  success: (data) => `Design "${data.name}" saved successfully!`,
  error: (error) => `Failed to save: ${error.message}`,
});
```

### Dynamic Success/Error Messages

Success and error messages can be functions that receive the promise result or error:

```typescript
notify.promise(optimizeDesign(), {
  loading: 'Running optimization...',
  success: (result) => `Found ${result.solutions} optimal solutions!`,
  error: (error) => `Optimization failed: ${error.message}`,
});
```

## Common Use Cases

### 1. Form Submission

```typescript
const handleSubmit = async (data: FormData) => {
  notify.promise(submitForm(data), {
    loading: 'Submitting form...',
    success: 'Form submitted successfully!',
    error: 'Failed to submit form. Please try again.',
  });
};
```

### 2. File Export

```typescript
const exportDesign = async (format: string) => {
  const response = await fetch(`/api/export?format=${format}`);
  if (!response.ok) throw new Error('Export failed');
  return response.blob();
};

notify.promise(exportDesign('step'), {
  loading: 'Generating STEP file...',
  success: 'STEP file ready for download',
  error: 'Failed to generate STEP file',
});
```

### 3. Analysis Results

```typescript
const runAnalysis = async () => {
  const response = await fetch('/api/designs/123/stress');
  if (!response.ok) throw new Error('Analysis failed');
  return response.json();
};

notify.promise(runAnalysis(), {
  loading: 'Running stress analysis...',
  success: 'Stress analysis complete',
  error: 'Stress analysis failed',
});
```

### 4. Compliance Checks

```typescript
const checkCompliance = async () => {
  const response = await fetch('/api/designs/123/compliance');
  const result = await response.json();

  if (result.passed) {
    notify.success('Compliance check passed', 'Design meets all regulatory requirements');
  } else {
    notify.error('Compliance check failed', `Found ${result.issues} compliance issues`);
  }
};
```

### 5. Batch Operations

```typescript
const processBatch = async (designs: string[]) => {
  let completed = 0;
  const toastId = notify.loading(`Processing ${designs.length} designs...`);

  for (const designId of designs) {
    await processDesign(designId);
    completed++;

    notify.dismiss(toastId);
    if (completed < designs.length) {
      notify.loading(`Processing designs (${completed}/${designs.length})`);
    }
  }

  notify.dismiss(toastId);
  notify.success(`Successfully processed ${completed} designs`);
};
```

## API Reference

### `notify.success(message, description?)`

Display a success notification.

- **message**: Main message to display
- **description**: Optional detailed description

### `notify.error(message, description?)`

Display an error notification.

- **message**: Main message to display
- **description**: Optional detailed description

### `notify.warning(message, description?)`

Display a warning notification.

- **message**: Main message to display
- **description**: Optional detailed description

### `notify.info(message, description?)`

Display an info notification.

- **message**: Main message to display
- **description**: Optional detailed description

### `notify.loading(message)`

Display a loading notification.

- **message**: Loading message to display
- **Returns**: Toast ID for later dismissal

### `notify.dismiss(toastId?)`

Dismiss a specific notification or all notifications.

- **toastId**: Optional ID of toast to dismiss. If not provided, dismisses all toasts

### `notify.promise(promise, messages)`

Display a notification that tracks a promise's lifecycle.

- **promise**: Promise to track
- **messages**: Object with loading, success, and error messages
  - **loading**: Message to show while promise is pending
  - **success**: Message or function that returns message on success
  - **error**: Message or function that returns message on error

## Configuration

The notification system is configured in `src/components/ui/Notifications.tsx`:

```typescript
<Toaster
  position="bottom-right"  // Notification position
  richColors               // Enable rich colors
  closeButton             // Show close button
  duration={4000}         // 4 second default duration
  expand={false}          // Don't expand on hover
/>
```

### Available Positions

- `top-left`
- `top-center`
- `top-right`
- `bottom-left`
- `bottom-center`
- `bottom-right`

## Examples

See `src/lib/notifications/examples.ts` for comprehensive usage examples including:

- Simple notifications
- Loading states
- Promise-based workflows
- Optimization notifications
- Analysis notifications
- Export notifications
- Compliance checks
- Batch operations

## Integration with Zustand Store

You can integrate notifications with your Zustand store actions:

```typescript
import { notify } from '@/lib/notifications';
import { create } from 'zustand';

interface DesignStore {
  saveDesign: (design: Design) => Promise<void>;
}

export const useDesignStore = create<DesignStore>((set) => ({
  saveDesign: async (design) => {
    notify.promise(
      fetch('/api/designs', {
        method: 'POST',
        body: JSON.stringify(design),
      }),
      {
        loading: 'Saving design...',
        success: 'Design saved successfully!',
        error: 'Failed to save design',
      }
    );
  },
}));
```

## Best Practices

1. **Use promise-based notifications** for async operations - they automatically handle all states
2. **Keep messages concise** - Use the description field for details
3. **Provide context** - Include relevant information (e.g., design name, number of items)
4. **Dismiss loading toasts** - Always dismiss loading notifications when the operation completes
5. **Use appropriate types** - Success for positive outcomes, error for failures, warning for cautions
6. **Batch carefully** - For batch operations, update progress to keep users informed

## Troubleshooting

### Notifications not appearing

Make sure the `<Notifications />` component is included in your root layout:

```typescript
// src/app/layout.tsx
import { Notifications } from '@/components/ui/Notifications';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Notifications />
      </body>
    </html>
  );
}
```

### TypeScript errors

Ensure `sonner` is installed and types are available:

```bash
npm install sonner
```

The package includes TypeScript definitions by default.

## Learn More

- [Sonner Documentation](https://sonner.emilkowal.ski/)
- [Sonner GitHub](https://github.com/emilkowalski/sonner)
