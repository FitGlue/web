import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SummaryListItem } from '../SummaryListItem';

describe('SummaryListItem', () => {
  it('renders title and subtitle', () => {
    render(<SummaryListItem title="Strava" subtitle="Connected" />);
    expect(screen.getByText('Strava')).toBeInTheDocument();
    expect(screen.getByText('Connected')).toBeInTheDocument();
  });

  it('renders custom children instead of title', () => {
    render(<SummaryListItem><span>custom</span></SummaryListItem>);
    expect(screen.getByText('custom')).toBeInTheDocument();
  });

  it('renders status with variant class', () => {
    const { container } = render(
      <SummaryListItem title="t" status="✓" statusVariant="active" />
    );
    expect(container.querySelector('.summary-list-item__status--active')).not.toBeNull();
  });

  it('renders as a button and fires onClick', async () => {
    const handler = vi.fn();
    render(<SummaryListItem title="t" onClick={handler} />);
    await userEvent.click(screen.getByRole('button'));
    expect(handler).toHaveBeenCalledOnce();
  });
});
