/**
 * Notification System Usage Examples
 *
 * This file demonstrates how to use the notification system
 * throughout the application for various scenarios.
 *
 * @module notifications/examples
 */

import { notify } from './index';

/**
 * Example: Simple success notification
 */
export function exampleSuccessNotification() {
  notify.success('Design saved', 'Your changes have been saved successfully');
}

/**
 * Example: Simple error notification
 */
export function exampleErrorNotification() {
  notify.error('Save failed', 'Unable to save design. Please try again.');
}

/**
 * Example: Warning notification
 */
export function exampleWarningNotification() {
  notify.warning(
    'Design contains warnings',
    'Some parameters are outside recommended ranges'
  );
}

/**
 * Example: Info notification
 */
export function exampleInfoNotification() {
  notify.info(
    'Optimization started',
    'This may take several minutes to complete'
  );
}

/**
 * Example: Loading state with manual dismiss
 */
export async function exampleLoadingWithDismiss() {
  const loadingId = notify.loading('Saving design...');

  try {
    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Dismiss loading and show success
    notify.dismiss(loadingId);
    notify.success('Design saved successfully');
  } catch {
    // Dismiss loading and show error
    notify.dismiss(loadingId);
    notify.error('Failed to save design');
  }
}

/**
 * Example: Promise-based notification (recommended approach)
 */
export async function examplePromiseNotification() {
  const saveDesign = async () => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return { id: '123', name: 'Tank Design v1' };
  };

  notify.promise(saveDesign(), {
    loading: 'Saving design...',
    success: (data) => `Design "${data.name}" saved successfully!`,
    error: (error) => `Failed to save: ${error.message}`,
  });
}

/**
 * Example: Optimization workflow notifications
 */
export async function exampleOptimizationWorkflow() {
  const runOptimization = async () => {
    const response = await fetch('/api/optimization', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ designId: '123' }),
    });

    if (!response.ok) {
      throw new Error('Optimization failed');
    }

    return response.json();
  };

  notify.promise(runOptimization(), {
    loading: 'Running multi-objective optimization...',
    success: (result) =>
      `Optimization complete! Found ${result.solutions} Pareto-optimal solutions.`,
    error: 'Optimization failed. Please check your design parameters.',
  });
}

/**
 * Example: Analysis notifications
 */
export async function exampleAnalysisNotifications() {
  const runAnalysis = async (analysisType: string) => {
    const response = await fetch(`/api/designs/123/${analysisType}`);
    if (!response.ok) throw new Error('Analysis failed');
    return response.json();
  };

  // Stress analysis
  notify.promise(runAnalysis('stress'), {
    loading: 'Running stress analysis...',
    success: 'Stress analysis complete',
    error: 'Stress analysis failed',
  });
}

/**
 * Example: File export notifications
 */
export async function exampleExportNotifications() {
  const exportDesign = async (format: string) => {
    const response = await fetch(`/api/export/123?format=${format}`);
    if (!response.ok) throw new Error('Export failed');
    return response.blob();
  };

  notify.promise(exportDesign('step'), {
    loading: 'Generating STEP file...',
    success: 'STEP file ready for download',
    error: 'Failed to generate STEP file',
  });
}

/**
 * Example: Compliance check notifications
 */
export function exampleComplianceNotifications(passed: boolean, issues: number) {
  if (passed) {
    notify.success(
      'Compliance check passed',
      'Design meets all regulatory requirements'
    );
  } else {
    notify.error(
      'Compliance check failed',
      `Found ${issues} compliance issue${issues === 1 ? '' : 's'}`
    );
  }
}

/**
 * Example: Material selection notifications
 */
export function exampleMaterialNotifications(materialName: string) {
  notify.info('Material updated', `Selected material: ${materialName}`);
}

/**
 * Example: Batch operation with progress
 */
export async function exampleBatchOperations() {
  const designs = ['design-1', 'design-2', 'design-3'];
  let completed = 0;

  const toastId = notify.loading(`Processing ${designs.length} designs...`);

  for (const designId of designs) {
    try {
      // Simulate processing
      await new Promise((resolve) => setTimeout(resolve, 1000));
      completed++;

      // Update progress
      notify.dismiss(toastId);
      if (completed < designs.length) {
        notify.loading(`Processing ${designs.length} designs (${completed}/${designs.length})`);
      }
    } catch {
      notify.dismiss(toastId);
      notify.error(`Failed to process ${designId}`);
      return;
    }
  }

  notify.dismiss(toastId);
  notify.success(`Successfully processed ${completed} designs`);
}
