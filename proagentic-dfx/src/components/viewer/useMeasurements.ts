'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  type MeasurementMode,
  type Measurement,
  calculateDistance,
  calculateAngle,
  calculateRadius
} from '@/components/viewer/MeasurementTools';

interface UseMeasurementsResult {
  measurementMode: MeasurementMode;
  measurements: Measurement[];
  pendingPoints: Array<{ x: number; y: number; z: number }>;
  setMeasurementMode: (mode: MeasurementMode) => void;
  handlePointClick: (point: { x: number; y: number; z: number }) => void;
  clearMeasurements: () => void;
  deleteMeasurement: (id: string) => void;
  clearPendingPoints: () => void;
}

/**
 * Custom hook for managing 3D viewer measurements
 * Handles distance, angle, and radius calculations
 */
export function useMeasurements(): UseMeasurementsResult {
  const [measurementMode, setMeasurementMode] = useState<MeasurementMode>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [pendingPoints, setPendingPoints] = useState<Array<{ x: number; y: number; z: number }>>([]);

  // Handle point selection
  const handlePointClick = useCallback((point: { x: number; y: number; z: number }) => {
    if (!measurementMode) return;
    setPendingPoints((prev) => [...prev, point]);
  }, [measurementMode]);

  // Auto-create measurements when enough points are collected
  useEffect(() => {
    if (!measurementMode || pendingPoints.length === 0) return;

    let value = 0;
    let unit = '';
    let complete = false;

    if (measurementMode === 'distance' && pendingPoints.length === 2) {
      value = calculateDistance(pendingPoints[0], pendingPoints[1]);
      unit = 'mm';
      complete = true;
    } else if (measurementMode === 'angle' && pendingPoints.length === 3) {
      value = calculateAngle(pendingPoints[0], pendingPoints[1], pendingPoints[2]);
      unit = '°';
      complete = true;
    } else if (measurementMode === 'radius' && pendingPoints.length === 2) {
      value = calculateRadius(pendingPoints[0], pendingPoints[1]);
      unit = 'mm';
      complete = true;
    }

    if (complete) {
      const newMeasurement: Measurement = {
        id: Math.random().toString(36).substr(2, 9),
        type: measurementMode,
        value,
        unit,
        points: [...pendingPoints],
        timestamp: Date.now(),
      };
      setMeasurements((prev) => [newMeasurement, ...prev]);
      setPendingPoints([]);
    }
  }, [pendingPoints, measurementMode]);

  const clearMeasurements = useCallback(() => {
    setMeasurements([]);
    setPendingPoints([]);
  }, []);

  const deleteMeasurement = useCallback((id: string) => {
    setMeasurements((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const clearPendingPoints = useCallback(() => {
    setPendingPoints([]);
  }, []);

  return {
    measurementMode,
    measurements,
    pendingPoints,
    setMeasurementMode,
    handlePointClick,
    clearMeasurements,
    deleteMeasurement,
    clearPendingPoints,
  };
}
