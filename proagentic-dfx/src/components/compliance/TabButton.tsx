/**
 * Tab Button Component for Compliance Screen
 * REQ-272: Component library with consistent styling
 */

import type { ComponentType } from 'react';

export interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: ComponentType<{ size: number }>;
  label: string;
}

export function TabButton({ active, onClick, icon: Icon, label }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      role="tab"
      aria-selected={active}
      className={`px-4 py-2 font-medium transition-colors relative ${
        active
          ? 'text-blue-600 border-b-2 border-blue-600'
          : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      <div className="flex items-center gap-2">
        <Icon size={16} />
        {label}
      </div>
    </button>
  );
}
