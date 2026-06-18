import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { CardHeader } from '../CardHeader';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

describe('CardHeader', () => {
  it('renders icon and title', () => {
    render(<CardHeader icon="🔥" title="My Card" />, { wrapper: Wrapper });
    expect(screen.getByText(/My Card/)).toBeInTheDocument();
  });

  it('renders a link when linkTo provided', () => {
    render(<CardHeader icon="x" title="t" linkTo="/somewhere" />, { wrapper: Wrapper });
    expect(screen.getByText('View All →')).toBeInTheDocument();
  });

  it('renders an action button and fires onAction', async () => {
    const handler = vi.fn();
    render(<CardHeader icon="x" title="t" onAction={handler} actionLabel="Do it" />, { wrapper: Wrapper });
    await userEvent.click(screen.getByText('Do it'));
    expect(handler).toHaveBeenCalledOnce();
  });

  it('hides link when showLink is false', () => {
    render(<CardHeader icon="x" title="t" linkTo="/x" showLink={false} />, { wrapper: Wrapper });
    expect(screen.queryByText('View All →')).toBeNull();
  });
});
