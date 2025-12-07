/**
 * Physics Verification Tests
 * Verify that calculations match the numerical examples from requirements
 */

import { describe, it, expect } from 'vitest';
import {
  calculateHoopStress,
  calculateAxialStress,
  getNettingTheoryAngle,
} from '../pressure-vessel';
import {
  calculateTsaiWuIndex,
  CARBON_EPOXY_STRENGTHS,
} from '../composite-analysis';
import { generateIsotensoidDome } from '../dome-geometry';
import { calculateReliability } from '../reliability';
import { calculateFatigueLife, CARBON_EPOXY_SN } from '../fatigue';

describe('Pressure Vessel Physics Verification', () => {
  it('should calculate hoop stress correctly - Example from requirements', () => {
    // Example: P = 700 bar = 70 MPa, R = 175 mm = 0.175 m, t = 25 mm = 0.025 m
    // Expected: σ_hoop = 70 × 0.175 / 0.025 = 490 MPa
    const pressure = 70; // MPa
    const radius = 0.175; // m
    const thickness = 0.025; // m

    const hoopStress = calculateHoopStress(pressure, radius, thickness);

    expect(hoopStress).toBe(490);
  });

  it('should calculate axial stress correctly', () => {
    // Example: P = 700 bar = 70 MPa, R = 175 mm = 0.175 m, t = 25 mm = 0.025 m
    // Expected: σ_axial = 70 × 0.175 / (2 × 0.025) = 245 MPa
    const pressure = 70; // MPa
    const radius = 0.175; // m
    const thickness = 0.025; // m

    const axialStress = calculateAxialStress(pressure, radius, thickness);

    expect(axialStress).toBe(245);
  });

  it('should verify stress ratio is 2:1 (hoop to axial)', () => {
    const pressure = 70;
    const radius = 0.175;
    const thickness = 0.025;

    const hoopStress = calculateHoopStress(pressure, radius, thickness);
    const axialStress = calculateAxialStress(pressure, radius, thickness);
    const ratio = hoopStress / axialStress;

    expect(ratio).toBe(2);
  });

  it('should return netting theory angle of 54.74°', () => {
    const angle = getNettingTheoryAngle();
    expect(angle).toBeCloseTo(54.735, 2);
  });
});

describe('Composite Analysis Verification', () => {
  it('should calculate Tsai-Wu index for typical composite stresses', () => {
    // Typical stresses in hoop layer
    const sigma1 = 490; // MPa (fiber direction)
    const sigma2 = 30; // MPa (transverse)
    const tau12 = 10; // MPa (shear)

    const tsaiWu = calculateTsaiWuIndex(
      sigma1,
      sigma2,
      tau12,
      CARBON_EPOXY_STRENGTHS
    );

    // Should be less than 1.0 for safe design
    expect(tsaiWu).toBeLessThan(1.0);
    expect(tsaiWu).toBeGreaterThan(0);
  });

  it('should predict failure when stress exceeds strength', () => {
    // Very high stress that should fail
    const sigma1 = 3000; // MPa (exceeds 2500 MPa strength)
    const sigma2 = 30;
    const tau12 = 10;

    const tsaiWu = calculateTsaiWuIndex(
      sigma1,
      sigma2,
      tau12,
      CARBON_EPOXY_STRENGTHS
    );

    // Should be greater than 1.0 indicating failure
    expect(tsaiWu).toBeGreaterThan(1.0);
  });
});

describe('Dome Geometry Verification', () => {
  it('should generate isotensoid dome profile', () => {
    const r0 = 175; // mm
    const alpha0 = 54.74; // degrees
    const bossRadius = 25; // mm
    const numPoints = 50;

    const profile = generateIsotensoidDome(r0, alpha0, bossRadius, numPoints);

    expect(profile.length).toBe(numPoints + 1);
    expect(profile[0].r).toBe(r0); // Start at cylinder radius
    expect(profile[0].z).toBe(0); // Start at z=0
    expect(profile[profile.length - 1].r).toBeCloseTo(bossRadius, 1); // End at boss
    expect(profile[profile.length - 1].z).toBeGreaterThan(0); // Dome extends upward
  });

  it('should create monotonic dome profile (r decreases, z increases)', () => {
    const profile = generateIsotensoidDome(175, 54.74, 25, 50);

    for (let i = 1; i < profile.length; i++) {
      expect(profile[i].r).toBeLessThanOrEqual(profile[i - 1].r); // r decreases
      expect(profile[i].z).toBeGreaterThanOrEqual(profile[i - 1].z); // z increases
    }
  });
});

describe('Reliability Analysis Verification', () => {
  it('should run Monte Carlo simulation and return valid probability', () => {
    const designStress = 490; // MPa
    const materialStrength = 2500; // MPa
    const strengthCOV = 0.05;
    const stressCOV = 0.10;
    const numSamples = 10000;

    const result = calculateReliability(
      designStress,
      materialStrength,
      strengthCOV,
      stressCOV,
      numSamples
    );

    expect(result.pFailure).toBeGreaterThanOrEqual(0);
    expect(result.pFailure).toBeLessThanOrEqual(1);
    expect(result.samplesRun).toBe(numSamples);
    expect(result.reliabilityIndex).toBeGreaterThan(0); // Should be safe design
  });

  it('should give very low failure probability for conservative design', () => {
    const designStress = 200; // MPa (very conservative)
    const materialStrength = 2500; // MPa
    const strengthCOV = 0.05;
    const stressCOV = 0.10;

    const result = calculateReliability(
      designStress,
      materialStrength,
      strengthCOV,
      stressCOV,
      10000
    );

    // Should be extremely safe (very low P_failure)
    expect(result.pFailure).toBeLessThan(0.001); // Less than 0.1%
  });
});

describe('Fatigue Analysis Verification', () => {
  it('should calculate fatigue life using S-N curve', () => {
    const stressAmplitude = 600; // MPa (above endurance limit)
    const cycles = calculateFatigueLife(stressAmplitude, CARBON_EPOXY_SN);

    // Should return a finite positive number
    expect(cycles).toBeGreaterThan(0);
    expect(isFinite(cycles)).toBe(true);
  });

  it('should show higher stress = lower fatigue life', () => {
    const lowStress = 600; // MPa
    const highStress = 800; // MPa

    const lowStressCycles = calculateFatigueLife(lowStress, CARBON_EPOXY_SN);
    const highStressCycles = calculateFatigueLife(highStress, CARBON_EPOXY_SN);

    expect(lowStressCycles).toBeGreaterThan(highStressCycles);
  });

  it('should return infinite life for stress below endurance limit', () => {
    const cycles = calculateFatigueLife(400, CARBON_EPOXY_SN); // Below 500 MPa endurance limit
    expect(cycles).toBe(Infinity);
  });

  it('should return infinite life for zero stress', () => {
    const cycles = calculateFatigueLife(0, CARBON_EPOXY_SN);
    expect(cycles).toBe(Infinity);
  });
});
