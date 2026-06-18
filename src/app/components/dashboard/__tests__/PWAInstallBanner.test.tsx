import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const usePWAInstall = vi.fn();
vi.mock('../../../hooks/usePWAInstall', () => ({
  usePWAInstall: () => usePWAInstall(),
}));

import { PWAInstallBanner } from '../PWAInstallBanner';

describe('PWAInstallBanner', () => {
  it('renders nothing when install is not available', () => {
    usePWAInstall.mockReturnValue({ canInstall: false, promptInstall: vi.fn(), dismissForMonth: vi.fn() });
    const { container } = render(<PWAInstallBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the install prompt and wires dismiss', () => {
    const dismissForMonth = vi.fn();
    usePWAInstall.mockReturnValue({ canInstall: true, promptInstall: vi.fn(), dismissForMonth });
    render(<PWAInstallBanner />);
    expect(screen.getByText('Install FitGlue')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Dismiss for 30 days'));
    expect(dismissForMonth).toHaveBeenCalledTimes(1);
  });
});
