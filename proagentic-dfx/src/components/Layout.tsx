'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/stores/app-store';
import { useDomainStore } from '@/lib/stores/domain-store';
import { listDomains } from '@/lib/domains';
import type { Screen } from '@/lib/types';
import { cn } from '@/lib/utils';
import { SkipLink } from './ui/SkipLink';
import {
  FileText,
  BarChart3,
  Box,
  GitCompare,
  Activity,
  Shield,
  Download,
  Eye,
  ChevronDown,
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

function DomainSelector() {
  const { currentDomain, setDomain } = useDomainStore();
  const domains = listDomains();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative mb-6">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white text-sm font-bold">
            {currentDomain.name.charAt(0)}
          </div>
          <div className="text-left">
            <div className="font-medium text-gray-900">{currentDomain.name}</div>
            <div className="text-xs text-gray-500">Engineering Domain</div>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50" role="listbox">
          {domains.map((domain) => (
            <button
              key={domain.id}
              onClick={() => { setDomain(domain.id); setOpen(false); }}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                domain.id === currentDomain.id ? 'bg-blue-50' : ''
              }`}
              role="option"
              aria-selected={domain.id === currentDomain.id}
            >
              <div className="font-medium">{domain.name}</div>
              <div className="text-xs text-gray-500">{domain.description}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { currentScreen, setScreen, requirements, paretoFront, currentDesign } =
    useAppStore();
  const { currentDomain } = useDomainStore();

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
        return (paretoFront?.length ?? 0) > 0 || !!currentDesign;
      default:
        return false;
    }
  };

  return (
    <>
      <SkipLink />
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col" aria-label="Main navigation">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">H2 Tank Designer</h1>
          <p className="text-sm text-gray-500 mt-1">AI-Powered Optimization</p>
        </div>

        <div className="p-4">
          <DomainSelector />
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
                    aria-current={currentScreen === item.id ? 'page' : undefined}
                    className={cn(
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
        <main id="main-content" className="flex-1 overflow-auto" role="main">
          <div className="p-8">{children}</div>
        </main>
      </div>
    </>
  );
}
