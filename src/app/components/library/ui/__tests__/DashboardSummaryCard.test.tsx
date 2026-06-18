import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DashboardSummaryCard } from '../DashboardSummaryCard';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

describe('DashboardSummaryCard', () => {
  it('renders title and children', () => {
    render(
      <DashboardSummaryCard title="Connections">inner content</DashboardSummaryCard>,
      { wrapper: Wrapper }
    );
    expect(screen.getByText('Connections')).toBeInTheDocument();
    expect(screen.getByText('inner content')).toBeInTheDocument();
  });

  it('renders link when linkTo provided', () => {
    render(
      <DashboardSummaryCard title="T" linkTo="/x">c</DashboardSummaryCard>,
      { wrapper: Wrapper }
    );
    expect(screen.getByText('View All →')).toBeInTheDocument();
  });

  it('renders footer text', () => {
    render(
      <DashboardSummaryCard title="T" footerText="4 of 6 connected">c</DashboardSummaryCard>,
      { wrapper: Wrapper }
    );
    expect(screen.getByText('4 of 6 connected')).toBeInTheDocument();
  });
});
