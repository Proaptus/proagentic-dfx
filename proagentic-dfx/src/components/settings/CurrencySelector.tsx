'use client';

/**
 * CurrencySelector Component
 * Allows users to select their preferred currency for cost displays
 */

import { useAppStore } from '@/lib/stores/app-store';
import { CURRENCIES, getCurrencyOptions, type CurrencyCode } from '@/lib/utils/currency';

interface CurrencySelectorProps {
  /** Optional className for styling */
  className?: string;
  /** Label to show before the select */
  label?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

export function CurrencySelector({
  className = '',
  label = 'Currency',
  size = 'md',
}: CurrencySelectorProps) {
  const currency = useAppStore((state) => state.currency);
  const setCurrency = useAppStore((state) => state.setCurrency);

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCurrency = e.target.value as CurrencyCode;
    setCurrency(newCurrency);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {label && (
        <label htmlFor="currency-select" className="text-sm font-medium text-gray-700">
          {label}:
        </label>
      )}
      <select
        id="currency-select"
        value={currency}
        onChange={handleChange}
        className={`border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ${sizeClasses[size]}`}
      >
        {getCurrencyOptions().map((option) => (
          <option key={option.value} value={option.value}>
            {CURRENCIES[option.value].symbol} {option.value}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * Compact currency selector showing just the symbol
 * For use in headers or tight spaces
 */
export function CurrencySelectorCompact({ className = '' }: { className?: string }) {
  const currency = useAppStore((state) => state.currency);
  const setCurrency = useAppStore((state) => state.setCurrency);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCurrency = e.target.value as CurrencyCode;
    setCurrency(newCurrency);
  };

  return (
    <select
      value={currency}
      onChange={handleChange}
      className={`bg-transparent border-none text-sm font-medium cursor-pointer focus:ring-0 ${className}`}
      aria-label="Select currency"
    >
      {Object.entries(CURRENCIES).map(([code, config]) => (
        <option key={code} value={code}>
          {config.symbol}
        </option>
      ))}
    </select>
  );
}
