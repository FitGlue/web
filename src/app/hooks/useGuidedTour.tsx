import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const TOUR_STORAGE_KEY = 'fitglue_tour_completed';

export interface TourStep {
    id: string;
    targetSelector: string;
    title: string;
    description: string;
    position: 'top' | 'bottom' | 'left' | 'right';
}

const TOUR_STEPS: TourStep[] = [
    {
        id: 'step-connections',
        targetSelector: '[data-tour="step-connections"]',
        title: '🔗 Step 1: Connect Your Apps',
        description:
            'Start here! Link your fitness apps — Strava, Hevy, Fitbit, and more. These are the inputs and outputs for your data.',
        position: 'bottom',
    },
    {
        id: 'step-pipeline',
        targetSelector: '[data-tour="step-pipeline"]',
        title: '⚡ Step 2: Build a Pipeline',
        description:
            'Pipelines define how your data flows. Pick a source, add Boosters for enhancement, then choose where the enriched data goes.',
        position: 'bottom',
    },
    {
        id: 'step-magic',
        targetSelector: '[data-tour="step-magic"]',
        title: '✨ Step 3: Watch the Magic',
        description:
            'Once set up, your activities are boosted automatically! Check the Activity feed to see your transformed workouts.',
        position: 'bottom',
    },
    {
        id: 'summary-connections',
        targetSelector: '[data-tour="summary-connections"]',
        title: '📊 Your Connection Status',
        description:
            'This card shows which apps are connected. Tap it anytime to manage your connections or add new ones.',
        position: 'bottom',
    },
];

interface GuidedTourContextValue {
    isActive: boolean;
    currentStep: number;
    totalSteps: number;
    step: TourStep | null;
    steps: TourStep[];
    isCompleted: boolean;
    startTour: () => void;
    nextStep: () => void;
    skipTour: () => void;
    dismissTour: () => void;
}

const GuidedTourContext = createContext<GuidedTourContextValue | null>(null);

export const GuidedTourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isActive, setIsActive] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    const completed = (() => {
        try {
            return localStorage.getItem(TOUR_STORAGE_KEY) === 'true';
        } catch {
            return false;
        }
    })();

    const startTour = useCallback(() => {
        setCurrentStep(0);
        setIsActive(true);
    }, []);

    const nextStep = useCallback(() => {
        if (currentStep < TOUR_STEPS.length - 1) {
            setCurrentStep((prev) => prev + 1);
        } else {
            try {
                localStorage.setItem(TOUR_STORAGE_KEY, 'true');
            } catch {
                /* ignore */
            }
            setIsActive(false);
        }
    }, [currentStep]);

    const skipTour = useCallback(() => {
        try {
            localStorage.setItem(TOUR_STORAGE_KEY, 'true');
        } catch {
            /* ignore */
        }
        setIsActive(false);
    }, []);

    const dismissTour = useCallback(() => {
        setIsActive(false);
    }, []);

    // Close on Escape key
    useEffect(() => {
        if (!isActive) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') dismissTour();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isActive, dismissTour]);

    return (
        <GuidedTourContext.Provider
            value= {{
        isActive,
            currentStep,
            totalSteps: TOUR_STEPS.length,
                step: TOUR_STEPS[currentStep] ?? null,
                    steps: TOUR_STEPS,
                        isCompleted: completed,
                            startTour,
                            nextStep,
                            skipTour,
                            dismissTour,
            }
}
        >
    { children }
    </GuidedTourContext.Provider>
    );
};

export function useGuidedTour(): GuidedTourContextValue {
    const ctx = useContext(GuidedTourContext);
    if (!ctx) {
        // Return a no-op fallback if used outside provider
        return {
            isActive: false,
            currentStep: 0,
            totalSteps: 0,
            step: null,
            steps: [],
            isCompleted: true,
            startTour: () => { },
            nextStep: () => { },
            skipTour: () => { },
            dismissTour: () => { },
        };
    }
    return ctx;
}
