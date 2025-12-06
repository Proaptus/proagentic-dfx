'use client';

import { Layout } from '@/components/Layout';
import { useAppStore } from '@/lib/stores/app-store';
import { RequirementsScreen } from '@/components/screens/RequirementsScreen';
import { ParetoScreen } from '@/components/screens/ParetoScreen';
import { ViewerScreen } from '@/components/screens/ViewerScreen';
import { CompareScreen } from '@/components/screens/CompareScreen';
import { AnalysisScreen } from '@/components/screens/AnalysisScreen';
import { ComplianceScreen } from '@/components/screens/ComplianceScreen';
import { ExportScreen } from '@/components/screens/ExportScreen';
import { SentryScreen } from '@/components/screens/SentryScreen';

export default function Home() {
  const { currentScreen } = useAppStore();

  const renderScreen = () => {
    switch (currentScreen) {
      case 'requirements':
        return <RequirementsScreen />;
      case 'pareto':
        return <ParetoScreen />;
      case 'viewer':
        return <ViewerScreen />;
      case 'compare':
        return <CompareScreen />;
      case 'analysis':
        return <AnalysisScreen />;
      case 'compliance':
        return <ComplianceScreen />;
      case 'export':
        return <ExportScreen />;
      case 'sentry':
        return <SentryScreen />;
      default:
        return <RequirementsScreen />;
    }
  };

  return <Layout>{renderScreen()}</Layout>;
}
