import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PluginIcon } from '../PluginIcon';

describe('PluginIcon', () => {
  it('renders emoji fallback when no image', () => {
    render(<PluginIcon icon="🏃" />);
    expect(screen.getByText('🏃')).toBeInTheDocument();
  });

  it('renders an img when iconType and iconPath provided', () => {
    const { container } = render(
      <PluginIcon icon="x" iconType="svg" iconPath="/x.svg" />
    );
    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    expect(img?.getAttribute('src')).toBe('/x.svg');
  });

  it('applies size class', () => {
    const { container } = render(<PluginIcon icon="x" size="large" />);
    expect(container.querySelector('.plugin-icon-large')).not.toBeNull();
  });
});
