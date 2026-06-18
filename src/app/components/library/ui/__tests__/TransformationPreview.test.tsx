import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TransformationPreview } from '../TransformationPreview';

describe('TransformationPreview', () => {
  it('renders before and after text', () => {
    render(<TransformationPreview before="Plain run" after="Boosted run" />);
    expect(screen.getByText('Plain run')).toBeInTheDocument();
    expect(screen.getByText('Boosted run')).toBeInTheDocument();
  });

  it('renders default labels', () => {
    render(<TransformationPreview before="a" after="b" />);
    expect(screen.getByText('Before')).toBeInTheDocument();
    expect(screen.getByText(/After — FitGlue Boosted/)).toBeInTheDocument();
  });

  it('renders custom labels', () => {
    render(
      <TransformationPreview before="a" after="b" beforeLabel="Old" afterLabel="New" />
    );
    expect(screen.getByText('Old')).toBeInTheDocument();
    expect(screen.getByText(/New/)).toBeInTheDocument();
  });
});
