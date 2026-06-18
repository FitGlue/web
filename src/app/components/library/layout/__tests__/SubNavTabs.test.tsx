import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SubNavTabs } from '../SubNavTabs';

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active', count: 3 },
];

describe('SubNavTabs', () => {
  it('renders all tabs', () => {
    render(<SubNavTabs tabs={tabs} active="all" onSelect={vi.fn()} />);
    expect(screen.getByRole('tab', { name: /All/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Active/ })).toBeInTheDocument();
  });

  it('marks the active tab as selected', () => {
    render(<SubNavTabs tabs={tabs} active="active" onSelect={vi.fn()} />);
    const activeTab = screen.getByRole('tab', { name: /Active/ });
    expect(activeTab).toHaveAttribute('aria-selected', 'true');
    expect(activeTab).toHaveClass('subnav-tabs__tab--active');
  });

  it('renders count badge when count provided', () => {
    render(<SubNavTabs tabs={tabs} active="all" onSelect={vi.fn()} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('calls onSelect with tab key when clicked', async () => {
    const onSelect = vi.fn();
    render(<SubNavTabs tabs={tabs} active="all" onSelect={onSelect} />);
    await userEvent.click(screen.getByRole('tab', { name: /Active/ }));
    expect(onSelect).toHaveBeenCalledWith('active');
  });

  it('uses provided aria-label', () => {
    render(
      <SubNavTabs tabs={tabs} active="all" onSelect={vi.fn()} aria-label="Filters" />,
    );
    expect(screen.getByRole('tablist', { name: 'Filters' })).toBeInTheDocument();
  });
});
