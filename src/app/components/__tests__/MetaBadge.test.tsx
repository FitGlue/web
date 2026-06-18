import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MetaBadge } from '../MetaBadge';

describe('MetaBadge', () => {
  it('renders the label and value', () => {
    render(<MetaBadge label="Source" value="Hevy" />);
    expect(screen.getByText('Source:')).toBeInTheDocument();
    expect(screen.getByText('Hevy')).toBeInTheDocument();
  });
});
