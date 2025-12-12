'use client';

import { useState, useEffect, useCallback } from 'react';
import { getDesignGeometry, getDesign } from '@/lib/api/client';
import type { DesignGeometry, DesignSummary } from '@/lib/types';

interface UseGeometryLoaderResult {
  geometry: DesignGeometry | null;
  summary: DesignSummary | null;
  loading: boolean;
  loadError: string | null;
  retryLoadGeometry: () => void;
}

/**
 * ISSUE-011: Custom hook for loading geometry data with timeout and retry
 *
 * Features:
 * - 10 second timeout for slow/unresponsive servers
 * - Error handling with user-friendly messages
 * - Retry functionality for error recovery
 */
export function useGeometryLoader(currentDesign: string | null): UseGeometryLoaderResult {
  const [geometry, setGeometry] = useState<DesignGeometry | null>(null);
  const [summary, setSummary] = useState<DesignSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // ISSUE-011: Retry function for geometry loading
  const retryLoadGeometry = useCallback(() => {
    if (!currentDesign) return;

    setLoading(true);
    setLoadError(null);

    // 10 second timeout for geometry loading
    const timeoutId = setTimeout(() => {
      setLoading(false);
      setLoadError('Loading timed out after 10 seconds. The server may be unavailable.');
    }, 10000);

    Promise.all([
      getDesignGeometry(currentDesign),
      getDesign(currentDesign),
    ])
      .then(([geo, sum]) => {
        clearTimeout(timeoutId);
        setGeometry(geo as DesignGeometry);
        setSummary(sum as DesignSummary);
        setLoadError(null);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        console.error('Failed to load geometry:', error);
        setLoadError(error.message || 'Failed to load geometry data. Check server connection.');
      })
      .finally(() => setLoading(false));
  }, [currentDesign]);

  // Load geometry and summary data on design change
  useEffect(() => {
    if (!currentDesign) return;

    setLoading(true);
    setLoadError(null);

    // 10 second timeout for geometry loading
    const timeoutId = setTimeout(() => {
      setLoading(false);
      setLoadError('Loading timed out after 10 seconds. The server may be unavailable.');
    }, 10000);

    Promise.all([
      getDesignGeometry(currentDesign),
      getDesign(currentDesign),
    ])
      .then(([geo, sum]) => {
        clearTimeout(timeoutId);
        setGeometry(geo as DesignGeometry);
        setSummary(sum as DesignSummary);
        setLoadError(null);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        console.error('Failed to load geometry:', error);
        setLoadError(error.message || 'Failed to load geometry data. Check server connection.');
      })
      .finally(() => setLoading(false));
  }, [currentDesign]);

  return { geometry, summary, loading, loadError, retryLoadGeometry };
}
