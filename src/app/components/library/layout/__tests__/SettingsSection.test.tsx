import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SettingsSection } from '../SettingsSection';

describe('SettingsSection', () => {
  it('renders children', () => {
    render(<SettingsSection>content</SettingsSection>);
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('renders title heading when provided', () => {
    render(<SettingsSection title="Account">content</SettingsSection>);
    expect(screen.getByRole('heading', { name: 'Account' })).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(
      <SettingsSection description="manage account">content</SettingsSection>,
    );
    expect(screen.getByText('manage account')).toBeInTheDocument();
  });

  it('applies default variant class', () => {
    const { container } = render(<SettingsSection>x</SettingsSection>);
    expect(container.firstChild).toHaveClass('settings-section--default');
  });

  it('applies danger variant class', () => {
    const { container } = render(
      <SettingsSection variant="danger">x</SettingsSection>,
    );
    expect(container.firstChild).toHaveClass('settings-section--danger');
  });
});
