'use client';

import { useAppStore } from '@/lib/stores/app-store';
import type { Screen } from '@/lib/types';
import { clsx } from 'clsx';
import {
  FileText,
  BarChart3,
  Box,
  GitCompare,
  Activity,
  Shield,
  Download,
  Eye,
} from 'lucide-react';

interface NavItem {
  id: Screen;
  label: string;
  icon: React.ReactNode;
  disabled?: boolean;
}

const navItems: NavItem[] = [
  { id: 'requirements', label: 'Requirements', icon: <FileText size={20} /> },
  { id: 'pareto', label: 'Pareto Explorer', icon: <BarChart3 size={20} /> },
  { id: 'viewer', label: '3D Viewer', icon: <Box size={20} /> },
  { id: 'compare', label: 'Compare', icon: <GitCompare size={20} /> },
  { id: 'analysis', label: 'Analysis', icon: <Activity size={20} /> },
  { id: 'compliance', label: 'Compliance', icon: <Shield size={20} /> },
  { id: 'export', label: 'Export', icon: <Download size={20} /> },
  { id: 'sentry', label: 'Sentry Mode', icon: <Eye size={20} /> },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { currentScreen, setScreen, requirements, paretoFront, currentDesign } =
    useAppStore();

  const canNavigate = (screen: Screen): boolean => {
    switch (screen) {
      case 'requirements':
        return true;
      case 'pareto':
        return !!requirements;
      case 'viewer':
      case 'compare':
      case 'analysis':
      case 'compliance':
      case 'export':
      case 'sentry':
        return paretoFront.length > 0 || !!currentDesign;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">H2 Tank Designer</h1>
          <p className="text-sm text-gray-500 mt-1">AI-Powered Optimization</p>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const enabled = canNavigate(item.id);
              return (
                <li key={item.id}>
                  <button
                    onClick={() => enabled && setScreen(item.id)}
                    disabled={!enabled}
                    className={clsx(
                      'w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors',
                      {
                        'bg-blue-50 text-blue-700 font-medium':
                          currentScreen === item.id,
                        'text-gray-700 hover:bg-gray-100':
                          currentScreen !== item.id && enabled,
                        'text-gray-400 cursor-not-allowed': !enabled,
                      }
                    )}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            <p>Innovate UK AI Pioneers</p>
            <p className="mt-1">Demo Version</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
