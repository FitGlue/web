import React from 'react';
import { Stack } from '../library/layout/Stack';
import { Badge } from '../library/ui/Badge';
import { Paragraph } from '../library/ui/Paragraph';
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
        <Stack direction="horizontal" className="wizard-step-indicator" role="navigation" aria-label="Wizard progress">
            {steps.map((step, index) => {
                const isCompleted = index < currentStepIndex;
                const isCurrent = index === currentStepIndex;

                const status = isCompleted ? 'completed' : isCurrent ? 'current' : 'upcoming';

                return (
                    <Stack
                        key={step.id}
                        className={`wizard-step ${status}`}
                        aria-current={isCurrent ? 'step' : undefined}
                        align="center"
                        gap="xs"
                    >
                        <Badge className="wizard-step__circle">
                            {isCompleted ? '✓' : index + 1}
                        </Badge>
                        <Paragraph inline className="wizard-step__label">{step.label}</Paragraph>
                    </Stack>
                );
            })}
        </Stack>
    );
};

export default WizardStepIndicator;
