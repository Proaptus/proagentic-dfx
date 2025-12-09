'use client';

/**
 * OnboardingTour - First-time user guide
 */

import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const TOUR_DISMISSED_KEY = 'h2-tank-tour-dismissed';

interface TourStep {
  title: string;
  description: string;
  targetSelector?: string; // CSS selector for element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Welcome to H2 Tank Designer',
    description:
      'This enterprise tool helps you design, analyze, and certify hydrogen pressure vessels. Let\'s walk through the key features.',
  },
  {
    title: 'Requirements Traceability',
    description:
      'Start by defining requirements (working pressure, volume, standards). All design decisions trace back to requirements.',
    targetSelector: '[data-tour="requirements"]',
    position: 'right',
  },
  {
    title: 'Tank Type Selection',
    description:
      'Select tank type (Type IV recommended for automotive). Configure geometry, materials, and layup sequence.',
    targetSelector: '[data-tour="tank-config"]',
    position: 'right',
  },
  {
    title: 'Material Database',
    description:
      'Access comprehensive material properties for carbon fiber, epoxy, and liner materials. Includes uncertainty data for Monte Carlo.',
    targetSelector: '[data-tour="materials"]',
    position: 'right',
  },
  {
    title: 'Analysis & Simulation',
    description:
      'Run analytical calculations (netting theory) and FEA integration. Includes Tsai-Wu failure criteria and progressive failure analysis.',
    targetSelector: '[data-tour="analysis"]',
    position: 'left',
  },
  {
    title: 'Monte Carlo Reliability',
    description:
      'Probabilistic analysis accounts for material variability and manufacturing tolerances. Target 99.99% reliability.',
    targetSelector: '[data-tour="monte-carlo"]',
    position: 'left',
  },
  {
    title: 'Compliance Checking',
    description:
      'Automatically verify compliance with ISO 11119-3, UN R134, and SAE J2579. Generate certification reports.',
    targetSelector: '[data-tour="compliance"]',
    position: 'right',
  },
  {
    title: 'Help System',
    description:
      'Click the help icon (?) throughout the interface for contextual help. Access the glossary for engineering terms.',
    targetSelector: '[data-tour="help"]',
    position: 'left',
  },
];

export function OnboardingTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    // Check if tour was previously dismissed
    const dismissed = localStorage.getItem(TOUR_DISMISSED_KEY);
    if (!dismissed) {
      // Show tour after short delay
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem(TOUR_DISMISSED_KEY, 'true');
    }
    setIsOpen(false);
  };

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    setDontShowAgain(true);
    handleClose();
  };

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];
  const isLastStep = currentStep === TOUR_STEPS.length - 1;

  // Calculate position for tooltip (simplified - would need actual element positions in production)
  const _getTooltipPosition = () => {
    if (!step.targetSelector) {
      // Center modal for steps without target
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    // For steps with target, position near element (simplified)
    const positions = {
      top: { bottom: '100%', left: '50%', transform: 'translateX(-50%)' },
      bottom: { top: '100%', left: '50%', transform: 'translateX(-50%)' },
      left: { right: '100%', top: '50%', transform: 'translateY(-50%)' },
      right: { left: '100%', top: '50%', transform: 'translateY(-50%)' },
    };

    return positions[step.position || 'bottom'];
  };

  return (
    <>
      {/* Backdrop with hole for highlighted element */}
      <div className="fixed inset-0 z-50 pointer-events-none">
        {/* Dark overlay */}
        <div
          className="absolute inset-0 bg-black/70 transition-opacity pointer-events-auto"
          onClick={handleClose}
        />

        {/* Highlighted element cutout would go here in production */}
      </div>

      {/* Tooltip */}
      <div
        className="fixed z-50 w-[400px] bg-background border-2 border-primary rounded-lg shadow-2xl p-6"
        style={
          step.targetSelector
            ? { top: '50%', right: '20px', transform: 'translateY(-50%)' }
            : { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
        }
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-accent transition-colors"
          aria-label="Close tour"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Progress indicator */}
        <div className="flex gap-1 mb-4">
          {TOUR_STEPS.map((_, index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded-full transition-colors ${
                index <= currentStep ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold mb-2">{step.title}</h3>
            <p className="text-sm text-muted-foreground">{step.description}</p>
          </div>

          {/* Don't show again checkbox (last step only) */}
          {isLastStep && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="dont-show"
                checked={dontShowAgain}
                onCheckedChange={(checked) => setDontShowAgain(checked === true)}
              />
              <Label
                htmlFor="dont-show"
                className="text-sm text-muted-foreground cursor-pointer"
              >
                Don&apos;t show this tour again
              </Label>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button variant="outline" size="sm" onClick={handlePrevious}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
              )}
            </div>

            <div className="text-xs text-muted-foreground">
              {currentStep + 1} of {TOUR_STEPS.length}
            </div>

            <div className="flex gap-2">
              {!isLastStep && (
                <Button variant="ghost" size="sm" onClick={handleSkip}>
                  Skip Tour
                </Button>
              )}
              <Button size="sm" onClick={handleNext}>
                {isLastStep ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Finish
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * Reset tour for testing/development
 */
export function resetOnboardingTour() {
  localStorage.removeItem(TOUR_DISMISSED_KEY);
}
