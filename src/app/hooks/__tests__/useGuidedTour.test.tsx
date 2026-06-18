import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import { GuidedTourProvider, useGuidedTour } from '../useGuidedTour';

beforeEach(() => {
  localStorage.clear();
});

function wrapper({ children }: { children: React.ReactNode }) {
  return <GuidedTourProvider>{children}</GuidedTourProvider>;
}

describe('useGuidedTour outside provider', () => {
  it('returns a no-op fallback', () => {
    const { result } = renderHook(() => useGuidedTour());
    expect(result.current.isActive).toBe(false);
    expect(result.current.isCompleted).toBe(true);
    expect(result.current.steps).toEqual([]);
    // no-op functions should not throw
    act(() => {
      result.current.startTour();
      result.current.nextStep();
      result.current.skipTour();
      result.current.dismissTour();
    });
  });
});

describe('useGuidedTour with provider', () => {
  it('starts the tour and exposes the first step', () => {
    const { result } = renderHook(() => useGuidedTour(), { wrapper });
    expect(result.current.isActive).toBe(false);
    expect(result.current.totalSteps).toBeGreaterThan(0);
    act(() => result.current.startTour());
    expect(result.current.isActive).toBe(true);
    expect(result.current.currentStep).toBe(0);
    expect(result.current.step?.id).toBe('step-connections');
  });

  it('advances through steps and completes at the end', () => {
    const { result } = renderHook(() => useGuidedTour(), { wrapper });
    act(() => result.current.startTour());
    const total = result.current.totalSteps;
    for (let i = 0; i < total - 1; i++) {
      act(() => result.current.nextStep());
    }
    expect(result.current.currentStep).toBe(total - 1);
    act(() => result.current.nextStep()); // last step completes
    expect(result.current.isActive).toBe(false);
    expect(localStorage.getItem('fitglue_tour_completed')).toBe('true');
  });

  it('skipTour marks completed and deactivates', () => {
    const { result } = renderHook(() => useGuidedTour(), { wrapper });
    act(() => result.current.startTour());
    act(() => result.current.skipTour());
    expect(result.current.isActive).toBe(false);
    expect(localStorage.getItem('fitglue_tour_completed')).toBe('true');
  });

  it('dismissTour deactivates without marking complete', () => {
    const { result } = renderHook(() => useGuidedTour(), { wrapper });
    act(() => result.current.startTour());
    act(() => result.current.dismissTour());
    expect(result.current.isActive).toBe(false);
    expect(localStorage.getItem('fitglue_tour_completed')).toBeNull();
  });

  it('reflects completion from localStorage', () => {
    localStorage.setItem('fitglue_tour_completed', 'true');
    const { result } = renderHook(() => useGuidedTour(), { wrapper });
    expect(result.current.isCompleted).toBe(true);
  });
});
