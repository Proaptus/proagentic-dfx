import { clsx, type ClassValue } from 'clsx';

/**
 * Utility function to merge Tailwind CSS classes
 * Handles conditional classes and deduplication
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
