import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Wizard, WizardStep, WizardHeader } from '../Wizard';

describe('Wizard', () => {
  it('renders only the current step', () => {
    render(
      <Wizard currentStep={1}>
        <WizardStep title="First">step one body</WizardStep>
        <WizardStep title="Second">step two body</WizardStep>
      </Wizard>,
    );
    expect(screen.getByText('step two body')).toBeInTheDocument();
    expect(screen.queryByText('step one body')).not.toBeInTheDocument();
  });
});

describe('WizardStep', () => {
  it('renders title, description and children', () => {
    render(
      <WizardStep title="Setup" description="configure things">
        body content
      </WizardStep>,
    );
    expect(screen.getByRole('heading', { name: 'Setup' })).toBeInTheDocument();
    expect(screen.getByText('configure things')).toBeInTheDocument();
    expect(screen.getByText('body content')).toBeInTheDocument();
  });
});

describe('WizardHeader', () => {
  it('renders all step labels', () => {
    render(<WizardHeader steps={['One', 'Two', 'Three']} currentStep={1} />);
    expect(screen.getByText('One')).toBeInTheDocument();
    expect(screen.getByText('Two')).toBeInTheDocument();
    expect(screen.getByText('Three')).toBeInTheDocument();
  });

  it('marks the active step', () => {
    const { container } = render(
      <WizardHeader steps={['One', 'Two']} currentStep={1} />,
    );
    expect(
      container.querySelector('.ui-wizard-header__step--active'),
    ).toBeInTheDocument();
    expect(
      container.querySelector('.ui-wizard-header__step--completed'),
    ).toBeInTheDocument();
  });

  it('shows a check mark for completed steps', () => {
    render(<WizardHeader steps={['One', 'Two']} currentStep={1} />);
    expect(screen.getByText('✓')).toBeInTheDocument();
  });
});
