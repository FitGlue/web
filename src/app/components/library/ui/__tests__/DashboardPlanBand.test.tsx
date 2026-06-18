import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DashboardPlanBand } from '../DashboardPlanBand';

describe('DashboardPlanBand', () => {
  it('renders the FREE tier label', () => {
    render(<DashboardPlanBand tier="FREE" />);
    expect(screen.getByText(/FREE PLAN/)).toBeInTheDocument();
  });

  it('renders the PRO tier label', () => {
    render(<DashboardPlanBand tier="PRO" />);
    expect(screen.getByText(/PRO PLAN/)).toBeInTheDocument();
  });

  it('renders credits and reset meta', () => {
    render(<DashboardPlanBand tier="FREE" credits={5} resetDate="Jul 1" />);
    expect(screen.getByText(/5 credits/)).toBeInTheDocument();
    expect(screen.getByText(/resets Jul 1/)).toBeInTheDocument();
  });

  it('fires onManage when manage clicked', async () => {
    const onManage = vi.fn();
    render(<DashboardPlanBand tier="FREE" onManage={onManage} />);
    await userEvent.click(screen.getByText('MANAGE →'));
    expect(onManage).toHaveBeenCalledOnce();
  });
});
