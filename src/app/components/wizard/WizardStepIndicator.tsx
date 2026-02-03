import React from 'react';
import './WizardStepIndicator.css';

export interface WizardStep {
    id: string;
    label: string;
}

interface WizardStepIndicatorProps {
    steps: WizardStep[];
    currentStepIndex: number;
}

/**
 * Premium step indicator with numbered circles, connecting lines, and visual states.
 * Shows completed steps with checkmarks, current step with glow effect.
 */
export const WizardStepIndicator: React.FC<WizardStepIndicatorProps> = ({
    steps,
    currentStepIndex,
}) => {
    return (
        <div className="wizard-step-indicator" role="navigation" aria-label="Wizard progress">
            {steps.map((step, index) => {
                const isCompleted = index < currentStepIndex;
                const isCurrent = index === currentStepIndex;

                const status = isCompleted ? 'completed' : isCurrent ? 'current' : 'upcoming';

                return (
                    <div
                        key={step.id}
                        className={`wizard-step ${status}`}
                        aria-current={isCurrent ? 'step' : undefined}
                    >
                        <div className="wizard-step__circle">
                            {isCompleted ? '✓' : index + 1}
                        </div>
                        <span className="wizard-step__label">{step.label}</span>
                    </div>
                );
            })}
        </div>
    );
};

export default WizardStepIndicator;
