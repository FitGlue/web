import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { OverflowMenu, OverflowMenuItem } from '../OverflowMenu';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

const items: OverflowMenuItem[] = [
  { key: 'edit', label: 'Edit', icon: '✎', onClick: vi.fn() },
  { key: 'open', label: 'Open', href: '/open' },
  { key: 'gone', label: 'Disabled', disabled: true, onClick: vi.fn() },
];

describe('OverflowMenu', () => {
  it('renders all item labels', () => {
    render(<OverflowMenu items={items} onClose={vi.fn()} />, { wrapper: Wrapper });
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Open')).toBeInTheDocument();
    expect(screen.getByText('Disabled')).toBeInTheDocument();
  });

  it('renders href items as links', () => {
    render(<OverflowMenu items={items} onClose={vi.fn()} />, { wrapper: Wrapper });
    expect(screen.getByRole('menuitem', { name: 'Open' })).toHaveAttribute('href', '/open');
  });

  it('fires item onClick and onClose for button items', async () => {
    const onClick = vi.fn();
    const onClose = vi.fn();
    render(
      <OverflowMenu items={[{ key: 'a', label: 'Act', onClick }]} onClose={onClose} />,
      { wrapper: Wrapper },
    );
    await userEvent.click(screen.getByRole('menuitem', { name: 'Act' }));
    expect(onClick).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('disabled item does not fire onClick', async () => {
    const onClick = vi.fn();
    const onClose = vi.fn();
    render(
      <OverflowMenu items={[{ key: 'd', label: 'No', disabled: true, onClick }]} onClose={onClose} />,
      { wrapper: Wrapper },
    );
    await userEvent.click(screen.getByRole('menuitem', { name: 'No' }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('calls onClose on Escape key', async () => {
    const onClose = vi.fn();
    render(<OverflowMenu items={items} onClose={onClose} />, { wrapper: Wrapper });
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });
});
