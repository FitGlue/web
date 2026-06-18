import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TabbedCard } from '../TabbedCard';

const tabs = [
  { id: 'a', icon: '📊', label: 'Stats' },
  { id: 'b', icon: '⚙', label: 'Config', count: 2 },
];

describe('TabbedCard', () => {
  it('renders all tabs and content', () => {
    render(
      <TabbedCard tabs={tabs} activeTab="a" onTabChange={() => {}}>
        body
      </TabbedCard>
    );
    expect(screen.getByText('Stats')).toBeInTheDocument();
    expect(screen.getByText('Config')).toBeInTheDocument();
    expect(screen.getByText('body')).toBeInTheDocument();
  });

  it('renders tab count', () => {
    render(<TabbedCard tabs={tabs} activeTab="a" onTabChange={() => {}}>b</TabbedCard>);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('fires onTabChange', async () => {
    const onTabChange = vi.fn();
    render(<TabbedCard tabs={tabs} activeTab="a" onTabChange={onTabChange}>b</TabbedCard>);
    await userEvent.click(screen.getByText('Config'));
    expect(onTabChange).toHaveBeenCalledWith('b');
  });

  it('renders footer text', () => {
    render(
      <TabbedCard tabs={tabs} activeTab="a" onTabChange={() => {}} footerText="footer">
        b
      </TabbedCard>
    );
    expect(screen.getByText('footer')).toBeInTheDocument();
  });
});
