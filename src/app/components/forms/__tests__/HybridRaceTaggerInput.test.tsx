import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';

vi.mock('../../../../shared/logger', () => ({ logger: { error: vi.fn(), warn: vi.fn() } }));

import { ToastProvider } from '../../library/ui/Toast';
import { HybridRaceTaggerInput } from '../HybridRaceTaggerInput';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}

describe('HybridRaceTaggerInput', () => {
  it('renders without crashing with empty laps/presets', () => {
    const { container } = render(
      <HybridRaceTaggerInput lapsJson="[]" presetsJson="[]" value="" onChange={vi.fn()} />,
      { wrapper: Wrapper }
    );
    expect(container).toBeTruthy();
  });

  it('renders with parsed laps and presets', () => {
    const laps = JSON.stringify([{ index: 0, duration: 90, distance: 1000 }]);
    const presets = JSON.stringify([{ id: 'hyrox', name: 'Hyrox' }]);
    const { container } = render(
      <HybridRaceTaggerInput lapsJson={laps} presetsJson={presets} value="" onChange={vi.fn()} />,
      { wrapper: Wrapper }
    );
    expect(container.firstChild).not.toBeNull();
  });
});
