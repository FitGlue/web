import React, { ReactNode, createContext, useContext } from 'react';
import { Stack } from '../layout';
import { Heading, Paragraph } from '../ui';
import './Wizard.css';

interface WizardContextValue {
  currentStep: number;
  totalSteps: number;
}

const WizardContext = createContext<WizardContextValue>({ currentStep: 0, totalSteps: 0 });

export interface WizardProps {
  currentStep: number;
  children: ReactNode;
}

export interface WizardStepProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export interface WizardHeaderProps {
  steps: string[];
  currentStep: number;
}

export const Wizard: React.FC<WizardProps> = ({
  currentStep,
  children,
}) => {
  const childArray = React.Children.toArray(children);
  const totalSteps = childArray.length;

  return (
    <WizardContext.Provider value={{ currentStep, totalSteps }}>
      <div>
        <Stack gap="lg">
          {childArray[currentStep]}
        </Stack>
      </div>
    </WizardContext.Provider>
  );
};

export const WizardStep: React.FC<WizardStepProps> = ({
  title,
  description,
  children,
}) => {
  return (
    <div>
      <Stack gap="lg">
        <div>
          <Stack gap="xs">
            <div>
              <Heading level={2}>{title}</Heading>
            </div>
            {description && (
              <div>
                <Paragraph muted>{description}</Paragraph>
              </div>
            )}
          </Stack>
        </div>
        <div>
          <Stack gap="md">{children}</Stack>
        </div>
      </Stack>
    </div>
  );
};

export const WizardHeader: React.FC<WizardHeaderProps> = ({
  steps,
  currentStep,
}) => {
  return (
    <div>
      <Stack direction="horizontal" gap="md">
        {steps.map((step, index) => (
          <div
            key={index}
            className={[
              'ui-wizard-header__step',
              index < currentStep && 'ui-wizard-header__step--completed',
              index === currentStep && 'ui-wizard-header__step--active',
              index > currentStep && 'ui-wizard-header__step--upcoming',
            ].filter(Boolean).join(' ')}
          >
            <Stack direction="horizontal" align="center" gap="xs">
              <span>
                {index < currentStep ? '✓' : index + 1}
              </span>
              <span>{step}</span>
            </Stack>
          </div>
        ))}
      </Stack>
    </div>
  );
};

export const useWizard = () => useContext(WizardContext);
