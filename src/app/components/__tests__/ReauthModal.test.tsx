import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { User } from 'firebase/auth';

vi.mock('firebase/auth', () => ({
  reauthenticateWithCredential: vi.fn().mockResolvedValue({}),
  EmailAuthProvider: { credential: vi.fn(() => ({})) },
}));

import { ReauthModal } from '../ReauthModal';

const user = { email: 'a@b.com' } as User;

describe('ReauthModal', () => {
  it('renders the default title and description', () => {
    render(<ReauthModal user={user} isOpen onSuccess={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByText('Confirm Your Identity')).toBeInTheDocument();
    expect(screen.getByText(/enter your current password/)).toBeInTheDocument();
  });

  it('disables confirm until a password is entered', () => {
    render(<ReauthModal user={user} isOpen onSuccess={vi.fn()} onCancel={vi.fn()} />);
    const confirm = screen.getByText('Confirm');
    expect(confirm).toBeDisabled();
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'secret' },
    });
    expect(confirm).not.toBeDisabled();
  });

  it('fires onCancel when cancelled', () => {
    const onCancel = vi.fn();
    render(<ReauthModal user={user} isOpen onSuccess={vi.fn()} onCancel={onCancel} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
