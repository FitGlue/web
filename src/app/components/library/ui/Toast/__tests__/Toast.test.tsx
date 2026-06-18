import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider, useToast } from '../Toast';

afterEach(() => {
  vi.useRealTimers();
});

function ShowButton() {
  const toast = useToast();
  return (
    <button onClick={() => toast.success('Saved', 'All good')}>fire</button>
  );
}

describe('Toast', () => {
  it('renders children inside the provider with no toasts initially', () => {
    render(
      <ToastProvider>
        <div>child content</div>
      </ToastProvider>,
    );
    expect(screen.getByText('child content')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows a toast with title and message when triggered', async () => {
    render(
      <ToastProvider>
        <ShowButton />
      </ToastProvider>,
    );
    await userEvent.click(screen.getByText('fire'));
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('ui-toast--success');
    expect(screen.getByText('Saved')).toBeInTheDocument();
    expect(screen.getByText('All good')).toBeInTheDocument();
  });

  it('useToast throws when used outside a provider', () => {
    function Bare() {
      useToast();
      return null;
    }
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Bare />)).toThrow('useToast must be used within a ToastProvider');
    spy.mockRestore();
  });

  it('renders the close button on a toast', async () => {
    render(
      <ToastProvider>
        <ShowButton />
      </ToastProvider>,
    );
    await userEvent.click(screen.getByText('fire'));
    expect(screen.getByRole('button', { name: '×' })).toBeInTheDocument();
  });
});
