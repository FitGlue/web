import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardLayout, DashboardBody, DashboardCol } from '../DashboardLayout';

describe('DashboardLayout', () => {
  it('renders layout wrapper and children', () => {
    const { container } = render(<DashboardLayout>content</DashboardLayout>);
    expect(container.querySelector('.dash-layout')).toBeInTheDocument();
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('DashboardBody renders with body class', () => {
    const { container } = render(<DashboardBody>body</DashboardBody>);
    expect(container.querySelector('.dash-body')).toBeInTheDocument();
    expect(screen.getByText('body')).toBeInTheDocument();
  });

  it('DashboardCol renders with col class', () => {
    const { container } = render(<DashboardCol>col</DashboardCol>);
    expect(container.querySelector('.dash-col')).toBeInTheDocument();
    expect(screen.getByText('col')).toBeInTheDocument();
  });
});
