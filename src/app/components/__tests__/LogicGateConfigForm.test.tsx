import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LogicGateConfigForm } from '../LogicGateConfigForm';

describe('LogicGateConfigForm', () => {
  it('renders the match mode, rules and actions sections', () => {
    render(<LogicGateConfigForm onChange={vi.fn()} />);
    expect(screen.getByText('Match Mode')).toBeInTheDocument();
    expect(screen.getByText('Rules')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
    expect(screen.getByText('+ Add Rule')).toBeInTheDocument();
  });
});
