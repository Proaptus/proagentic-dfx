'use client';

import { Layout } from '@/components/Layout';
import { useAppStore } from '@/lib/stores/app-store';
import { ScreenErrorBoundary } from '@/components/error';
import { RequirementsScreen } from '@/components/screens/RequirementsScreen';
import { ParetoScreen } from '@/components/screens/ParetoScreen';
import { ViewerScreen } from '@/components/screens/ViewerScreen';
import { CompareScreen } from '@/components/screens/CompareScreen';
import { AnalysisScreen } from '@/components/screens/AnalysisScreen';
import { ComplianceScreen } from '@/components/screens/ComplianceScreen';
import { ValidationScreen } from '@/components/screens/ValidationScreen';
import { ExportScreen } from '@/components/screens/ExportScreen';
import { SentryScreen } from '@/components/screens/SentryScreen';

export default function Home() {
  const { currentScreen } = useAppStore();

  const renderScreen = () => {
    switch (currentScreen) {
      case 'requirements':
        return (
          <ScreenErrorBoundary screenName="Requirements">
            <RequirementsScreen />
          </ScreenErrorBoundary>
        );
      case 'pareto':
        return (
          <ScreenErrorBoundary screenName="Pareto Analysis">
            <ParetoScreen />
          </ScreenErrorBoundary>
        );
      case 'viewer':
        return (
          <ScreenErrorBoundary screenName="3D Viewer">
            <ViewerScreen />
          </ScreenErrorBoundary>
        );
      case 'compare':
        return (
          <ScreenErrorBoundary screenName="Design Comparison">
            <CompareScreen />
          </ScreenErrorBoundary>
        );
      case 'analysis':
        return (
          <ScreenErrorBoundary screenName="Analysis">
            <AnalysisScreen />
          </ScreenErrorBoundary>
        );
      case 'compliance':
        return (
          <ScreenErrorBoundary screenName="Compliance">
            <ComplianceScreen />
          </ScreenErrorBoundary>
        );
      case 'validation':
        return (
          <ScreenErrorBoundary screenName="Validation">
            <ValidationScreen />
          </ScreenErrorBoundary>
        );
      case 'export':
        return (
          <ScreenErrorBoundary screenName="Export">
            <ExportScreen />
          </ScreenErrorBoundary>
        );
      case 'sentry':
        return (
          <ScreenErrorBoundary screenName="Sentry">
            <SentryScreen />
          </ScreenErrorBoundary>
        );
      default:
        return (
          <ScreenErrorBoundary screenName="Requirements">
            <RequirementsScreen />
          </ScreenErrorBoundary>
        );
    }
  };

  return <Layout>{renderScreen()}</Layout>;
}
