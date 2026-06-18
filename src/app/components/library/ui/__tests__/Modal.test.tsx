import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from '../Modal';

describe('Modal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <Modal isOpen={false} onClose={() => {}}>body</Modal>
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders title and children when open', () => {
    render(<Modal isOpen onClose={() => {}} title="Hi">body</Modal>);
    expect(screen.getByText('Hi')).toBeInTheDocument();
    expect(screen.getByText('body')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('fires onClose from close button', async () => {
    const onClose = vi.fn();
    render(<Modal isOpen onClose={onClose} title="t">b</Modal>);
    await userEvent.click(screen.getByLabelText('Close'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('renders footer', () => {
    render(<Modal isOpen onClose={() => {}} footer={<span>foot</span>}>b</Modal>);
    expect(screen.getByText('foot')).toBeInTheDocument();
  });

  it('applies size class', () => {
    const { container } = render(<Modal isOpen onClose={() => {}} size="lg">b</Modal>);
    expect(container.querySelector('.ui-modal__content--lg')).not.toBeNull();
  });
});
